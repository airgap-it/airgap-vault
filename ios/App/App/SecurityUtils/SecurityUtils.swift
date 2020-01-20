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
    
    @objc func initStorage(_ call: CAPPluginCall) {
        queue.addOperation {
            call.assertReceived(forMethod: "init", requiredParams: Param.ALIAS, Param.IS_PARANOIA)
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
            call.assertReceived(forMethod: "removeAll", requiredParams: Param.ALIAS, Param.IS_PARANOIA)
            
            let secureStorage = self.storage(forAlias: call.alias, isParanoia: call.isParanoia)
            _ = secureStorage.dropSecuredKey()
            
            call.resolve()
        }
    }
    
    @objc func removeItem(_ call: CAPPluginCall) {
        queue.addOperation {
            call.assertReceived(forMethod: "removeItem", requiredParams: Param.ALIAS, Param.IS_PARANOIA, Param.KEY)
            
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
            call.assertReceived(forMethod: "setItem", requiredParams: Param.ALIAS, Param.IS_PARANOIA, Param.KEY, Param.VALUE)
            
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
            call.assertReceived(forMethod: "getItem", requiredParams: Param.ALIAS, Param.IS_PARANOIA, Param.KEY)
            
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
    var alias: String { return getString(SecurityUtils.Param.ALIAS)! }
    var isParanoia: Bool { return getBool(SecurityUtils.Param.IS_PARANOIA)! }
    var key: String { return getString(SecurityUtils.Param.KEY)! }
    var value: String { return getString(SecurityUtils.Param.VALUE)! }
}
