//
//  Keychain.swift
//  Vault
//
//  Created by Mike Godenzi on 07.08.19.
//  Copyright © 2019 Mike Godenzi. All rights reserved.
//

import Foundation
import Security
import LocalAuthentication

extension VaultError.Domain {
    static let keychain: Self = "Keychain"
}

extension VaultError.Code {
    static let keyGenerationFailure: Self = -100
    static let accessFlagsFailure: Self = -101
    static let osStatus: Self = -102
    static let publicKeyCopyFailure: Self = -103
    static let encryptionFailure: Self = -104
    static let decryptionFailure: Self = -105
    static let itemNotFound: Self = -106
}

extension VaultError {
    static let keyGenerationFailure = VaultError(domain: .keychain, code: .keyGenerationFailure, message: "Failed to generate random key")
    static let accessFlagsFailure = VaultError(domain: .keychain, code: .accessFlagsFailure, message: "Failed to create access flags")
    static let publicKeyCopyFailure = VaultError(domain: .keychain, code: .publicKeyCopyFailure, message: "Failed to retrieve public key")
    static let encryptionFailure = VaultError(domain: .keychain, code: .encryptionFailure, message: "Failed to encrypt data")
    static let decryptionFailure = VaultError(domain: .keychain, code: .decryptionFailure, message: "Failed to decrypt data")
    static let itemNotFound = VaultError(domain: .keychain, code: .itemNotFound, message: "Item not found")

    static func osStatus(_ status: OSStatus) -> Self {
        switch status {
        case errSecItemNotFound:
            return .itemNotFound
        default:
            return .init(domain: .keychain, code: .osStatus, message: "Keychain operation failed with status: \(status)")
        }
    }
}

public enum Keychain {

    public class Password {

        public var data: Data
        public let account: String
        public let service: String?
        public var accessControl: SecAccessControl
        public var accessGroup: String?
        public let created: Date?
        public let modified: Date?

        public init(data: Data, account: String, service: String? = nil, accessControl: SecAccessControlCreateFlags = [], protection: Protection = .whenPasscodeSetThisDeviceOnly, accessGroup: String? = nil) {
            self.data = data
            self.account = account
            self.service = service
            self.accessControl = SecAccessControlCreateWithFlags(nil, protection.value, accessControl, nil)!
            self.accessGroup = accessGroup
            self.created = nil
            self.modified = nil
        }

        init(data: Data, account: String, service: String? = nil, accessControl: SecAccessControl, accessGroup: String? = nil, created: Date? = nil, modified: Date? = nil) {
            self.data = data
            self.account = account
            self.service = service
            self.accessControl = accessControl
            self.accessGroup = accessGroup
            self.created = created
            self.modified = modified
        }
    }

    public class PrivateKey {

        private let key: SecKey

        public init(tag: Data, accessControl: SecAccessControlCreateFlags = [], protection: Keychain.Protection = .whenPasscodeSetThisDeviceOnly, using context: LAContext? = nil) throws {
            var error: Unmanaged<CFError>? = nil
            guard let access = SecAccessControlCreateWithFlags(kCFAllocatorDefault, protection.value, accessControl, &error) else {
                throw VaultError.accessFlagsFailure
            }

            var attributes: [String: Any] = [
                kSecAttrKeyType as String: kSecAttrKeyTypeECSECPrimeRandom,
                kSecAttrKeySizeInBits as String: 256,
                kSecAttrTokenID as String: kSecAttrTokenIDSecureEnclave,
                kSecPrivateKeyAttrs as String: [
                    kSecAttrIsPermanent as String: true,
                    kSecAttrApplicationTag as String: tag,
                    kSecAttrAccessControl as String: access
                ]
            ]

            if let context = context {
                attributes[kSecUseAuthenticationContext as String] = context
            }

            guard let key = SecKeyCreateRandomKey(attributes as CFDictionary, &error) else {
                throw VaultError.keyGenerationFailure
            }

            self.key = key
        }

        private init(_ key: SecKey) {
            self.key = key
        }
    }

    public struct Protection {
        public static let whenUnlocked = Protection(value: kSecAttrAccessibleWhenUnlocked)
        public static let afterFirstUnlock = Protection(value: kSecAttrAccessibleAfterFirstUnlock)
        public static let whenPasscodeSetThisDeviceOnly = Protection(value: kSecAttrAccessibleWhenPasscodeSetThisDeviceOnly)
        public static let whenUnlockedThisDeviceOnly = Protection(value: kSecAttrAccessibleWhenUnlockedThisDeviceOnly)
        public static let afterFirstUnlockThisDeviceOnly = Protection(value: kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly)

        fileprivate let value: CFString

        private init(value: CFString) {
            self.value = value
        }
    }
}

extension Keychain.Password {

    public func save() throws {
        var attributes: [AnyHashable:Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: account,
            kSecAttrAccessControl as String: accessControl,
            kSecValueData as String: data as CFData
        ]
        if let service = self.service {
            attributes[kSecAttrService as String] = service
        }
        if let accessGroup = accessGroup {
            attributes[kSecAttrAccessGroup as String] = accessGroup
        }

        var status = SecItemAdd(attributes as CFDictionary, nil)
        guard !status.isSuccess else {
            return
        }
        guard status == errSecDuplicateItem else {
            throw VaultError.osStatus(status)
        }
        var query: [AnyHashable:Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: account
        ]
        if let service = self.service {
            query[kSecAttrService as String] = service
        }
        var toUpdate: [AnyHashable:Any] = [
            kSecAttrAccessControl as String: accessControl,
            kSecValueData as String: data as CFData
        ]
        if let accessGroup = accessGroup {
            toUpdate[kSecAttrAccessGroup as String] = accessGroup
        }
        status = SecItemUpdate(query as CFDictionary, toUpdate as CFDictionary)
        if !status.isSuccess {
            throw VaultError.osStatus(status)
        }
    }

    public func delete() throws {
        try Keychain.Password.delete(account: account, service: service)
    }

    public static func load(account: String, service: String? = nil, using context: LAContext? = nil) throws -> Keychain.Password {
        let attributes = try load(account: account, service: service, includeData: true, using: context)
        return Keychain.Password(
            data: attributes[kSecValueData as String] as! Data,
            account: attributes[kSecAttrAccount as String] as! String,
            service: attributes[kSecAttrService as String] as? String,
            accessControl: attributes[kSecAttrAccessControl as String] as! SecAccessControl,
            accessGroup: attributes[kSecAttrAccessGroup as String] as? String,
            created: attributes[kSecAttrCreationDate as String] as? Date,
            modified: attributes[kSecAttrModificationDate as String] as? Date
        )
    }

    public static func load(account: String, service: String? = nil, includeData returnData: Bool, using context: LAContext? = nil) throws -> [AnyHashable:Any] {
        var query: [AnyHashable:Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: account,
            kSecMatchLimit as String: kSecMatchLimitOne,
            kSecReturnAttributes as String: true,
            kSecReturnData as String: returnData
        ]
        if let service = service {
            query[kSecAttrService as String] = service
        }
        if let context = context {
            query[kSecUseAuthenticationContext as String] = context
        }
        var result: CFTypeRef?
        let status = SecItemCopyMatching(query as CFDictionary, &result)
        guard status.isSuccess, let attributes = result as? [AnyHashable:Any] else {
            throw VaultError.osStatus(status)
        }

        return attributes
    }

    public static func delete(account: String, service: String? = nil) throws {
        var query: [AnyHashable:Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: account
        ]
        if let service = service {
            query[kSecAttrService as String] = service
        }
        let status = SecItemDelete(query as CFDictionary)
        guard status.isSuccess else {
            throw VaultError.osStatus(status)
        }
    }
}

extension Keychain.PrivateKey {

    public static func load(tag: Data, using context: LAContext? = nil) throws -> Keychain.PrivateKey {
        var query: [AnyHashable:Any] = [
            kSecClass as String: kSecClassKey,
            kSecAttrApplicationTag as String: tag,
            kSecAttrKeyType as String: kSecAttrKeyTypeECSECPrimeRandom,
            kSecReturnRef as String: true
        ]
        if let context = context {
            query[kSecUseAuthenticationContext as String] = context
        }
        var result: CFTypeRef?
        let status = SecItemCopyMatching(query as CFDictionary, &result)
        guard status.isSuccess, let key = result else {
            throw VaultError.osStatus(status)
        }

        return Keychain.PrivateKey(key as! SecKey)
    }

    public static func contains(tag: Data) -> Bool {
        let context = LAContext()
        context.interactionNotAllowed = false
        let query: [AnyHashable:Any] = [
            kSecClass as String: kSecClassKey,
            kSecAttrApplicationTag as String: tag,
            kSecAttrKeyType as String: kSecAttrKeyTypeECSECPrimeRandom,
            kSecReturnAttributes as String: true,
            kSecUseAuthenticationContext as String: context
        ]
        var result: CFTypeRef?
        let status = SecItemCopyMatching(query as CFDictionary, &result)
        return status.isSuccess || status == errSecInteractionNotAllowed
    }

    public static func delete(tag: Data) -> Bool {
        let query: [AnyHashable:Any] = [
            kSecClass as String: kSecClassKey,
            kSecAttrApplicationTag as String: tag,
            kSecAttrKeyType as String: kSecAttrKeyTypeECSECPrimeRandom
        ]
        let status = SecItemDelete(query as CFDictionary)
        return status.isSuccess || status == errSecItemNotFound
    }

    private func copyPublicKey() throws -> SecKey {
        guard let result = SecKeyCopyPublicKey(key) else {
            throw VaultError.publicKeyCopyFailure
        }
        return result
    }

    public func encrypt(data: Data) throws -> Data {
        let publicKey = try copyPublicKey()
        var error: Unmanaged<CFError>? = nil
        guard let encryptedData = SecKeyCreateEncryptedData(publicKey, .eciesEncryptionStandardX963SHA256AESGCM, data as CFData, &error) else {
            throw VaultError.encryptionFailure
        }
        return encryptedData as Data
    }

    public func decrypt(data: Data) throws -> Data {
        var error: Unmanaged<CFError>? = nil
        guard let decryptedData = SecKeyCreateDecryptedData(key, .eciesEncryptionStandardX963SHA256AESGCM, data as CFData, &error) else {
            throw VaultError.decryptionFailure
        }
        return decryptedData as Data
    }
}

private extension OSStatus {

    var isSuccess: Bool { return self == errSecSuccess }
}
