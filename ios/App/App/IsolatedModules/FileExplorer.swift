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
    
    func loadAssetModules() throws -> [JSModule.Asset] {
        try loadModules(using: assetsExplorer, creatingModuleWith: JSModule.Asset.getInit())
    }
    
    func loadInstalledModules() throws -> [JSModule.Installed] {
        try loadModules(using: documentExplorer, creatingModuleWith: JSModule.Installed.getInit(using: documentExplorer))
    }
    
    func loadAssetModule(_ identifier: String) throws -> JSModule.Asset {
        let manifest = try assetsExplorer.readModuleManifest(identifier)
        
        return try loadModule(identifier, fromManifest: manifest, creatingModuleWith: JSModule.Asset.getInit())
    }
    
    func loadInstalledModule(_ identifier: String) throws -> JSModule.Installed {
        let manifest = try documentExplorer.readModuleManifest(identifier)
        
        return try loadModule(identifier, fromManifest: manifest, creatingModuleWith: JSModule.Installed.getInit(using: documentExplorer))
    }
    
    func loadPreviewModule(atPath path: String, locatedIn directory: Directory) throws -> JSModule.Preview {
        guard let directory = fileManager.getDirectory(from: directory),
              let url = fileManager.urls(for: directory, in: .userDomainMask).first?.appendingPathComponent(path) else {
            throw Error.invalidDirectory
        }
        
        let identifier = url.pathComponents.last ?? "module"
        let manifest = try fileManager.contents(at: url.appendingPathComponent(FileExplorer.manifestFilename))
        let signature = try fileManager.contents(at: url.appendingPathComponent(FileExplorer.signatureFilename))
        
        return try loadModule(identifier, fromManifest: manifest, creatingModuleWith: JSModule.Preview.getInit(withURL: url, andSignature: signature))
    }
    
    func removeModules(_ identifiers: [String]) throws {
        try documentExplorer.removeModules(identifiers.map({ try loadInstalledModule($0) }))
    }
    
    func removeAllModules() throws {
        try documentExplorer.removeAllModules()
    }
    
    func readModuleFiles(_ module: JSModule, _ isIncluded: (String) -> Bool = { _ in true }) throws -> [Data] {
        switch module {
        case .asset(let asset):
            return try assetsExplorer.readModuleFiles(asset, isIncluded)
        case .installed(let installed):
            return try documentExplorer.readModuleFiles(installed, isIncluded)
        case .preview(let preview):
            return try preview.files.lazy.filter(isIncluded).map { try fileManager.contents(at: preview.path.appendingPathComponent($0)) }
        }
    }
    
    func readModuleSources(_ module: JSModule) throws -> [Data] {
        try readModuleFiles(module) { $0.hasSuffix(".js") }
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
    
    private func loadModules<T: JSModuleProtocol, E: SourcesExplorer>(
        using explorer: E,
        creatingModuleWith moduleInit: JSModuleInit<T>
    ) throws -> [T] where E.T == T {
        try explorer.listModules().map { module in
            try loadModule(module, fromManifest: try explorer.readModuleManifest(module), creatingModuleWith: moduleInit)
        }
    }
    
    private func loadModule<T: JSModuleProtocol>(
        _ identifier: String,
        fromManifest manifestData: Data,
        creatingModuleWith moduleInit: JSModuleInit<T>
    ) throws -> T {
        let jsonDecoder = JSONDecoder()
    
        let manifest = try jsonDecoder.decode(ModuleManifest.self, from: manifestData)
        let namespace = manifest.src?.namespace
        let preferredEnvironment = manifest.jsenv?.ios ?? .webview
        
        return moduleInit(identifier, namespace, preferredEnvironment, manifest.include, manifest)
    }
}

// MARK: AssetsExplorer

private struct AssetsExplorer: SourcesExplorer {
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
        let path = Self.assetsURL.appendingPathComponent(Self.modulesDir).path
        guard fileManager.fileExists(atPath: path) else {
            return []
        }
        
        return try fileManager.contentsOfDirectory(atPath: path)
    }
    
    func modulePath(_ module: String, forPath path: String) throws -> String {
        "\(Self.modulesDir)/\(module)/\(path)"
    }
    
    func readModuleFiles(_ module: JSModule.Asset, _ isIncluded: (String) -> Bool) throws -> [Data] {
        try module.files.lazy
            .filter(isIncluded)
            .map { try readData(atPath: modulePath(module.identifier, forPath: $0)) }
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

private struct DocumentExplorer: SourcesExplorer, DynamicSourcesExplorer {
    typealias T = JSModule.Installed
    
    private static let modulesDir: String = "__airgap_protocol_modules__"
    private static let symbolsDir: String = "__symbols__"
    
    private let fileManager: FileManager
    
    private var documentsURL: URL? { fileManager.urls(for: .documentDirectory, in: .userDomainMask).first }
    private var modulesDirURL: URL? { documentsURL?.appendingPathComponent(Self.modulesDir) }
    private var symbolsDirURL: URL? { modulesDirURL?.appendingPathComponent(Self.symbolsDir) }
    
    init(fileManager: FileManager) {
        self.fileManager = fileManager
    }
    
    func removeModules(_ modules: [JSModule.Installed]) throws {
        guard let modulesDirURL = modulesDirURL else {
            return
        }
        
        guard let symbolsDirURL = symbolsDirURL else {
            return
        }
        
        var isDirectory: ObjCBool = true
        try modules.forEach { module in
            if fileManager.fileExists(atPath: modulesDirURL.path, isDirectory: &isDirectory) {
                try fileManager.removeItem(at: modulesDirURL.appendingPathComponent(module.identifier))
            }
            
            for symbol in module.symbols {
                guard fileManager.fileExists(atPath: symbolsDirURL.path, isDirectory: &isDirectory) else {
                    continue
                }
                
                try? fileManager.removeItem(at: symbolsDirURL.appendingPathComponent(symbol))
                try? fileManager.removeItem(at: symbolsDirURL.appendingPathComponent("\(symbol).metadata"))
            }
        }
    }
    
    func removeAllModules() throws {
        var isDirectory: ObjCBool = true
        guard let modulesDirURL = modulesDirURL, fileManager.fileExists(atPath: modulesDirURL.path, isDirectory: &isDirectory) else {
            return
        }
        
        try fileManager.removeItem(at: modulesDirURL)
    }
    
    func getInstalledTimestamp(forIdentifier identifier: String) -> String {
        guard let moduleDirURL = modulesDirURL?.appendingPathComponent(identifier) else {
            return ""
        }
        
        guard let attributes = try? fileManager.attributesOfItem(atPath: moduleDirURL.path) else {
            return ""
        }
        
        guard let creationDate = attributes[.creationDate] as? Date else {
            return ""
        }
        
        return String(Int64((creationDate.timeIntervalSince1970 * 1000.0).rounded()))
    }
    
    func listModules() throws -> [String] {
        guard let modulesDirURL = modulesDirURL else {
            return []
        }
        
        let modulesDirPath = modulesDirURL.path
        
        guard fileManager.fileExists(atPath: modulesDirPath) else {
            return []
        }
        
        return try fileManager.contentsOfDirectory(atPath: modulesDirPath).filter { $0 != Self.symbolsDir }
    }
    
    func modulePath(_ module: String, ofPath path: String? = nil) -> String {
        let moduleDir = "\(Self.modulesDir)/\(module)"
        guard let path = path else {
            return moduleDir
        }
        
        return "\(moduleDir)/\(path)"
    }
    
    func readModuleFiles(_ module: JSModule.Installed, _ isIncluded: (String) -> Bool) throws -> [Data] {
        try module.files.lazy
            .filter(isIncluded)
            .map { try readData(atPath: modulePath(module.identifier, ofPath: $0)) }
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

// MARK: SourcesExplorer

private protocol SourcesExplorer {
    associatedtype T
    
    func listModules() throws -> [String]
    
    func readModuleFiles(_ module: T, _ isIncluded: (String) -> Bool) throws -> [Data]
    func readModuleManifest(_ module: String) throws -> Data
}

private protocol DynamicSourcesExplorer {
    associatedtype T
    
    func removeModules(_ identifiers: [T]) throws
    func removeAllModules() throws
    
    func getInstalledTimestamp(forIdentifier identifier: String) -> String
}

// MARK: Extensions

private extension JSModule.Asset {
    static func getInit() -> JSModuleInit<JSModule.Asset> {
        { (identifier, namespace, preferredEnvironment, files, _) -> JSModule.Asset in
            .init(
                identifier: identifier,
                namespace: namespace,
                preferredEnvironment: preferredEnvironment,
                files: files
            )
        }
    }
}

private extension JSModule.Installed {
    static func getInit<T: DynamicSourcesExplorer>(using explorer: T) -> JSModuleInit<JSModule.Installed> {
        { (identifier, namespace, preferredEnvironment, files, manifest) -> JSModule.Installed in
                .init(
                    identifier: identifier,
                    namespace: namespace,
                    preferredEnvironment: preferredEnvironment,
                    files: files,
                    symbols: Array((manifest.res?.symbol ?? [:]).keys),
                    installedAt: explorer.getInstalledTimestamp(forIdentifier: identifier)
                )
        }
    }
}

private extension JSModule.Preview {
    static func getInit(withURL url: URL, andSignature signature: Data) -> JSModuleInit<JSModule.Preview> {
        { (identifier, namespace, preferredEnvironment, files, _) -> JSModule.Preview in
            .init(
                identifier: identifier,
                namespace: namespace,
                preferredEnvironment: preferredEnvironment,
                files: files,
                path: url,
                signature: signature
            )
        }
    }
}

private extension FileExplorer {
    static let manifestFilename: String = "manifest.json"
    static let signatureFilename: String = "module.sig"
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

// MARK: Aliases

typealias JSModuleInit<T: JSModuleProtocol> = (_ identifier: String, _ namespace: String?, _ preferredEnvironment: JSEnvironmentKind, _ sources: [String], _ manifest: ModuleManifest) -> T
