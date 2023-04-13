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

class JSAsyncResult: NSObject, Identifiable, WKScriptMessageHandler {
    private typealias Listener = (Result<Any, Error>) -> ()
    
    private static let defaultName: String = "jsAsyncResult"
    
    private static let fieldResult: String = "result"
    private static let fieldError: String = "error"
    
    public let id: String
    private var resultManager: ResultManager
    private let listenerRegistry: ListenerRegistry
    
    init(id: String = "\(JSAsyncResult.defaultName)\(Int(Date().timeIntervalSince1970))") {
        self.id = id
        self.resultManager = .init()
        self.listenerRegistry = .init()
    }
    
    func awaitResult() async throws -> Any {
        if let result = await resultManager.result {
            return try result.get()
        }
        
        return try await withCheckedThrowingContinuation { continuation in
            Task {
                await listenerRegistry.add { [weak self] result in
                    let selfWeak = self
                    Task {
                        await selfWeak?.resultManager.setResult(result)
                        continuation.resume(with: result)
                    }
                }
            }
        }
    }
    
    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        guard message.name == id, let body = message.body as? [String: Any] else { return }

        Task {
            do {
                let result = body[Self.fieldResult]
                let error = body[Self.fieldError]

                if let result = result, error == nil {
                    await listenerRegistry.notifyAll(with: .success(result))
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
        private(set) var result: Result<Any, Error>?
        
        func setResult(_ result: Result<Any, Error>) {
            self.result = result
        }
    }
    
    private actor ListenerRegistry {
        private(set) var listeners: [Listener] = []
        
        func add(_ listener: @escaping Listener) {
            listeners.append(listener)
        }
        
        func notifyAll(with result: Result<Any, Error>) {
            listeners.forEach { $0(result) }
            listeners.removeAll()
        }
    }
}
enum JSError: Swift.Error {
    case invalidJSON
    case fromScript(Any)
}
