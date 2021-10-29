//
//  PluginCall+Additions.swift
//  App
//
//  Created by Julia Samol on 20.01.20.
//

import Foundation
import Capacitor

extension CAPPluginCall {
    func assertReceived(forMethod methodName: String, requiredParams: String..., acceptEmpty: Bool = false) {
        let hasAll = requiredParams.map { options[$0] != nil }.reduce(true, { x, y in x && y })
        let hasEmpty = !acceptEmpty && requiredParams.map { param in getString(param)?.isEmpty ?? false }.reduce(false, { x, y in x || y })
        
        if (!hasAll || hasEmpty) {
            reject("\(methodName) requires: \(requiredParams.joined(separator: ","))")
        }
    }
}
