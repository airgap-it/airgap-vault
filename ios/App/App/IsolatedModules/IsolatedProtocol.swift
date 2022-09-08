//
//  IsolatedProtocol.swift
//  App
//
//  Created by Julia Samol on 08.09.22.
//

import Foundation
import Capacitor
import WebKit

@objc(IsolatedProtocol)
public class IsolatedProtocol: CAPPlugin {
    
    @objc func getField(_ call: CAPPluginCall) {
        call.assertReceived(forMethod: "getField", requiredParams: Param.IDENTIFIER, Param.KEY)
        
        do {
            guard let identifier = call.identifier, let key = call.key else {
                throw Error.invalidData
            }
            
            let options = call.options
            
            Task {
                let result = try await getField(
                    key,
                    ofProtocol: identifier,
                    builtWithOptions: options
                )
                call.resolve(result)
            }
        } catch {
            call.reject("Error: \(error)")
        }
    }
    
    @objc func callMethod(_ call: CAPPluginCall) {
        call.assertReceived(forMethod: "callMethod", requiredParams: Param.IDENTIFIER, Param.KEY)
        
        do {
            guard let identifier = call.identifier, let key = call.key else {
                throw Error.invalidData
            }
            
            let options = call.options
            let args = call.args
            
            Task {
                let result = try await callMethod(
                    key,
                    ofProtocol: identifier,
                    builtWithOptions: options,
                    withArgs: args
                )
                call.resolve(result)
            }
        } catch {
            call.reject("Error: \(error)")
        }
    }
    
    private func getField(_ key: String, ofProtocol identifier: String, builtWithOptions options: JSObject?) async throws -> JSObject {
        try await spawnCoinlibWebView(
            forProtocol: identifier,
            usingOptions: options,
            withGetResultScript: """
                callback(protocol.\(key))
            """
        )
    }
    
    private func callMethod(
        _ key: String,
        ofProtocol identifier: String,
        builtWithOptions options: JSObject?,
        withArgs args: JSArray?
    ) async throws -> JSObject {
        let args: String = {
            if let args = args {
                return "...\(args)"
            } else {
                return ""
            }
        }()
        
        return try await spawnCoinlibWebView(
            forProtocol: identifier,
            usingOptions: options,
            withGetResultScript: """
                protocol.\(key)(\(args)).then(callback).catch(onError())
            """
        )
    }
    
    private func spawnCoinlibWebView(
        forProtocol identifier: String,
        usingOptions options: JSObject?,
        withGetResultScript getResult: String
    ) async throws -> JSObject {
        try await Task.sleep(nanoseconds: 500000)
        return ["result": "00"]
    }
    
    struct Param {
        static let IDENTIFIER = "identifier"
        static let OPTIONS = "options"
        static let KEY = "key"
        static let ARGS = "args"
    }
    
    enum Error: Swift.Error {
        case invalidData
    }
}

private extension CAPPluginCall {
    var identifier: String? { return getString(IsolatedProtocol.Param.IDENTIFIER) }
    var options: JSObject? { return getObject(IsolatedProtocol.Param.OPTIONS) }
    var key: String? { return getString(IsolatedProtocol.Param.KEY) }
    var args: JSArray? { return getArray(IsolatedProtocol.Param.ARGS)}
}
