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
    private let webViewManager: WebViewManager
    
    init(fileExplorer: FileExplorer) {
        self.fileExplorer = fileExplorer
        self.webViewManager = .init()
    }
    
    @MainActor
    func run(_ action: JSModuleAction, in module: JSModule, keepAlive: Bool) async throws -> [String: Any] {
        let (webView, userContentController, jsAsyncResult) = try await getOrCreateWebView(for: module, keepAlive: keepAlive)
        
        do {
            defer {
                if !keepAlive {
                    onError(webView: webView, userContentController: userContentController, jsAsyncResult: jsAsyncResult)
                }
            }
            
            let resultID = await jsAsyncResult.createID()
            let script = """
                function postMessage(message) {
                    window.webkit.messageHandlers.\(jsAsyncResult.id).postMessage({ ...message, id: "\(resultID)" });
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
            guard let result = try await jsAsyncResult.awaitResultWithID(resultID) as? [String: Any] else {
                throw Error.invalidResult
            }
            
            return result
        } catch {
            throw error
        }
    }
    
    func reset() async throws {
        await webViewManager.removeAll()
    }
    
    func destroy() async throws {
        try await reset()
    }
    
    @MainActor
    private func getOrCreateWebView(for module: JSModule, keepAlive: Bool) async throws -> (WKWebView, WKUserContentController, JSAsyncResult) {
        guard let webViewTuple = await webViewManager.webViews[module.identifier] else {
            let jsAsyncResult = JSAsyncResult()
            
            let userContentController = WKUserContentController()
            userContentController.add(jsAsyncResult)
            
            let webViewConfiguration = WKWebViewConfiguration()
            webViewConfiguration.userContentController = userContentController
            
            let webView = WKWebView(frame: .zero, configuration: webViewConfiguration)
            webView.navigationDelegate = self
            
            do {
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
                
                if keepAlive {
                    await webViewManager.add(
                        for: module,
                        webView: webView,
                        userContentController: userContentController,
                        jsAsyncResult: jsAsyncResult
                    )
                }
                
                return (webView, userContentController, jsAsyncResult)
            } catch {
                onError(webView: webView, userContentController: userContentController, jsAsyncResult: jsAsyncResult)
                throw error
            }
        }
        
        return webViewTuple
    }
    
    private func onError(webView: WKWebView, userContentController: WKUserContentController, jsAsyncResult: JSAsyncResult) {
        userContentController.remove(jsAsyncResult)
        webView.stopLoading()
        webView.scrollView.delegate = nil
        webView.navigationDelegate = nil
        webView.removeFromSuperview()
    }
    
    private actor WebViewManager {
        private(set) var webViews: [String: (WKWebView, WKUserContentController, JSAsyncResult)] = [:]
        
        func add(
            for module: JSModule,
            webView: WKWebView,
            userContentController: WKUserContentController,
            jsAsyncResult: JSAsyncResult
        ) {
            webViews[module.identifier] = (webView, userContentController, jsAsyncResult)
        }
        
        func removeAll() {
            webViews.removeAll()
        }
    }
    
    private enum Error: Swift.Error {
        case invalidSource
        case invalidResult
    }
}
