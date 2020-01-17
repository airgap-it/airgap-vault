//
//  Bundle+Additions.swift
//  App
//
//  Created by Julia Samol on 16.01.20.
//

import Foundation
import UIKit

extension UIApplication {
    static var displayName: String {
        return Bundle.main.object(forInfoDictionaryKey: "CFBundleDisplayName") as? String ?? ""
    }
    
    static var bundleIdentifier: String {
        return Bundle.main.bundleIdentifier ?? ""
    }
    
    static var version: String {
        return Bundle.main.object(forInfoDictionaryKey: "CFBundleShortVersionString") as? String ?? ""
    }
    
    static var build: String {
        return Bundle.main.object(forInfoDictionaryKey: kCFBundleVersionKey as String) as? String ?? ""
    }
}
