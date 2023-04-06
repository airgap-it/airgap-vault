//
//  JSModule.swift
//  App
//
//  Created by Julia Samol on 06.02.23.
//

import Foundation
import Capacitor

// MARK: JSModule

enum JSModule {
    case asset(Asset)
    case installed(Installed)
    case preview(Preview)
    
    var identifier: String {
        switch self {
        case .asset(let asset):
            return asset.identifier
        case .installed(let installed):
            return installed.identifier
        case .preview(let preview):
            return preview.identifier
        }
    }
    
    var namespace: String? {
        switch self {
        case .asset(let asset):
            return asset.namespace
        case .installed(let installed):
            return installed.namespace
        case .preview(let preview):
            return preview.namespace
        }
    }
    
    var preferredEnvironment: JSEnvironmentKind {
        switch self {
        case .asset(let asset):
            return asset.preferredEnvironment
        case .installed(let installed):
            return installed.preferredEnvironment
        case .preview(let preview):
            return preview.preferredEnvironment
        }
    }
    
    var sources: [String] {
        switch self {
        case .asset(let asset):
            return asset.sources
        case .installed(let installed):
            return installed.sources
        case .preview(let preview):
            return preview.sources
        }
    }
    
    struct Asset: JSModuleProtocol {
        let identifier: String
        let namespace: String?
        let preferredEnvironment: JSEnvironmentKind
        let sources: [String]
    }
    
    struct Installed: JSModuleProtocol {
        let identifier: String
        let namespace: String?
        let preferredEnvironment: JSEnvironmentKind
        let sources: [String]
        let installedAt: String
    }
    
    struct Preview: JSModuleProtocol {
        let identifier: String
        let namespace: String?
        let preferredEnvironment: JSEnvironmentKind
        let sources: [String]
        let path: URL
    }
}

protocol JSModuleProtocol {
    var identifier: String { get }
    var namespace: String? { get }
    var preferredEnvironment: JSEnvironmentKind { get }
    var sources: [String] { get }
}

// MARK: JSProtocolType

enum JSProtocolType: String, JSONConvertible {
    case offline
    case online
    case full
    
    func toJSONString() throws -> String {
        return try rawValue.toJSONString()
    }
}

// MARK: JSCallMethodTarget

enum JSCallMethodTarget: String, JSONConvertible {
    case offlineProtocol
    case onlineProtocol
    case blockExplorer
    case v3SerializerCompanion
    
    func toJSONString() throws -> String {
        return try rawValue.toJSONString()
    }
}

// MARK: JSModuleAction

enum JSModuleAction: JSONConvertible {
    private static let loadType: String = "load"
    private static let callMethodType: String = "callMethod"
    
    case load(Load)
    case callMethod(CallMethod)
    
    func toJSONString() throws -> String {
        switch self {
        case .load(let load):
            return try load.toJSONString()
        case .callMethod(let callMethod):
            return try callMethod.toJSONString()
        }
    }
    
    struct Load: JSONConvertible {
        let protocolType: JSProtocolType?
        let ignoreProtocols: JSArray?
        
        func toJSONString() throws -> String {
            let ignoreProtocols = try ignoreProtocols?.toJSONString() ?? "[]"
            
            return """
                {
                    "type": "\(JSModuleAction.loadType)",
                    "protocolType": \(try protocolType?.toJSONString() ?? (try JSUndefined.value.toJSONString())),
                    "ignoreProtocols": \(ignoreProtocols)
                }
            """
        }
    }
    
    enum CallMethod: JSONConvertible {
        case offlineProtocol(OfflineProtocol)
        case onlineProtocol(OnlineProtocol)
        case blockExplorer(BlockExplorer)
        case v3SerializerCompanion(V3SerializerCompanion)
        
        func toJSONString() throws -> String {
            switch self {
            case .offlineProtocol(let offlineProtocol):
                return try offlineProtocol.toJSONString()
            case .onlineProtocol(let onlineProtocol):
                return try onlineProtocol.toJSONString()
            case .blockExplorer(let blockExplorer):
                return try blockExplorer.toJSONString()
            case .v3SerializerCompanion(let v3SerializerCompanion):
                return try v3SerializerCompanion.toJSONString()
            }
        }
        
        private static func toJSONStringWithPartial(
            target: JSCallMethodTarget,
            name: String,
            args: JSArray?,
            partial partialJSON: String
        ) throws -> String {
            let args = try args?.toJSONString() ?? "[]"
            let objectJSON = """
                {
                    "type": "\(JSModuleAction.callMethodType)",
                    "target": \(try target.toJSONString()),
                    "method": "\(name)",
                    "args": \(args)
                }
            """
            
            guard let objectData = objectJSON.data(using: .utf8),
                  let object = try JSONSerialization.jsonObject(with: objectData) as? [String: Any],
                  let partialData = partialJSON.data(using: .utf8),
                  let partial = try JSONSerialization.jsonObject(with: partialData) as? [String: Any] else {
                throw JSError.invalidJSON
            }
            
            let merged = object.merging(partial, uniquingKeysWith: { $1 })
            guard JSONSerialization.isValidJSONObject(merged) else {
                throw JSError.invalidJSON
            }
            
            let data = try JSONSerialization.data(withJSONObject: merged, options: [])
            return .init(data: data, encoding: .utf8)!
        }
        
        struct OfflineProtocol: JSONConvertible {
            let target: JSCallMethodTarget = .offlineProtocol
            let name: String
            let args: JSArray?
            let protocolIdentifier: String
            
            func toJSONString() throws -> String {
                let partial: String = """
                    {
                        "protocolIdentifier": "\(protocolIdentifier)"
                    }
                """
                
                return try CallMethod.toJSONStringWithPartial(target: target, name: name, args: args, partial: partial)
            }
        }
        
        struct OnlineProtocol: JSONConvertible {
            let target: JSCallMethodTarget = .onlineProtocol
            let name: String
            let args: JSArray?
            let protocolIdentifier: String
            let networkID: String?
            
            func toJSONString() throws -> String {
                let partial: String = """
                    {
                        "protocolIdentifier": "\(protocolIdentifier)",
                        "networkId": \(try networkID?.toJSONString() ?? (try JSUndefined.value.toJSONString()))
                    }
                """
                
                return try CallMethod.toJSONStringWithPartial(target: target, name: name, args: args, partial: partial)
            }
        }
        
        struct BlockExplorer: JSONConvertible {
            let target: JSCallMethodTarget = .blockExplorer
            let name: String
            let args: JSArray?
            let protocolIdentifier: String
            let networkID: String?
            
            func toJSONString() throws -> String {
                let partial: String = """
                    {
                        "protocolIdentifier": "\(protocolIdentifier)",
                        "networkId": \(try networkID?.toJSONString() ?? (try JSUndefined.value.toJSONString()))
                    }
                """
                
                return try CallMethod.toJSONStringWithPartial(target: target, name: name, args: args, partial: partial)
            }
        }
        
        struct V3SerializerCompanion: JSONConvertible {
            let target: JSCallMethodTarget = .v3SerializerCompanion
            let name: String
            let args: JSArray?
            
            func toJSONString() throws -> String {
                return try CallMethod.toJSONStringWithPartial(target: target, name: name, args: args, partial: "{}")
            }
        }
    }
}

private extension JSArray {
    func replaceNullWithUndefined() -> JSArray {
        map {
            if $0 is NSNull {
                return JSUndefined.value
            } else {
                return $0
            }
        }
    }
}
