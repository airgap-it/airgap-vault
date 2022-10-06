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
        let resultID = await jsAsyncResult.createID()
        
        let script = """
            function postMessage(message) {
                window.webkit.messageHandlers.\(jsAsyncResult.id).postMessage({ ...message, id: "\(resultID)" });
            };
            
            execute(
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
