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
                webViewManager.onFinish(webView: webView, userContentController: userContentController, jsAsyncResult: jsAsyncResult)
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
            await webViewManager.onFinish(webView: webView, userContentController: userContentController, jsAsyncResult: jsAsyncResult)
        }
        await webViewManager.remove(at: runRef)
    }
    
    func destroy() async throws {
        let webViews = await webViewManager.getAll()
        for (webView, userContentController, jsAsyncResult) in webViews {
            await webViewManager.onFinish(webView: webView, userContentController: userContentController, jsAsyncResult: jsAsyncResult)
        }
        await webViewManager.removeAll()
    }
    
    private func getOrCreateWebView(for module: JSModule, runRef: String?) async throws -> WKWebViewExtended {
        return try await webViewManager.get(for: runRef, and: module, using: self)
    }
    
    private actor WebViewManager {
        private(set) var webViews: [String: [String: WKWebViewExtended]] = [:]
        @MainActor private var activeTasks: [String: Task<WKWebViewExtended, Swift.Error>] = [:]
        
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
            
            webViews[runRef]![module.identifier] = (webView, userContentController, jsAsyncResult)
        }
        
        @MainActor
        func get(
            for runRef: String?,
            and module: JSModule,
            using env: WebViewEnvironment
        ) async throws -> WKWebViewExtended {
            if let runRef = runRef, let activeTask = activeTasks[runRef] {
                return try await activeTask.value
            }
            
            let task = Task<WKWebViewExtended, Swift.Error> {
                guard let runRef = runRef, let extendedWebView = await webViews[runRef]?[module.identifier] else {
                    let jsAsyncResult = JSAsyncResult()
                    
                    let userContentController = WKUserContentController()
                    userContentController.add(jsAsyncResult)
                    
                    let webViewConfiguration = WKWebViewConfiguration()
                    webViewConfiguration.userContentController = userContentController
                    
                    let webView = WKWebView(frame: .zero, configuration: webViewConfiguration)
                    webView.navigationDelegate = env
                    
                    do {
                        guard let scriptSource = String(data: try env.fileExplorer.readIsolatedModulesScript(), encoding: .utf8) else {
                            throw Error.invalidSource
                        }
                        
                        try await webView.evaluateJavaScriptAsync(scriptSource)
                        
                        for source in try env.fileExplorer.readModuleSources(module) {
                            guard let string = String(data: source, encoding: .utf8) else {
                                throw Error.invalidSource
                            }
                            
                            try await webView.evaluateJavaScriptAsync(string)
                        }
                        
                        if let runRef = runRef {
                            await add(
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
                
                return extendedWebView
            }
            
            if let runRef = runRef {
                activeTasks[runRef] = task
            }
            
            return try await task.value
        }
        
        func getAll(for runRef: String) -> [(WKWebView, WKUserContentController, JSAsyncResult)]? {
            guard let values = webViews[runRef]?.values else {
                return nil
            }
            
            return Array(values)
        }
        
        func getAll() -> [(WKWebView, WKUserContentController, JSAsyncResult)] {
            webViews.values.flatMap { Array($0.values) }
        }
        
        func remove(at runRef: String) {
            webViews.removeValue(forKey: runRef)
        }
        
        func removeAll() {
            webViews.removeAll()
        }
        
        @MainActor
        func onFinish(webView: WKWebView, userContentController: WKUserContentController, jsAsyncResult: JSAsyncResult) {
            userContentController.remove(jsAsyncResult)
            webView.stopLoading()
            webView.scrollView.delegate = nil
            webView.navigationDelegate = nil
            if webView.superview != nil {
                webView.removeFromSuperview()
            }
        }
    }
    
    private enum Error: Swift.Error {
        case invalidSource
        case invalidResult
    }
    
    private typealias WKWebViewExtended = (WKWebView, WKUserContentController, JSAsyncResult)
}
