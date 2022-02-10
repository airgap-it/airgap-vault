//
//  SecureStorage.swift
//  SecureStorage
//
//  Created by Alessandro De Carli on 23.02.18.
//  Copyright © 2018 ___Alessandro De Carli___. All rights reserved.
//

import Foundation
import Security
import LocalAuthentication

extension VaultError.Domain {
    static let secureStorage: Self = "SecureStorage"
}

extension VaultError.Code {
    static let dataConversionFailure: Self = -200
    static let stringConversionFailure: Self = -201
    static let diar: Self = -202
}

extension VaultError {
    static let dataConversionFailure = VaultError(domain: .secureStorage, code: .dataConversionFailure, message: "Data conversion failure")
    static let stringConversionFailure = VaultError(domain: .secureStorage, code: .stringConversionFailure, message: "String conversion failure")

    static func diar(_ result: DeviceIntegrity.ResultSet) -> Self {
        .init(domain: .secureStorage, code: .diar, message: "Device integrity check failed (\(result.rawValue))")
    }
}

class SecureStorage {

    let tag: Data
    let paranoiaMode: Bool
    var accessControlFlags: SecAccessControlCreateFlags {
        var flags: SecAccessControlCreateFlags = LocalAuthentication.defaultAccessFlags()
        flags.insert(.privateKeyUsage)
        if (paranoiaMode){
            flags.insert(.applicationPassword)
        }
        return flags
    }

    init(tag: Data, paranoiaMode: Bool = false){
        self.tag = tag
        self.paranoiaMode = paranoiaMode
    }

    private func generateNewBiometricSecuredKey(using context: LAContext, completion: (Result<Keychain.PrivateKey, VaultError>) -> ()) -> Bool {
        do {
            let key = try Keychain.PrivateKey(tag: tag, accessControl: accessControlFlags, using: context)
            completion(.success(key))
            return true
        } catch {
            return false
        }
    }

    private func fetchSecretKey(using context: LAContext, completion: @escaping (Result<Keychain.PrivateKey, VaultError>) -> ()) -> Bool {
        do {
            let key = try Keychain.PrivateKey.load(tag: self.tag, using: context)
            completion(.success(key))
            return true
        } catch {
            return false
        }
    }

    @inline(__always) private func fetchBiometricSecuredKey(completion: @escaping (Result<Keychain.PrivateKey, VaultError>) -> ()) {
        DeviceIntegrity.assess { result in
            guard result == .ok else {
                completion(.failure(VaultError.diar(result)))
                return
            }
            let needsKeyGeneration = !Keychain.PrivateKey.contains(tag: self.tag)
            var prompts = [LocalAuthentication.PasswordPrompt]()
            if self.paranoiaMode {
                if needsKeyGeneration {
                    prompts += [
                        LocalAuthentication.PasswordPrompt(title: "Set Encryption Password", message: "Please choose your encryption password"),
                        LocalAuthentication.PasswordPrompt(title: "Set Encryption Password", message: "Please confirm your encryption password")
                    ]
                } else {
                    prompts.append(LocalAuthentication.PasswordPrompt(title: "Encryption Password", message: "Please provide your encryption password"))
                }
            }
            LocalAuthentication.shared.fetchContextForSecureItemAccess(using: prompts) { result -> Bool in
                switch result {
                case let .success(context):
                    if needsKeyGeneration {
                        return self.generateNewBiometricSecuredKey(using: context, completion: completion)
                    } else {
                        return self.fetchSecretKey(using: context, completion: completion)
                    }
                case let .failure(error):
                    completion(.failure(error))
                }
                return false
            }
        }
    }
    
    func dropSecuredKey() -> Bool {
        return Keychain.PrivateKey.delete(tag: tag)
    }

    func store(key: String, value: String, completion: @escaping (VaultError?) -> ()) {
        fetchBiometricSecuredKey { result in
            switch result {
            case let .success(secretKey):
                do {
                    try self.store(key: key, value: value, using: secretKey)
                    completion(nil)
                } catch {
                    completion(VaultError(domain: .secureStorage, other: error))
                }
            case let .failure(error):
                completion(error)
            }
        }
    }

    private func store(key: String, value: String, using secretKey: Keychain.PrivateKey) throws {
        guard let messageData = value.data(using: .utf8) else {
            throw VaultError.dataConversionFailure
        }
        let encryptedData = try secretKey.encrypt(data: messageData)
        let item = Keychain.Password(data: encryptedData, account: key)
        try item.save()
    }

    func retrieve(key: String, completion: @escaping (Result<String, VaultError>) -> ()) {
        fetchBiometricSecuredKey { result in
            switch result {
            case let .success(secretKey):
                do {
                    let value = try self.retrieve(key: key, using: secretKey)
                    completion(.success(value))
                } catch {
                    completion(.failure(VaultError(domain: .secureStorage, other: error)))
                }
            case let .failure(error):
                completion(.failure(error))
            }
        }
    }
    
    private func retrieve(key: String, using secretKey: Keychain.PrivateKey) throws -> String {
        let item = try Keychain.Password.load(account: key)
        let decryptedData = try secretKey.decrypt(data: item.data)
        guard let result = String(data: decryptedData as Data, encoding: .utf8) else {
            throw VaultError.stringConversionFailure
        }
        return result
    }

    func delete(key: String) throws {
        try Keychain.Password.delete(account: key)
    }
    
    static func delete() throws {
        try Keychain.Password.delete()
        _ = Keychain.PrivateKey.delete()
    }
}
