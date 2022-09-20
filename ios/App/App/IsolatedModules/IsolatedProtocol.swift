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
    private static let utilsSource: String = "native/isolated_modules/utils.js"
    
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
    ) async throws -> [String: Any] {
        let args: String = try {
            if let args = args {
                return "...\(try args.toJSONString())"
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
    
    @MainActor
    private func spawnCoinlibWebView(
        forProtocol identifier: String,
        usingOptions options: JSObject?,
        withGetResultScript getResult: String
    ) async throws -> [String: Any] {
        guard let assetsURL = Self.assetsURL else {
            throw Error.fileNotFound
        }
        
        let callbackHandler = JSCallbackHandler(name: "resultCallbackHandler")
        
        let html = """
            <script src="\(Self.coinlibSource)" type="text/javascript"></script>
            <script src="\(Self.utilsSource)" type="text/javascript"></script>
            <script type="text/javascript">
                function postMessage(message) {
                    window.webkit.messageHandlers.\(callbackHandler.name).postMessage(message)
                }

                function onError(description) {
                    return createOnError(description, function(error) {
                        postMessage({ error })
                    })
                }

                function loadCoinlib(callback) {
                    airgapCoinLib.isCoinlibReady().then(callback).catch(onError())
                }

                function createProtocol(identifier) {
                    return airgapCoinLib.createProtocolByIdentifier(identifier, \(try options?.toJSONString() ?? JSUndefined.value.toJSONString()))
                }

                function getResult(protocol, callback) {
                    \(getResult)
                }

                window.onload = function() {
                    loadCoinlib(function () {
                        var protocol = createProtocol('\(identifier)')
                        getResult(protocol, function(result) {
                            postMessage({ result: JSON.stringify({ result }) })
                        })
                    })
                }
            </script>
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
