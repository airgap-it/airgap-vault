//
//  Filesystem.swift
//  App
//
//  Created by Julia Samol on 14.02.23.
//

import Foundation

enum Directory: String {
    case documents = "DOCUMENTS"
    case data = "DATA"
    case library = "LIBRARY"
    case cache = "CACHE"
    case external = "EXTERNAL"
    case externalStorage = "EXTERNAL_STORAGE"
}

extension FileManager {
    func getDirectory(from directory: Directory?) -> FileManager.SearchPathDirectory? {
        switch directory {
        case .library:
            return .libraryDirectory
        case .cache:
            return .cachesDirectory
        case .documents, .data, .external, .externalStorage:
            return .documentDirectory
        default:
            return nil
        }
    }
}
