//
//  JSEvaluator.swift
//  App
//
//  Created by Julia Samol on 06.02.23.
//

import Foundation
import Capacitor
import WebKit

class JSEvaluator {
    private let webViewEnv: WebViewEnvironment
    private let modulesManager: ModulesManager
    
    init(fileExplorer: FileExplorer) {
        self.webViewEnv = .init(fileExplorer: fileExplorer)
        self.modulesManager = .init()
    }
    
    func registerModule(_ module: JSModule, forProtocols protocolIdentifiers: [String]) async {
        await modulesManager.registerModule(module, forProtocols: protocolIdentifiers)
    }
    
    func deregisterModules(_ identifiers: [String]) async {
        await modulesManager.deregisterModules(identifiers)
    }
    
    func deregisterAllModules() async {
        await modulesManager.deregisterAllModules()
    }
    
    func evaluatePreviewModule(
        _ module: JSModule,
        ignoringProtocols ignoreProtocols: [String]?,
        keepEnvironment: Bool = false
    ) async throws -> [String: Any] {
        return try await self.webViewEnv.run(
            .load(.init(protocolType: nil, ignoreProtocols: ignoreProtocols)),
            in: module,
            keepAlive: keepEnvironment
        )
    }
    
    func evaluateLoadModules(
        _ modules: [JSModule],
        for protocolType: JSProtocolType?,
        ignoringProtocols ignoreProtocols: [String]?,
        keepEnvironment: Bool = false
    ) async throws -> [String: Any] {
        let modulesJSON = try await modules.asyncMap { module -> [String : Any] in
            let json = try await self.webViewEnv.run(
                .load(.init(protocolType: protocolType, ignoreProtocols: ignoreProtocols)),
                in: module,
                keepAlive: keepEnvironment
            )
            try await self.modulesManager.registerModule(module, forJSON: json)
            
            return json
        }
        
        return ["modules": modulesJSON]
    }
    
    func evaluateCallOfflineProtocolMethod(
        _ name: String,
        ofProtocol protocolIdentifier: String,
        withArgs args: JSArray?,
        keepEnvironment: Bool = false
    ) async throws -> [String: Any] {
        let modules = await modulesManager.modules
        guard let module = modules[protocolIdentifier] else {
            throw Error.moduleNotFound(protocolIdentifier)
        }
        
        return try await webViewEnv.run(
            .callMethod(
                .offlineProtocol(
                    .init(name: name, args: args, protocolIdentifier: protocolIdentifier)
                )
            ),
            in: module,
            keepAlive: keepEnvironment
        )
    }
    
    func evaluateCallOnlineProtocolMethod(
        _ name: String,
        ofProtocol protocolIdentifier: String,
        onNetwork networkID: String?,
        withArgs args: JSArray?,
        keepEnvironment: Bool = false
    ) async throws -> [String: Any] {
        let modules = await modulesManager.modules
        guard let module = modules[protocolIdentifier] else {
            throw Error.moduleNotFound(protocolIdentifier)
        }
        
        return try await webViewEnv.run(
            .callMethod(
                .onlineProtocol(
                    .init(name: name, args: args, protocolIdentifier: protocolIdentifier, networkID: networkID)
                )
            ),
            in: module,
            keepAlive: keepEnvironment
        )
    }
    
    func evaluateCallBlockExplorerMethod(
        _ name: String,
        ofProtocol protocolIdentifier: String,
        onNetwork networkID: String?,
        withArgs args: JSArray?,
        keepEnvironment: Bool = false
    ) async throws -> [String: Any] {
        let modules = await modulesManager.modules
        guard let module = modules[protocolIdentifier] else {
            throw Error.moduleNotFound(protocolIdentifier)
        }
        
        return try await webViewEnv.run(
            .callMethod(
                .blockExplorer(
                    .init(name: name, args: args, protocolIdentifier: protocolIdentifier, networkID: networkID)
                )
            ),
            in: module,
            keepAlive: keepEnvironment
        )
    }
    
    func evaluateCallV3SerializerCompanionMethod(
        _ name: String,
        ofModule moduleIdentifier: String,
        withArgs args: JSArray?,
        keepEnvironment: Bool = false
    ) async throws -> [String: Any] {
        let modules = await modulesManager.modules
        guard let module = modules[moduleIdentifier] else {
            throw Error.moduleNotFound(moduleIdentifier)
        }
        
        return try await webViewEnv.run(
            .callMethod(
                .v3SerializerCompanion(
                    .init(name: name, args: args)
                )
            ),
            in: module,
            keepAlive: keepEnvironment
        )
    }
    
    func reset() async throws {
        try await webViewEnv.reset()
    }
    
    func destroy() async throws {
        try await webViewEnv.destroy()
    }
    
    private actor ModulesManager {
        private(set) var modules: [String: JSModule] = [:]
        
        func registerModule(_ module: JSModule, forJSON json: [String: Any]) throws {
            guard let protocols = json["protocols"] as? [Any] else {
                throw Error.invalidJSON
            }
            
            let protocolIdentifiers = try protocols.map { `protocol` -> String in
                guard let `protocol` = `protocol` as? [String: Any], let identifier = `protocol`["identifier"] as? String else {
                    throw Error.invalidJSON
                }
                
                return identifier
            }
            
            registerModule(module, forProtocols: protocolIdentifiers)
        }
        
        func registerModule(_ module: JSModule, forProtocols protocolIdentifiers: [String]) {
            modules[module.identifier] = module
            protocolIdentifiers.forEach { identifier in modules[identifier] = module }
        }
        
        func deregisterModules(_ identifiers: [String]) {
            identifiers.forEach { modules.removeValue(forKey: $0) }
        }
        
        func deregisterAllModules() {
            modules.removeAll()
        }
    }
    
    enum Error: Swift.Error {
        case moduleNotFound(String)
        case invalidJSON
    }
}
