//
//  WebViewEnvironment.swift
//  App
//
//  Created by Julia Samol on 07.02.23.
//

import Foundation
import WebKit

class WebViewEnvironment: NSObject, JSEnvironment, WKNavigationDelegate {
    private let fileExplorer: FileExplorer
    
    init(fileExplorer: FileExplorer) {
        self.fileExplorer = fileExplorer
    }
    
    @MainActor
    func run(_ action: JSModuleAction, in module: JSModule) async throws -> [String: Any] {
        let jsAsyncResult = JSAsyncResult()
        
        let userContentController = WKUserContentController()
        userContentController.add(jsAsyncResult)
        
        let webViewConfiguration = WKWebViewConfiguration()
        webViewConfiguration.userContentController = userContentController
        
        let webView = WKWebView(frame: .zero, configuration: webViewConfiguration)
        webView.navigationDelegate = self
        
        do {
            defer {
                userContentController.remove(jsAsyncResult)
                webView.stopLoading()
                webView.scrollView.delegate = nil
                webView.navigationDelegate = nil
                webView.removeFromSuperview()
            }
            
            guard let scriptSource = String(data: try fileExplorer.readIsolatedModulesScript(), encoding: .utf8) else {
                throw Error.invalidSource
            }
            try await webView.evaluateJavaScriptAsync(scriptSource)
            
            for source in try fileExplorer.readModuleSources(module) {
                guard let string = String(data: source, encoding: .utf8) else {
                    throw Error.invalidSource
                }
                
                try await webView.evaluateJavaScriptAsync(string)
            }
            
            let script = """
                function postMessage(message) {
                    window.webkit.messageHandlers.\(jsAsyncResult.id).postMessage(message);
                };
            
                execute(
                    \(try module.namespace ?? (try JSUndefined.value.toJSONString())),
                    '\(module.identifier)',
                    \(try action.toJSONString()),
                    function (result) {
                        postMessage({ result: JSON.parse(JSON.stringify(result)) });
                    },
                    function (error) {
                        postMessage({ error })
                    }
                );
            """
            
            webView.evaluateJavaScript(script, completionHandler: nil)
            guard let result = try await jsAsyncResult.awaitResult() as? [String: Any] else {
                throw Error.invalidResult
            }
            
            return result
        } catch {
            throw error
        }
    }
    
    func destroy() async throws {
        /* no action */
    }
    
    private enum Error: Swift.Error {
        case invalidSource
        case invalidResult
    }
}
