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
        assertReceived(in: jsObjectRepresentation, forMethod: methodName, requiredParams: requiredParams, acceptEmpty: acceptEmpty)
    }
    
    func assertReceived(in jsObject: JSObject, forMethod methodName: String, requiredParams: String..., acceptEmpty: Bool = false) {
        assertReceived(in: jsObject, forMethod: methodName, requiredParams: requiredParams, acceptEmpty: acceptEmpty)
    }
    
    func assertReceived(in jsObject: JSObject, forMethod methodName: String, requiredParams: [String], acceptEmpty: Bool = false) {
        let hasAll = requiredParams.map { jsObject[$0] != nil }.reduce(true, { x, y in x && y })
        let hasEmpty = !acceptEmpty && requiredParams.map { param in (jsObject[param] as? String)?.isEmpty ?? false }.reduce(false, { x, y in x || y })
        
        if (!hasAll || hasEmpty) {
            reject("\(methodName) requires: \(requiredParams.joined(separator: ","))")
        }
    }
}
