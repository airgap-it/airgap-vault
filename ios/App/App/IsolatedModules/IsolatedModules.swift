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
    
    @objc func previewModule(_ call: CAPPluginCall) {
        call.assertReceived(forMethod: "previewModule", requiredParams: Param.PATH, Param.DIRECTORY)
        
        do {
            guard let path = call.path, let directory = call.directory else {
                throw Error.invalidData
            }
            
            Task {
                do {
                    let module = try fileExplorer.loadPreviewModule(atPath: path, locatedIn: directory)
                    let manifest = try fileExplorer.readModuleManifest(module)
                    let moduleJSON = try await jsEvaluator.evaluatePreviewModule(module)
                    
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
    
    @objc func registerModule(_ call: CAPPluginCall) {
        call.assertReceived(forMethod: "registerModule", requiredParams: Param.IDENTIFIER, Param.PROTOCOL_IDENTIFIERS)
        
        do {
            guard let identifier = call.identifier, let protocolIdentifiers = call.protocolIdentifiers else {
                throw Error.invalidData
            }
            
            Task {
                do {
                    let module = try fileExplorer.loadInstalledModule(identifier)
                    await jsEvaluator.registerModule(module, forProtocols: protocolIdentifiers)
                    
                    call.resolve()
                } catch {
                    call.reject("Error: \(error)")
                }
            }
        } catch {
            call.reject("Error: \(error)")
        }
    }
    
    @objc func loadModules(_ call: CAPPluginCall) {
        Task {
            do {
                let protocolType = call.protocolType
                let modules: [JSModule] = try fileExplorer.loadAssetModules() + (try fileExplorer.loadInstalledModules())
                
                call.resolve(try await jsEvaluator.evaluateLoadModules(modules, for: protocolType))
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
    
    struct Param {
        static let PATH = "path"
        static let DIRECTORY = "directory"
        static let IDENTIFIER = "identifier"
        static let PROTOCOL_IDENTIFIERS = "protocolIdentifiers"
        static let PROTOCOL_TYPE = "protocolType"
        static let TARGET = "target"
        static let METHOD = "method"
        static let ARGS = "args"
        static let PROTOCOL_IDENTIFIER = "protocolIdentifier"
        static let MODULE_IDENTIFIER = "moduleIdentifier"
        static let NETWORK_ID = "networkId"
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
    
    var target: JSCallMethodTarget? {
        guard let target = getString(IsolatedModules.Param.TARGET) else { return nil }
        return .init(rawValue: target)
    }
    
    var method: String? { return getString(IsolatedModules.Param.METHOD) }
    var args: JSArray? { return getArray(IsolatedModules.Param.ARGS)}
    
    var protocolIdentifier: String? { return getString(IsolatedModules.Param.PROTOCOL_IDENTIFIER) }
    var moduleIdentifier: String? { return getString(IsolatedModules.Param.MODULE_IDENTIFIER) }
    
    var networkID: String? { return getString(IsolatedModules.Param.NETWORK_ID) }
}
