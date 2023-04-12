//
//  IsolatedModules.swift
//  App
//
//  Created by Julia Samol on 08.09.22.
//

import Foundation
import Capacitor
import WebKit

@objc(IsolatedModules)
public class IsolatedModules: CAPPlugin {
    private let fileExplorer: FileExplorer = .shared
    private lazy var jsEvaluator: JSEvaluator = .init(fileExplorer: fileExplorer)
    
    @objc func previewDynamicModule(_ call: CAPPluginCall) {
        call.assertReceived(forMethod: "previewModule", requiredParams: Param.PATH, Param.DIRECTORY)
        
        do {
            guard let path = call.path, let directory = call.directory else {
                throw Error.invalidData
            }
            
            Task {
                do {
                    let module = try fileExplorer.loadPreviewModule(atPath: path, locatedIn: directory)
                    let manifest = try fileExplorer.readModuleManifest(.preview(module))
                    let moduleJSON = try await jsEvaluator.evaluatePreviewModule(
                        .preview(module),
                        ignoringProtocols: call.ignoreProtocols
                    )
                    
                    call.resolve([
                        "module": moduleJSON,
                        "manifest": try JSONSerialization.jsonObject(with: manifest)
                    ])
                } catch {
                    call.reject("Error: \(error)")
                }
            }
        } catch {
            call.reject("Error: \(error)")
        }
    }
    
    @objc func registerDynamicModule(_ call: CAPPluginCall) {
        call.assertReceived(forMethod: "registerModule", requiredParams: Param.IDENTIFIER, Param.PROTOCOL_IDENTIFIERS)
        
        do {
            guard let identifier = call.identifier, let protocolIdentifiers = call.protocolIdentifiers else {
                throw Error.invalidData
            }
            
            Task {
                do {
                    let module = try fileExplorer.loadInstalledModule(identifier)
                    await jsEvaluator.registerModule(.installed(module), forProtocols: protocolIdentifiers)
                    
                    call.resolve()
                } catch {
                    call.reject("Error: \(error)")
                }
            }
        } catch {
            call.reject("Error: \(error)")
        }
    }
    
    @objc func readDynamicModule(_ call: CAPPluginCall) {
        call.assertReceived(forMethod: "readDynamicModule", requiredParams: Param.IDENTIFIER)
        
        do {
            guard let identifier = call.identifier else {
                throw Error.invalidData
            }
            
            Task {
                do {
                    let module = try fileExplorer.loadInstalledModule(identifier)
                    let manifest = try fileExplorer.readModuleManifest(.installed(module))
                    
                    call.resolve([
                        "manifest": try JSONSerialization.jsonObject(with: manifest),
                        "installedAt": "\(module.installedAt)"
                    ])
                } catch {
                    call.reject("Error: \(error)")
                }
            }
        } catch {
            call.reject("Error: \(error)")
        }
    }
    
    @objc func removeDynamicModules(_ call: CAPPluginCall) {
        Task {
            do {
                if let identifiers = call.identifiers {
                    try fileExplorer.removeModules(identifiers)
                    await jsEvaluator.deregisterModules(identifiers)
                } else {
                    try fileExplorer.removeAllModules()
                    await jsEvaluator.deregisterAllModules()
                }
                call.resolve()
            } catch {
                call.reject("Error: \(error)")
            }
        }
    }
    
    @objc func loadAllModules(_ call: CAPPluginCall) {
        Task {
            do {
                let protocolType = call.protocolType
                let modules: [JSModule] = try fileExplorer.loadAssetModules().map({ .asset($0) }) + (try fileExplorer.loadInstalledModules().map({ .installed($0) }))
                
                call.resolve(
                    try await jsEvaluator.evaluateLoadModules(
                        modules,
                        for: protocolType,
                        ignoringProtocols: call.ignoreProtocols
                    )
                )
            } catch {
                call.reject("Error: \(error)")
            }
        }
    }
    
    @objc func callMethod(_ call: CAPPluginCall) {
        call.assertReceived(forMethod: "callMethod", requiredParams: Param.TARGET, Param.METHOD)
        
        do {
            guard let target = call.target, let method = call.method else {
                throw Error.invalidData
            }
            
            Task {
                do {
                    switch target {
                    case .offlineProtocol:
                        call.assertReceived(forMethod: "callMethod", requiredParams: Param.PROTOCOL_IDENTIFIER)
                        
                        guard let protocolIdentifier = call.protocolIdentifier else {
                            throw Error.invalidData
                        }
                        
                        let args = call.args
                        
                        call.resolve(
                            try await jsEvaluator.evaluateCallOfflineProtocolMethod(method, ofProtocol: protocolIdentifier, withArgs: args)
                        )
                    case .onlineProtocol:
                        call.assertReceived(forMethod: "callMethod", requiredParams: Param.PROTOCOL_IDENTIFIER)
                        
                        guard let protocolIdentifier = call.protocolIdentifier else {
                            throw Error.invalidData
                        }
                        
                        let args = call.args
                        let networkID = call.networkID
                        
                        call.resolve(
                            try await jsEvaluator.evaluateCallOnlineProtocolMethod(method, ofProtocol: protocolIdentifier, onNetwork: networkID, withArgs: args)
                        )
                    case .blockExplorer:
                        call.assertReceived(forMethod: "callMethod", requiredParams: Param.PROTOCOL_IDENTIFIER)
                        
                        guard let protocolIdentifier = call.protocolIdentifier else {
                            throw Error.invalidData
                        }
                        
                        let args = call.args
                        let networkID = call.networkID
                        
                        call.resolve(
                            try await jsEvaluator.evaluateCallBlockExplorerMethod(method, ofProtocol: protocolIdentifier, onNetwork: networkID, withArgs: args)
                        )
                    case .v3SerializerCompanion:
                        call.assertReceived(forMethod: "callMethod", requiredParams: Param.MODULE_IDENTIFIER)
                        
                        guard let moduleIdentifier = call.moduleIdentifier else {
                            throw Error.invalidData
                        }
                        
                        let args = call.args
                        
                        call.resolve(
                            try await jsEvaluator.evaluateCallV3SerializerCompanionMethod(method, ofModule: moduleIdentifier, withArgs: args)
                        )
                    }
                } catch {
                    call.reject("Error: \(error)")
                }
            }
        } catch {
            call.reject("Error: \(error)")
        }
    }
    
    @objc func batchCallMethod(_ call: CAPPluginCall) {
        call.assertReceived(forMethod: "batchCallMethod", requiredParams: Param.OPTIONS)
        
        do {
            guard let options = call.options else {
                throw Error.invalidData
            }
            
            Task {
                do {
                    let values = try await self.jsEvaluator.singleRun { runRef in
                        try await options.asyncMap { jsValue in
                            do {
                                guard let jsObject = jsValue as? JSObject else {
                                    throw Error.invalidData
                                }
                                
                                call.assertReceived(in: jsObject, forMethod: "batchCallMethod", requiredParams: Param.TARGET, Param.METHOD)
                                
                                guard let targetRaw = jsObject[Param.TARGET] as? String,
                                      let target = JSCallMethodTarget.init(rawValue: targetRaw),
                                      let method = jsObject[Param.METHOD] as? String else {
                                    throw Error.invalidData
                                }
                                
                                let args = jsObject[Param.ARGS] as? JSArray
                                let protocolIdentifier = jsObject[Param.PROTOCOL_IDENTIFIER] as? String
                                let networkID = jsObject[Param.NETWORK_ID] as? String
                                let moduleIdentifier = jsObject[Param.MODULE_IDENTIFIER] as? String
                                
                                let value = try await {
                                    switch target {
                                    case .offlineProtocol:
                                        call.assertReceived(in: jsObject, forMethod: "batchCallMethod", requiredParams: Param.PROTOCOL_IDENTIFIER)
                                        
                                        guard let protocolIdentifier = protocolIdentifier else {
                                            throw Error.invalidData
                                        }
                                        
                                        return try await self.jsEvaluator.evaluateCallOfflineProtocolMethod(
                                            method,
                                            ofProtocol: protocolIdentifier,
                                            withArgs: args,
                                            runRef: runRef
                                        )
                                    case .onlineProtocol:
                                        call.assertReceived(in: jsObject, forMethod: "batchCallMethod", requiredParams: Param.PROTOCOL_IDENTIFIER)
                                        
                                        guard let protocolIdentifier = protocolIdentifier else {
                                            throw Error.invalidData
                                        }
                                        
                                        return try await self.jsEvaluator.evaluateCallOnlineProtocolMethod(
                                            method,
                                            ofProtocol: protocolIdentifier,
                                            onNetwork: networkID,
                                            withArgs: args,
                                            runRef: runRef
                                        )
                                    case .blockExplorer:
                                        call.assertReceived(in: jsObject, forMethod: "batchCallMethod", requiredParams: Param.PROTOCOL_IDENTIFIER)
                                        
                                        guard let protocolIdentifier = protocolIdentifier else {
                                            throw Error.invalidData
                                        }
                                        
                                        return try await self.jsEvaluator.evaluateCallBlockExplorerMethod(
                                            method,
                                            ofProtocol: protocolIdentifier,
                                            onNetwork: networkID,
                                            withArgs: args,
                                            runRef: runRef
                                        )
                                    case .v3SerializerCompanion:
                                        call.assertReceived(in: jsObject, forMethod: "batchCallMethod", requiredParams: Param.MODULE_IDENTIFIER)
                                        
                                        guard let moduleIdentifier = moduleIdentifier else {
                                            throw Error.invalidData
                                        }
                                        
                                        return try await self.jsEvaluator.evaluateCallV3SerializerCompanionMethod(
                                            method,
                                            ofModule: moduleIdentifier,
                                            withArgs: args,
                                            runRef: runRef
                                        )
                                    }
                                }()
                                
                                return [
                                    "type": "success",
                                    "value": value["value"]
                                ]
                            } catch {
                                return [
                                    "type": "error",
                                    "error": "\(error)"
                                ]
                            }
                        }
                    }
                    
                    call.resolve([
                        "values": values
                    ])
                } catch {
                    call.reject("Error: \(error)")
                }
            }
        } catch {
            call.reject("Error: \(error)")
        }
    }
    
    struct Param {
        static let PATH = "path"
        static let DIRECTORY = "directory"
        static let IDENTIFIER = "identifier"
        static let IDENTIFIERS = "identifiers"
        static let PROTOCOL_IDENTIFIERS = "protocolIdentifiers"
        static let PROTOCOL_TYPE = "protocolType"
        static let IGNORE_PROTOCOLS = "ignoreProtocols"
        static let TARGET = "target"
        static let METHOD = "method"
        static let ARGS = "args"
        static let PROTOCOL_IDENTIFIER = "protocolIdentifier"
        static let MODULE_IDENTIFIER = "moduleIdentifier"
        static let NETWORK_ID = "networkId"
        static let OPTIONS = "options"
    }
    
    enum Error: Swift.Error {
        case invalidData
    }
}

private extension CAPPluginCall {
    var path: String? { return getString(IsolatedModules.Param.PATH) }
    
    var directory: Directory? {
        guard let directory = getString(IsolatedModules.Param.DIRECTORY) else { return nil }
        return .init(rawValue: directory)
    }
    
    var identifier: String? { return getString(IsolatedModules.Param.IDENTIFIER) }
    var identifiers: [String]? {
        return getArray(IsolatedModules.Param.IDENTIFIERS)?.compactMap {
            if let string = $0 as? String {
                return string
            } else {
                return nil
            }
        }
    }
    var protocolIdentifiers: [String]? {
        return getArray(IsolatedModules.Param.PROTOCOL_IDENTIFIERS)?.compactMap {
            if let string = $0 as? String {
                return string
            } else {
                return nil
            }
        }
    }
    
    var protocolType: JSProtocolType? {
        guard let protocolType = getString(IsolatedModules.Param.PROTOCOL_TYPE) else { return nil }
        return .init(rawValue: protocolType)
    }
    
    var ignoreProtocols: [String]? {
        return getArray(IsolatedModules.Param.IGNORE_PROTOCOLS)?.compactMap {
            if let string = $0 as? String {
                return string
            } else {
                return nil
            }
        }
    }
    
    var target: JSCallMethodTarget? {
        guard let target = getString(IsolatedModules.Param.TARGET) else { return nil }
        return .init(rawValue: target)
    }
    
    var method: String? { return getString(IsolatedModules.Param.METHOD) }
    var args: JSArray? { return getArray(IsolatedModules.Param.ARGS) }
    
    var protocolIdentifier: String? { return getString(IsolatedModules.Param.PROTOCOL_IDENTIFIER) }
    var moduleIdentifier: String? { return getString(IsolatedModules.Param.MODULE_IDENTIFIER) }
    
    var networkID: String? { return getString(IsolatedModules.Param.NETWORK_ID) }
    
    var options: JSArray? { return getArray(IsolatedModules.Param.OPTIONS) }
}
