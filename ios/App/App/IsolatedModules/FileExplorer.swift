//
//  FileExplorer.swift
//  App
//
//  Created by Julia Samol on 08.02.23.
//

import Foundation

// MARK: FileExplorer

struct FileExplorer {
    static let shared: FileExplorer = .init()
    
    private let assetsExplorer: AssetsExplorer
    private let documentExplorer: DocumentExplorer
    
    private let fileManager: FileManager
    
    init(fileManager: FileManager = .default) {
        self.assetsExplorer = .init(fileManager: fileManager)
        self.documentExplorer = .init(fileManager: fileManager)
        self.fileManager = fileManager
    }
    
    func readIsolatedModulesScript() throws -> Data {
        try assetsExplorer.readIsolatedModulesScript()
    }
    
    func loadAssetModules() throws -> [JSModule] {
        try loadModules(using: assetsExplorer, creatingModuleWith: JSModule.Asset.init).map { .asset($0) }
    }
    
    func loadInstalledModule(_ identifier: String) throws -> JSModule {
        let manifest = try documentExplorer.readModuleManifest(identifier)
        
        return .installed(try loadModule(identifier, fromManifest: manifest, creatingModuleWith: JSModule.Instsalled.init))
    }
    
    func loadInstalledModules() throws -> [JSModule] {
        try loadModules(using: documentExplorer, creatingModuleWith: JSModule.Instsalled.init).map { .installed($0) }
    }
    
    func loadPreviewModule(atPath path: String, locatedIn directory: Directory) throws -> JSModule {        
        guard let directory = fileManager.getDirectory(from: directory),
              let url = fileManager.urls(for: directory, in: .userDomainMask).first?.appendingPathComponent(path) else {
            throw Error.invalidDirectory
        }
        
        let identifier = url.pathComponents.last ?? "module"
        let manifest = try fileManager.contents(at: url.appendingPathComponent(FileExplorer.manifestFilename))
        
        return .preview(try loadModule(identifier, fromManifest: manifest) { identifier, namespace, preferredEnvironment, sources in
            JSModule.Preview(identifier: identifier, namespace: namespace, preferredEnvironment: preferredEnvironment, sources: sources, path: url)
        })
    }
    
    func readModuleSources(_ module: JSModule) throws -> [Data] {
        switch module {
        case .asset(let asset):
            return try assetsExplorer.readModuleSources(asset)
        case .installed(let installed):
            return try documentExplorer.readModuleSources(installed)
        case .preview(let preview):
            return try preview.sources.lazy.map { try fileManager.contents(at: preview.path.appendingPathComponent($0)) }
        }
    }
    
    func readModuleManifest(_ module: JSModule) throws -> Data {
        switch module {
        case .asset(let asset):
            return try assetsExplorer.readModuleManifest(asset.identifier)
        case .installed(let installed):
            return try documentExplorer.readModuleManifest(installed.identifier)
        case .preview(let preview):
            return try fileManager.contents(at: preview.path.appendingPathComponent(FileExplorer.manifestFilename))
        }
    }
    
    private func loadModules<T: JSModuleProtocol, E: DynamicSourcesExplorer>(
        using explorer: E,
        creatingModuleWith moduleInit: (_ identifier: String, _ namespace: String?, _ preferredEnvironment: JSEnvironmentKind, _ sources: [String]) -> T
    ) throws -> [T] where E.T == T {
        try explorer.listModules().map { module in
            try loadModule(module, fromManifest: try explorer.readModuleManifest(module), creatingModuleWith: moduleInit)
        }
    }
    
    private func loadModule<T: JSModuleProtocol>(
        _ identifier: String,
        fromManifest manifestData: Data,
        creatingModuleWith moduleInit: (_ identifier: String, _ namespace: String?, _ preferredEnvironment: JSEnvironmentKind, _ sources: [String]) -> T
    ) throws -> T {
        let jsonDecoder = JSONDecoder()
    
        let manifest = try jsonDecoder.decode(ModuleManifest.self, from: manifestData)
        let namespace = manifest.src?.namespace
        let preferredEnvironment = manifest.jsenv?.ios ?? .webview
        let sources: [String] = manifest.include.compactMap { source in
            guard source.hasSuffix(".js") else { return nil }
            return source
        }
        
        return moduleInit(identifier, namespace, preferredEnvironment, sources)
    }
}

// MARK: AssetsExplorer

private struct AssetsExplorer: DynamicSourcesExplorer {
    typealias T = JSModule.Asset
    
    static let assetsURL: URL = Bundle.main.url(forResource: "public", withExtension: nil)!.appendingPathComponent("assets")
    private static let script: String = "native/isolated_modules/isolated-modules.script.js"
    private static let modulesDir: String = "protocol_modules"
    
    private let fileManager: FileManager
    
    init(fileManager: FileManager) {
        self.fileManager = fileManager
    }
    
    func readIsolatedModulesScript() throws -> Data {
        try readData(atPath: Self.script)
    }
    
    func listModules() throws -> [String] {
        let url = Self.assetsURL.appendingPathComponent(Self.modulesDir)
        return try fileManager.contentsOfDirectory(atPath: url.path)
    }
    
    func modulePath(_ module: String, forPath path: String) throws -> String {
        "\(Self.modulesDir)/\(module)/\(path)"
    }
    
    func readModuleSources(_ module: JSModule.Asset) throws -> [Data] {
        try module.sources.lazy.map { try readData(atPath: modulePath(module.identifier, forPath: $0)) }
    }
    
    func readModuleManifest(_ module: String) throws -> Data {
        try readData(atPath: modulePath(module, forPath: FileExplorer.manifestFilename))
    }
    
    private func readData(atPath pathComponent: String) throws -> Data {
        let url = Self.assetsURL.appendingPathComponent(pathComponent)
        return try fileManager.contents(at: url)
    }
}

// MARK: DocumentExplorer

private struct DocumentExplorer: DynamicSourcesExplorer {
    typealias T = JSModule.Instsalled
    
    private static let modulesDir: String = "protocol_modules"
    
    private let fileManager: FileManager
    
    init(fileManager: FileManager) {
        self.fileManager = fileManager
    }
    
    func listModules() throws -> [String] {
        guard let url = fileManager.urls(for: .documentDirectory, in: .userDomainMask).first else {
            return []
        }
        
        let modulesDirPath = url.appendingPathComponent(Self.modulesDir).path
        guard fileManager.fileExists(atPath: modulesDirPath) else {
            return []
        }
        
        return try fileManager.contentsOfDirectory(atPath: modulesDirPath)
    }
    
    func modulePath(_ module: String, ofPath path: String) throws -> String {
        return "\(Self.modulesDir)/\(module)/\(path)"
    }
    
    func readModuleSources(_ module: JSModule.Instsalled) throws -> [Data] {
        try module.sources.lazy.map { try readData(atPath: modulePath(module.identifier, ofPath: $0)) }
    }
    
    func readModuleManifest(_ module: String) throws -> Data {
        try readData(atPath: modulePath(module, ofPath: FileExplorer.manifestFilename))
    }
    
    private func readData(atPath path: String) throws -> Data {
        guard let url = fileManager.urls(for: .documentDirectory, in: .userDomainMask).first?.appendingPathComponent(path) else {
            throw Error.invalidDirectory
        }
        
        return try fileManager.contents(at: url)
    }
}

// MARK: DynamicSourcesExplorer

private protocol DynamicSourcesExplorer {
    associatedtype T
    
    func listModules() throws -> [String]
    
    func readModuleSources(_ module: T) throws -> [Data]
    func readModuleManifest(_ module: String) throws -> Data
}

// MARK: Extensions

private extension FileExplorer {
    static let manifestFilename: String = "manifest.json"
}

private extension FileManager {
    func contents(at url: URL) throws -> Data {
        guard let data = contents(atPath: url.path) else {
            throw Error.invalidPath
        }
        
        return data
    }
}

private enum Error: Swift.Error {
    case invalidPath
    case invalidDirectory
}
