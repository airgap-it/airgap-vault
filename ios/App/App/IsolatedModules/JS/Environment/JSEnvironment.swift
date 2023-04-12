//
//  JSEnvironment.swift
//  App
//
//  Created by Julia Samol on 07.02.23.
//

import Foundation

protocol JSEnvironment {
    func run(_ action: JSModuleAction, in module: JSModule, ref: String?) async throws -> [String: Any]
    func reset(runRef: String) async throws
    func destroy() async throws
}

enum JSEnvironmentKind: String, Codable {
    case webview
}

extension JSEnvironment {
    func run(_ action: JSModuleAction, in module: JSModule) async throws -> [String: Any] {
        try await run(action, in: module, ref: nil)
    }
}
