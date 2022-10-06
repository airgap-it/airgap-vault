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
        let elements = try map {
            if JSONSerialization.isValidJSONObject($0) {
                let data = try JSONSerialization.data(withJSONObject: $0, options: [])
                return String(data: data, encoding: .utf8)!
            } else if let encodable = $0 as? Encodable {
                let jsonEncoder = JSONEncoder()
                let data = try jsonEncoder.encode(encodable)
                return String(data: data, encoding: .utf8)!
            } else if let jsonConvertible = $0 as? JSONConvertible {
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
