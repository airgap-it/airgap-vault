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
    
    private static let rawValue: String = "it.airgap.__UNDEFINED__"
    
    func toJSONString() throws -> String {
        "\"\(Self.rawValue)\""
    }
}

protocol JSONConvertible {
    func toJSONString() throws -> String
}

class JSAsyncResult: NSObject, Identifiable, WKScriptMessageHandler {
    private typealias Listener = (Result<Any, Error>) -> ()
        
    private static let defaultName: String = "jsAsyncResult"
    
    private static let fieldID: String = "id"
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
    
    func createID() async -> String {
        let id = await listenerRegistry.createID()
        await listenerRegistry.add(forID: id) { [weak self] result in
            let selfWeak = self
            Task {
                await selfWeak?.resultManager.setResult(result, forID: id)
            }
        }

        return id
    }
    
    func awaitResultWithID(_ id: String) async throws -> Any {
        if let result = await resultManager.result[id] {
            return try result.get()
        }
        
        return try await withCheckedThrowingContinuation { continuation in
            Task {
                await listenerRegistry.add(forID: id) { result in
                    continuation.resume(with: result)
                }
            }
        }
    }
    
    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        guard message.name == id, let body = message.body as? [String: Any] else { return }

        Task {
            guard let id = body[Self.fieldID] as? String else { return }
            
            do {
                let result = body[Self.fieldResult]
                let error = body[Self.fieldError]

                if let result = result, error == nil {
                    await listenerRegistry.notifyAllWithID(id, with: .success(result))
                } else if let error = error {
                    throw JSError.fromScript(error)
                } else {
                    throw JSError.invalidJSON
                }
            } catch {
                await listenerRegistry.notifyAllWithID(id, with: .failure(error))
            }
        }
    }
    
    private actor ResultManager {
        private(set) var result: [String: Result<Any, Error>] = [:]
        
        func setResult(_ result: Result<Any, Error>, forID id: String) {
            self.result[id] = result
        }
    }
    
    private actor ListenerRegistry {
        private(set) var listeners: [String: [Listener]] = [:]
        
        func createID() -> String {
            let id = UUID().uuidString
            listeners[id] = []
            
            return id
        }
        
        func add(forID id: String, _ listener: @escaping Listener) {
            listeners[id]?.append(listener)
        }
        
        func notifyAllWithID(_ id: String, with result: Result<Any, Error>) {
            listeners[id]?.forEach { $0(result) }
            listeners.removeValue(forKey: id)
        }
    }
}

enum JSError: Swift.Error {
    case invalidJSON
    case fromScript(Any)
}
