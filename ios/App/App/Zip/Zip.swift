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
    
    private func getFileURL(at path: String, locatedIn directory: String?) -> URL? {
        if let directory = getDirectory(from: directory) {
            guard let dir = FileManager.default.urls(for: directory, in: .userDomainMask).first else {
                return nil
            }
            
            return !path.isEmpty ? dir.appendingPathComponent(path) : dir
        } else {
            return URL(string: path)
        }
    }
    
    private func getDirectory(from directory: String?) -> FileManager.SearchPathDirectory? {
        switch directory {
        case Directory.LIBRARY:
            return .libraryDirectory
        case Directory.CACHE:
            return .cachesDirectory
        case Directory.DOCUMENTS,
             Directory.DATA,
             Directory.EXTERNAL,
             Directory.EXTERNAL_STORAGE:
            return .documentDirectory
        default:
            return nil
        }
    }
    
    struct Param {
        static let FROM = "from"
        static let TO = "to"
        static let DIRECTORY = "directory"
        static let TO_DIRECTORY = "toDirectory"
    }
    
    private struct Directory {
        static let DOCUMENTS = "DOCUMENTS"
        static let DATA = "DATA"
        static let LIBRARY = "LIBRARY"
        static let CACHE = "CACHE"
        static let EXTERNAL = "EXTERNAL"
        static let EXTERNAL_STORAGE = "EXTERNAL_STORAGE"
    }
    
    private enum Error: Swift.Error {
        case invalidPath(String)
    }
}

private extension CAPPluginCall {
    var from: String { return getString(Zip.Param.FROM)! }
    var to: String { return getString(Zip.Param.TO)! }
    
    var directory: String? { return getString(Zip.Param.DIRECTORY) }
    var toDirectory: String? { return getString(Zip.Param.TO_DIRECTORY) }
}
