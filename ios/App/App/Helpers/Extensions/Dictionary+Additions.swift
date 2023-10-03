//
//  Dictionary+Additions.swift
//  App
//
//  Created by Julia Samol on 04.09.23.
//

import Foundation

extension Dictionary {
    @inlinable subscript(key: Key, setDefault defaultValue: @autoclosure () -> Value) -> Value {
        mutating get {
            guard let value = self[key] else {
                let value = defaultValue()
                self[key] = value
                
                return value
            }
            
            return value
        }
        set {
            self[key] = newValue
        }
    }
}
