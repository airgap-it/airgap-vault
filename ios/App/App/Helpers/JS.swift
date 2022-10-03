//
//  JS.swift
//  App
//
//  Created by Julia Samol on 20.09.22.
//

import Foundation
import Capacitor

struct JSUndefined: JSValue, JSONConvertible {
    static let value: JSUndefined = .init()
    
    private static let rawValue: String = "undefined"
    
    func toJSONString() throws -> String {
        Self.rawValue
    }
}

protocol JSONConvertible {
    func toJSONString() throws -> String
}

class JSCallbackHandler: NSObject, WKScriptMessageHandler {
    private typealias Listener = (Result<[String: Any], Error>) -> ()
    
    let name: String
    
    private var resultManager: ResultManager
    private let listenerRegistry: ListenerRegistry
    
    init(name: String) {
        self.name = name
        self.resultManager = .init()
        self.listenerRegistry = .init()
    }
    
    func awaitResult() async throws -> [String: Any] {
        if let result = await resultManager.result {
            return try result.get()
        }
        
        return try await withCheckedThrowingContinuation { continuation in
            Task {
                await listenerRegistry.add { [weak self] result in
                    continuation.resume(with: result)
                    
                    let selfWeak = self
                    Task {
                        await selfWeak?.resultManager.setResult(result)
                    }
                }
            }
        }
    }
    
    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        guard message.name == name, let body = message.body as? [String: String] else { return }
        
        Task {
            do {
                let result = body["result"]
                let error = body["error"]
                
                if let result = result, error == nil {
                    let deserialized = try JSONSerialization.jsonObject(with: .init(result.utf8))
                    if let dictionary = deserialized as? [String: Any] {
                        await listenerRegistry.notifyAll(with: .success(dictionary))
                    } else {
                        await listenerRegistry.notifyAll(with: .success(["result": deserialized]))
                    }
                } else if let error = error {
                    throw JSError.fromScript(error)
                } else {
                    throw JSError.invalidJSON
                }
            } catch {
                await listenerRegistry.notifyAll(with: .failure(error))
            }
        }
    }
    
    private actor ResultManager {
        private(set) var result: Result<[String: Any], Error>?
        
        func setResult(_ result: Result<[String: Any], Error>) {
            self.result = result
        }
    }
    
    private actor ListenerRegistry {
        private(set) var listeners: [Listener] = []
        
        func add(_ listener: @escaping Listener) {
            listeners.append(listener)
        }
        
        func notifyAll(with result: Result<[String: Any], Error>) {
            listeners.forEach { $0(result) }
            listeners.removeAll()
        }
    }
}

enum JSError: Swift.Error {
    case invalidJSON
    case fromScript(String)
}
