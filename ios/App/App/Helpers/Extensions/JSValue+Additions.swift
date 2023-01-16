//
//  JSValue+Additions.swift
//  App
//
//  Created by Julia Samol on 20.09.22.
//

import Foundation
import Capacitor

extension JSObject: JSONConvertible {
    
    func toJSONString() throws -> String {
        guard JSONSerialization.isValidJSONObject(self) else {
            throw JSError.invalidJSON
        }
        
        let data = try JSONSerialization.data(withJSONObject: self, options: [])
        return String(data: data, encoding: .utf8)!
    }
}

extension JSArray: JSONConvertible {
    
    func toJSONString() throws -> String {
        let jsonEncoder = JSONEncoder()
        let elements = try map { (value: JSValue) throws -> String in
            if JSONSerialization.isValidJSONObject(value) {
                let data = try JSONSerialization.data(withJSONObject: value, options: [])
                return String(data: data, encoding: .utf8)!
            } /*else if let encodable = value as? Encodable {
                let data = try jsonEncoder.encode(encodable)
                return String(data: data, encoding: .utf8)!
            } */else if let jsonConvertible = value as? JSONConvertible {
                return try jsonConvertible.toJSONString()
            } else {
                throw JSError.invalidJSON
            }
        }
        
        return "[\(elements.joined(separator: ","))]"
    }
}
