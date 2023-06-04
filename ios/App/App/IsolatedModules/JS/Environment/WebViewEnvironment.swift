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
    func run(_ action: JSModuleAction, in module: JSModule, ref runRef: String?) async throws -> [String: Any] {
        let (webView, userContentController, jsAsyncResult) = try await getOrCreateWebView(for: module, runRef: runRef)
        
        defer {
            if runRef == nil {
                onFinish(webView: webView, userContentController: userContentController, jsAsyncResult: jsAsyncResult)
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
    }
    
    func reset(runRef: String) async throws {
        let webViews = await webViewManager.getAll(for: runRef) ?? []
        for (webView, userContentController, jsAsyncResult) in webViews {
            await onFinish(webView: webView, userContentController: userContentController, jsAsyncResult: jsAsyncResult)
        }
        await webViewManager.remove(at: runRef)
    }
    
    func destroy() async throws {
        let webViews = await webViewManager.getAll()
        for (webView, userContentController, jsAsyncResult) in webViews {
            await onFinish(webView: webView, userContentController: userContentController, jsAsyncResult: jsAsyncResult)
        }
        await webViewManager.removeAll()
    }
    
    @MainActor
    private func getOrCreateWebView(for module: JSModule, runRef: String?) async throws -> (WKWebView, WKUserContentController, JSAsyncResult) {
        guard let runRef = runRef, let webViewTuple = await webViewManager.get(for: runRef, and: module) else {
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
                
                if let runRef = runRef {
                    await webViewManager.add(
                        runRef: runRef,
                        for: module,
                        webView: webView,
                        userContentController: userContentController,
                        jsAsyncResult: jsAsyncResult
                    )
                }
                
                return (webView, userContentController, jsAsyncResult)
            } catch {
                onFinish(webView: webView, userContentController: userContentController, jsAsyncResult: jsAsyncResult)
                throw error
            }
        }
        
        return webViewTuple
    }
    
    @MainActor
    private func onFinish(webView: WKWebView, userContentController: WKUserContentController, jsAsyncResult: JSAsyncResult) {
        userContentController.remove(jsAsyncResult)
        webView.stopLoading()
        webView.scrollView.delegate = nil
        webView.navigationDelegate = nil
        if webView.superview != nil {
            webView.removeFromSuperview()
        }
    }
    
    private actor WebViewManager {
        private(set) var webViews: [String: RunManager] = [:]
        
        func add(
            runRef: String,
            for module: JSModule,
            webView: WKWebView,
            userContentController: WKUserContentController,
            jsAsyncResult: JSAsyncResult
        ) {
            if webViews[runRef] == nil {
                webViews[runRef] = .init()
            }
            
            webViews[runRef]?.add(for: module, webView: webView, userContentController: userContentController, jsAsyncResult: jsAsyncResult)
        }
        
        func get(for runRef: String, and module: JSModule) -> (WKWebView, WKUserContentController, JSAsyncResult)? {
            webViews[runRef]?.webViews[module.identifier]
        }
        
        func getAll(for runRef: String) -> [(WKWebView, WKUserContentController, JSAsyncResult)]? {
            guard let values = webViews[runRef]?.webViews.values else {
                return nil
            }
            
            return Array(values)
        }
        
        func getAll() -> [(WKWebView, WKUserContentController, JSAsyncResult)] {
            webViews.values.flatMap { Array($0.webViews.values) }
        }
        
        func remove(at runRef: String) {
            webViews.removeValue(forKey: runRef)
        }
        
        func removeAll() {
            webViews.removeAll()
        }
        
        class RunManager {
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
    }
    
    private enum Error: Swift.Error {
        case invalidSource
        case invalidResult
    }
}
