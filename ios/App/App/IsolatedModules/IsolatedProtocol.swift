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
public class IsolatedProtocol: CAPPlugin, WKNavigationDelegate {
    private static let assetsURL: URL? = Bundle.main.url(forResource: "public", withExtension: nil)?.appendingPathComponent("assets")
    
    private static let coinlibSource: String = "libs/airgap-coin-lib.browserify.js"
    private static let commonSource: String = "native/isolated_modules/protocol_common.js"
    
    @objc func getField(_ call: CAPPluginCall) {
        call.assertReceived(forMethod: "getField", requiredParams: Param.IDENTIFIER, Param.KEY)
        
        do {
            guard let identifier = call.identifier, let key = call.key else {
                throw Error.invalidData
            }
            
            let options = call.options
            
            Task {
                do {
                    let result = try await getField(
                        key,
                        ofProtocol: identifier,
                        builtWithOptions: options
                    )
                    call.resolve(result)
                } catch {
                    call.reject("Error: \(error)")
                }
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
                do {
                    let result = try await callMethod(
                        key,
                        ofProtocol: identifier,
                        builtWithOptions: options,
                        withArgs: args?.replaceNullWithUndefined()
                    )
                    call.resolve(result)
                } catch {
                    call.reject("Error: \(error)")
                }
            }
        } catch {
            call.reject("Error: \(error)")
        }
    }
    
    private func getField(_ key: String, ofProtocol identifier: String, builtWithOptions options: JSObject?) async throws -> [String: Any] {
        try await spawnCoinlibWebView(
            forProtocol: identifier,
            usingOptions: options,
            for: .getField,
            injectScript: """
                var __platform__field = '\(key)'
            """
        )
    }
    
    private func callMethod(
        _ key: String,
        ofProtocol identifier: String,
        builtWithOptions options: JSObject?,
        withArgs args: JSArray?
    ) async throws -> [String: Any] {
        let args: String = try {
            if let args = args {
                return try args.toJSONString()
            } else {
                return "[]"
            }
        }()
        
        return try await spawnCoinlibWebView(
            forProtocol: identifier,
            usingOptions: options,
            for: .callMethod,
            injectScript: """
                var __platform__method = '\(key)'
                var __platform__args = \(args)
            """
        )
    }
    
    @MainActor
    private func spawnCoinlibWebView(
        forProtocol identifier: String,
        usingOptions options: JSObject?,
        for action: JSProtocolAction,
        injectScript script: String? = nil
    ) async throws -> [String: Any] {
        guard let assetsURL = Self.assetsURL else {
            throw Error.fileNotFound
        }
        
        let callbackHandler = JSCallbackHandler(name: "resultCallbackHandler")
        
        let html = """
            <script type="text/javascript">
                function postMessage(message) {
                    window.webkit.messageHandlers.\(callbackHandler.name).postMessage(message)
                }
        
                var __platform__identifier = '\(identifier)'
                var __platform__options = \(try options?.toJSONString() ?? JSUndefined.value.toJSONString())
                var __platform__action = '\(action.rawValue)'
        
                \(script ?? "")

                function __platform__handleError(error) {
                    postMessage({ error })
                }

                function __platform__handleResult(result) {
                    postMessage({ result: JSON.stringify({ result }) })
                }
            </script>
            <script src="\(Self.coinlibSource)" type="text/javascript"></script>
            <script src="\(Self.commonSource)" type="text/javascript"></script>
        """
        
        let userContentController = WKUserContentController()
        userContentController.add(callbackHandler)
        
        let webViewConfiguration = WKWebViewConfiguration()
        webViewConfiguration.userContentController = userContentController
        
        let webView = WKWebView(frame: .zero, configuration: webViewConfiguration)
        webView.navigationDelegate = self
        let _ = webView.load(
            .init(html.utf8),
            mimeType: "text/html",
            characterEncodingName: "utf-8",
            baseURL: assetsURL
        )
        
        return try await callbackHandler.awaitResult()
    }
    
    enum JSProtocolAction: String {
        case getField
        case callMethod
    }
    
    struct Param {
        static let IDENTIFIER = "identifier"
        static let OPTIONS = "options"
        static let KEY = "key"
        static let ARGS = "args"
    }
    
    enum Error: Swift.Error {
        case fileNotFound
        case invalidData
    }
}

private extension CAPPluginCall {
    var identifier: String? { return getString(IsolatedProtocol.Param.IDENTIFIER) }
    var options: JSObject? { return getObject(IsolatedProtocol.Param.OPTIONS) }
    var key: String? { return getString(IsolatedProtocol.Param.KEY) }
    var args: JSArray? { return getArray(IsolatedProtocol.Param.ARGS)}
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
