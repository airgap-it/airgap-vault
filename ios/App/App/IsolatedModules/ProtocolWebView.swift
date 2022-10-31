//
//  ProtocolWebView.swift
//  App
//
//  Created by Julia Samol on 06.10.22.
//

import Foundation
import Capacitor
import WebKit

class ProtocolWebView: NSObject, WKNavigationDelegate {
    private static let isolatedProtocolHTMLSource: String = "native/isolated_modules/isolated-protocol.html"
    
    private let webView: WKWebView
    private let jsAsyncResult: JSAsyncResult
    
    private var modules: [String: String] = [:]
    
    @MainActor
    init(assetsURL: URL) {
        let jsAsyncResult = JSAsyncResult()
        let userContentController = WKUserContentController()
        userContentController.add(jsAsyncResult)
        
        let webViewConfiguration = WKWebViewConfiguration()
        webViewConfiguration.userContentController = userContentController
        
        let webView = WKWebView(frame: .zero, configuration: webViewConfiguration)
        let _ = webView.loadFileURL(
            assetsURL.appendingPathComponent(Self.isolatedProtocolHTMLSource),
            allowingReadAccessTo: assetsURL
        )
        
        self.webView = webView
        self.jsAsyncResult = jsAsyncResult
        
        super.init()
        
        self.webView.navigationDelegate = self
    }
    
    func evaluateKeys(ofProtocol identifier: String, builtWithOptions options: JSObject?) async throws -> [String: Any] {
        try await evaluate(
            .keys,
            forProtocol: identifier,
            usingOptions: options
        )
    }
    
    func evaluateGetField(_ key: String, ofProtocol identifier: String, builtWithOptions options: JSObject?) async throws -> [String: Any] {
        try await evaluate(
            .getField(key),
            forProtocol: identifier,
            usingOptions: options
        )
    }
    
    func evaluateCallMethod(
        _ key: String,
        ofProtocol identifier: String,
        builtWithOptions options: JSObject?,
        withArgs args: JSArray?
    ) async throws -> [String: Any] {
        try await evaluate(
            .callMethod(key, args?.replaceNullWithUndefined()),
            forProtocol: identifier,
            usingOptions: options
        )
    }
    
    @MainActor
    private func evaluate(
        _ action: JSProtocolAction,
        forProtocol identifier: String,
        usingOptions options: JSObject?,
        injectScript script: String? = nil
    ) async throws -> [String: Any] {
        guard let module = loadModule(identifier) else {
            throw Error.moduleNotFound(identifier)
        }
        
        let resultID = await jsAsyncResult.createID()
        
        let script = """
            function postMessage(message) {
                window.webkit.messageHandlers.\(jsAsyncResult.id).postMessage({ ...message, id: "\(resultID)" });
            };
            
            execute(
                \(module),
                '\(identifier)',
                \(try options?.toJSONString() ?? JSUndefined.value.toJSONString()),
                \(try action.toJSONString()),
                function (result) {
                    postMessage({ result: JSON.parse(JSON.stringify(result)) });
                },
                function (error) {
                    postMessage({ error });
                }
            );
        """
        
        webView.evaluateJavaScript(script, completionHandler: nil)
        
        var result = try await jsAsyncResult.awaitResultWithID(resultID)
        result.replaceKey("result", with: action.resultField)
        
        return result
    }
    
    private func loadModule(_ identifier: String) -> String? {
        guard let moduleName = moduleName(fromIdentifier: identifier) else { return nil }
        if let module = modules[moduleName] { return module }
        
        guard let moduleSource = readModuleSource(moduleName) else { return nil }
        let jsModule = createJSModule(moduleName)
        modules[moduleName] = jsModule
        
        webView.evaluateJavaScript(moduleSource, completionHandler: nil)
        
        return jsModule
    }
    
    private func readModuleSource(_ name: String) -> String? {
        let publicURL = Bundle.main.url(forResource: "public", withExtension: nil)
        guard
            let sourcePath = publicURL?.appendingPathComponent("assets/libs/airgap-\(name).browserify.js"),
            let source = FileManager.default.contents(atPath: sourcePath.path)
        else { return nil }
        
        return .init(data: source, encoding: .utf8)
    }
    
    private func createJSModule(_ name: String) -> String {
        "airgapCoinLib\(name.capitalized)"
    }
    
    private func moduleName(fromIdentifier identifier: String) -> String? {
        switch identifier {
        case _ where identifier.starts(withAny: "ae"):
            return "aeternity"
        case _ where identifier.starts(withAny: "astar", "shiden"):
            return "astar"
        case _ where identifier.starts(withAny: "btc"):
            return "bitcoin"
        case _ where identifier.starts(withAny: "cosmos"):
            return "cosmos"
        case _ where identifier.starts(withAny: "eth"):
            return "ethereum"
        case _ where identifier.starts(withAny: "grs"):
            return "groestlcoin"
        case _ where identifier.starts(withAny: "moonbeam", "moonriver", "moonbase"):
            return "moonbeam"
        case _ where identifier.starts(withAny: "polkadot", "kusama"):
            return "polkadot"
        case _ where identifier.starts(withAny: "xtz"):
            return "tezos"
        default:
            return nil
        }
    }
    
    enum JSProtocolAction {
        private static let keysType: String = "keys"
        private static let getFieldType: String = "getField"
        private static let callMethodType: String = "callMethod"
        
        case keys
        case getField(String)
        case callMethod(String, JSArray?)
        
        var resultField: String {
            switch self {
            case .keys:
                return "keys"
            default:
                return "result"
            }
        }
        
        func toJSONString() throws -> String {
            switch self {
            case .keys:
                return """
                    {
                        "type": "\(Self.keysType)"
                    }
                """
            case let .getField(key):
                return """
                    {
                        "type": "\(Self.getFieldType)",
                        "field": "\(key)"
                    }
                """
            case let .callMethod(key, args):
                return """
                    {
                        "type": "\(Self.callMethodType)",
                        "method": "\(key)",
                        "args": \(try args?.toJSONString() ?? "[]")
                    }
                """
            }
        }
    }
    
    enum Error: Swift.Error {
        case moduleNotFound(String)
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

private extension Dictionary {
    mutating func replaceKey(_ oldKey: Key, with newKey: Key) {
        if let value = removeValue(forKey: oldKey) {
            self[newKey] = value
        }
    }
}
