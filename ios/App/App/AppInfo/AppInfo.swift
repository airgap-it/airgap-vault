//
//  AppInfo.swift
//  App
//
//  Created by Julia Samol on 16.01.20.
//

import Foundation
import Capacitor

@objc(AppInfo)
public class AppInfo: CAPPlugin {
    
    @objc func get(_ call: CAPPluginCall) {
        call.resolve([
            Key.APP_NAME: UIApplication.displayName,
            Key.PACKAGE_NAME: UIApplication.bundleIdentifier,
            Key.VERSION_NAME: UIApplication.version,
            Key.VERSION_CODE: UIApplication.build
        ])
    }
    
    private struct Key {
        static let APP_NAME = "appName"
        static let PACKAGE_NAME = "packageName"
        static let VERSION_NAME = "versionName"
        static let VERSION_CODE = "versionCode"
    }
}

private extension UIApplication {
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
