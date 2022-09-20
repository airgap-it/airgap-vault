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
    
    private var result: Result<[String: Any], Error>?
    private let listenerRegistry: ListenerRegistry
    
    init(name: String) {
        self.name = name
        self.result = nil
        self.listenerRegistry = .init()
    }
    
    func awaitResult() async throws -> [String: Any] {
        if let result = result {
            return try result.get()
        }
        
        return try await withCheckedThrowingContinuation { continuation in
            Task {
                await listenerRegistry.add {
                    continuation.resume(with: $0)
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
    
    private actor ListenerRegistry {
        private(set) var listeners: [String: Listener] = [:]
        
        func add(_ listener: @escaping Listener) {
            listeners[UUID().uuidString] = listener
        }
        
        func notifyAll(with result: Result<[String: Any], Error>) {
            listeners.keys.forEach {
                listeners[$0]?(result)
                listeners.removeValue(forKey: $0)
            }
        }
    }
}

enum JSError: Swift.Error {
    case invalidJSON
    case fromScript(String)
}
