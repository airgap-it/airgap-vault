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
