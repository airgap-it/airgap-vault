//
//  JSValue+Additions.swift
//  App
//
//  Created by Julia Samol on 20.09.22.
//

import Foundation
import Capacitor

extension String: JSONConvertible {
    
    func toJSONString() throws -> String {
        return "\"\(self)\""
    }
}

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
        let elements = try map { value -> String in
            if JSONSerialization.isValidJSONObject(value) {
                let data = try JSONSerialization.data(withJSONObject: value, options: [])
                return String(data: data, encoding: .utf8)!
            } else if let encodable = value as? Encodable {
                let jsonEncoder = JSONEncoder()
                let data = try jsonEncoder.encode(encodable)
                return String(data: data, encoding: .utf8)!
            } else if let jsonConvertible = value as? JSONConvertible {
                return try jsonConvertible.toJSONString()
            } else {
                throw JSError.invalidJSON
            }
        }
        
        return "[\(elements.joined(separator: ","))]"
    }
}

extension NSNumber: JSONConvertible {
    
    func toJSONString() throws -> String {
        stringValue
    }
}

extension NSNull: JSONConvertible {
    
    func toJSONString() throws -> String {
        "null"
    }
}
