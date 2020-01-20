//
//  SecurityUtils.swift
//  App
//
//  Created by Julia Samol on 20.01.20.
//

import Foundation
import Capacitor
import UIKit
import LocalAuthentication

@objc(SecurityUtils)
public class SecurityUtils: CAPPlugin {
    
    private lazy var queue: OperationQueue = {
        let queue = OperationQueue()
        queue.maxConcurrentOperationCount = 1
        queue.name = "it.airgap.SecureStorageQueue"
        
        return queue
    }()
    
    // MARK: - Device Integrity
    
    @objc func assessDeviceIntegrity(_ call: CAPPluginCall) {
        DeviceIntegrity.assess { assessment in
            call.resolve([Key.VALUE: assessment == .ok])
        }
    }
    
    // MARK: - Local Authentication
    
    @objc func authenticate(_ call: CAPPluginCall) {
        LocalAuthentication.shared.authenticate(localizedReason: call.reason) { result in
            switch result {
            case .success(_):
                call.resolve()
            case let .failure(error):
                call.reject(error.localizedDescription)
            }
        }
    }
    
    @objc func setInvalidationTimeout(_ call: CAPPluginCall) {
        call.assertReceived(forMethod: "LocalAuthentication_setInvalidTimeout", requiredParams: Param.TIMEOUT)
        LocalAuthentication.shared.invalidateAfter = TimeInterval(call.timeout)
        call.resolve()
    }
    
    @objc func invalidate(_ call: CAPPluginCall) {
        LocalAuthentication.shared.invalidate {
            call.resolve()
        }
    }
    
    @objc func toggleAutomaticAuthentication(_ call: CAPPluginCall) {
        call.assertReceived(forMethod: "LocalAuthentication_toggleAutomaticAuthentication", requiredParams: Param.AUTOMATIC_AUTHENTICATION)
        LocalAuthentication.shared.automatic = call.automaticAuthentication
        call.resolve()
    }
    
    @objc func setAuthenticationReason(_ call: CAPPluginCall) {
        call.assertReceived(forMethod: "LocalAuthentication_setAuthenticationReason", requiredParams: Param.REASON)
        LocalAuthentication.shared.localizedAuthenticationReason = call.reason!
        call.resolve()
    }
    
    // MARK: - Secure Storage
    
    @objc func initStorage(_ call: CAPPluginCall) {
        queue.addOperation {
            call.assertReceived(forMethod: "SecureStorage_initStorage", requiredParams: Param.ALIAS, Param.IS_PARANOIA)
            _ = self.storage(forAlias: call.alias, isParanoia: call.isParanoia)
            
            call.resolve()
        }
    }
    
    @objc func isDeviceSecure(_ call: CAPPluginCall) {
        queue.addOperation {
            let result = LAContext().canEvaluatePolicy(.deviceOwnerAuthentication, error: nil)
            call.resolve([Key.VALUE: result])
        }
    }
    
    @objc func secureDevice(_ call: CAPPluginCall) {
        queue.addOperation {
            guard let settingsUrl = URL(string: UIApplication.openSettingsURLString) else {
                call.reject("Cannot open settings")
                return
            }
            
            if (UIApplication.shared.canOpenURL(settingsUrl)) {
                UIApplication.shared.open(settingsUrl) { success in
                    print("Settings opened: \(success)")
                }
            }
            
            call.resolve()
        }
    }
    
    @objc func removeAll(_ call: CAPPluginCall) {
        queue.addOperation {
            call.assertReceived(forMethod: "SecureStorage_removeAll", requiredParams: Param.ALIAS, Param.IS_PARANOIA)
            
            let secureStorage = self.storage(forAlias: call.alias, isParanoia: call.isParanoia)
            _ = secureStorage.dropSecuredKey()
            
            call.resolve()
        }
    }
    
    @objc func removeItem(_ call: CAPPluginCall) {
        queue.addOperation {
            call.assertReceived(forMethod: "SecureStorage_removeItem", requiredParams: Param.ALIAS, Param.IS_PARANOIA, Param.KEY)
            
            let secureStorage = self.storage(forAlias: call.alias, isParanoia: call.isParanoia)
            do {
                try secureStorage.delete(key: call.key)
                call.resolve()
            } catch {
                call.reject(error.localizedDescription)
            }
        }
    }
    
    @objc func setItem(_ call: CAPPluginCall) {
        queue.addOperation {
            call.assertReceived(forMethod: "SecureStorage_setItem", requiredParams: Param.ALIAS, Param.IS_PARANOIA, Param.KEY, Param.VALUE)
            
            let secureStorage = self.storage(forAlias: call.alias, isParanoia: call.isParanoia)
            secureStorage.store(key: call.key, value: call.value) { error in
                if let error = error {
                    call.reject(error.localizedDescription)
                } else {
                    call.resolve()
                }
            }
        }
    }
    
    @objc func getItem(_ call: CAPPluginCall) {
        queue.addOperation {
            call.assertReceived(forMethod: "SecureStorage_getItem", requiredParams: Param.ALIAS, Param.IS_PARANOIA, Param.KEY)
            
            let secureStorage = self.storage(forAlias: call.alias, isParanoia: call.isParanoia)
            secureStorage.retrieve(key: call.key) { result in
                switch result {
                case let .success(value):
                    call.resolve([Key.VALUE: value])
                case let .failure(error):
                    call.reject(error.localizedDescription)
                }
            }
        }
    }
    
    private func storage(forAlias alias: String, isParanoia: Bool) -> SecureStorage {
        let tag = ("it.airgap.keys.biometrics.key-" + alias).data(using: .utf8)!
        return SecureStorage(tag: tag, paranoiaMode: isParanoia)
    }
    
    struct Param {
        static let REASON = "reason"
        static let TIMEOUT = "timeout"
        static let AUTOMATIC_AUTHENTICATION = "automatic"
        
        static let ALIAS = "alias"
        static let IS_PARANOIA = "isParanoia"
        static let KEY = "key"
        static let VALUE = "value"
    }
    
    struct Key {
        static let VALUE = "value"
    }
}

extension AppDelegate {
    open func application(_ application: UIApplication, shoudlAllowExtensionPointIdentifier extensionPointIdentifier: UIApplication.ExtensionPointIdentifier) -> Bool {
        return extensionPointIdentifier == .keyboard ? false : true
    }
}

private extension CAPPluginCall {
    var reason: String? { return getString(SecurityUtils.Param.REASON) }
    var timeout: Int { return getInt(SecurityUtils.Param.TIMEOUT)! }
    var automaticAuthentication: Bool { return getBool(SecurityUtils.Param.AUTOMATIC_AUTHENTICATION)! }
    
    var alias: String { return getString(SecurityUtils.Param.ALIAS)! }
    var isParanoia: Bool { return getBool(SecurityUtils.Param.IS_PARANOIA)! }
    var key: String { return getString(SecurityUtils.Param.KEY)! }
    var value: String { return getString(SecurityUtils.Param.VALUE)! }
}
