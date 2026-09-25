//
//  Zip.swift
//  App
//
//  Created by Julia Samol on 19.01.23.
//

import Foundation
import Capacitor
import ZIPFoundation

@objc(Zip)
public class Zip: CAPPlugin {
    
    @objc func unzip(_ call: CAPPluginCall) {
        call.assertReceived(forMethod: "unzip", requiredParams: Param.FROM, Param.TO)
        
        do {
            guard let sourceURL = getFileURL(at: call.from, locatedIn: call.directory) else {
                throw Error.invalidPath("from")
            }
            
            guard let destinationURL = getFileURL(at: call.to, locatedIn: call.toDirectory) else {
                throw Error.invalidPath("to")
            }
            
            try unzip(from: sourceURL, to: destinationURL)
            call.resolve()
        } catch {
            call.reject("Error: \(error)")
        }
    }
    
    private func unzip(from sourceURL: URL, to destinationURL: URL) throws {
        try validateEntryPaths(of: sourceURL, against: destinationURL)
        try FileManager.default.createDirectory(at: destinationURL, withIntermediateDirectories: true)
        try FileManager.default.unzipItem(at: sourceURL, to: destinationURL)
    }

    /// Rejects archives containing entries that would be written outside `destinationURL`
    /// (e.g. `../` components or absolute paths). Defends the extraction sink independently
    /// of the ZIPFoundation version (CVE-2023-39138).
    private func validateEntryPaths(of sourceURL: URL, against destinationURL: URL) throws {
        let archive = try Archive(url: sourceURL, accessMode: .read)
        let root = destinationURL.standardizedFileURL.path
        for entry in archive {
            let target = destinationURL.appendingPathComponent(entry.path).standardizedFileURL.path
            guard target == root || target.hasPrefix(root.hasSuffix("/") ? root : root + "/") else {
                throw Error.pathTraversal(entry.path)
            }
        }
    }
    
    private func getFileURL(at path: String, locatedIn directory: Directory?) -> URL? {
        if let directory = FileManager.default.getDirectory(from: directory) {
            guard let dir = FileManager.default.urls(for: directory, in: .userDomainMask).first else {
                return nil
            }
            
            return !path.isEmpty ? dir.appendingPathComponent(path) : dir
        } else {
            return URL(string: path)
        }
    }
    
    struct Param {
        static let FROM = "from"
        static let TO = "to"
        static let DIRECTORY = "directory"
        static let TO_DIRECTORY = "toDirectory"
    }
    
    private enum Error: Swift.Error {
        case invalidPath(String)
        case pathTraversal(String)
    }
}

private extension CAPPluginCall {
    var from: String { return getString(Zip.Param.FROM)! }
    var to: String { return getString(Zip.Param.TO)! }
    
    var directory: Directory? {
        guard let directory = getString(Zip.Param.DIRECTORY) else { return nil }
        return .init(rawValue: directory)
    }
    
    var toDirectory: Directory? {
        guard let toDirectory = getString(Zip.Param.TO_DIRECTORY) else { return nil }
        return .init(rawValue: toDirectory)
    }
}
