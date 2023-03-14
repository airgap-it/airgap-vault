//
//  Sequence+Additions.swift
//  App
//
//  Created by Julia Samol on 07.02.23.
//

import Foundation

extension Sequence {
    func asyncMap<T>(_ transform: @escaping (Element) async throws -> T) async throws -> [T] {
        let tasks = map { element in
            Task { try await transform(element) }
        }
        
        var newElements = [T]()
        for task in tasks {
            newElements.append(try await task.value)
        }
        
        return newElements
    }
}
