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
        try FileManager.default.createDirectory(at: destinationURL, withIntermediateDirectories: true)
        try FileManager.default.unzipItem(at: sourceURL, to: destinationURL)
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
