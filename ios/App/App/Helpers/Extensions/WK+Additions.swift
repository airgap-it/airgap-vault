//
//  WK+Additions.swift
//  App
//
//  Created by Julia Samol on 20.09.22.
//

import Foundation
import WebKit

extension WKUserContentController {
    
    func add<T: WKScriptMessageHandler & Identifiable>(_ scriptMessageHandler: T) where T.ID == String {
        add(scriptMessageHandler, name: scriptMessageHandler.id)
    }
    
    func remove<T: WKScriptMessageHandler & Identifiable>(_ scriptMessageHandler: T) where T.ID == String {
        removeScriptMessageHandler(forName: scriptMessageHandler.id)
    }
}

extension WKWebView {

    @MainActor
    @discardableResult
    func evaluateJavaScriptAsync(_ javaScriptString: String) async throws -> Any? {
        return try await withCheckedThrowingContinuation { (continuation: CheckedContinuation<Any?, Error>) in
            self.evaluateJavaScript(javaScriptString) { data, error in
                if let error = error {
                    continuation.resume(throwing: error)
                } else {
                    continuation.resume(returning: data)
                }
            }
        }
    }
}
