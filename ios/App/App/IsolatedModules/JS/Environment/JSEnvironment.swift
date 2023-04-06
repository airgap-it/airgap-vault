//
//  JSEnvironment.swift
//  App
//
//  Created by Julia Samol on 07.02.23.
//

import Foundation

protocol JSEnvironment {
    func run(_ action: JSModuleAction, in module: JSModule, keepAlive: Bool) async throws -> [String: Any]
    func reset() async throws
    func destroy() async throws
}

enum JSEnvironmentKind: String, Codable {
    case webview
}
