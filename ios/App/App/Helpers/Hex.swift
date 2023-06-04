//
//  Hex.swift
//  App
//
//  Created by Julia Samol on 17.04.23.
//

import Foundation

extension String {
    private static let hexPrefix = "0x"
    
    var isHex: Bool {
        range(of: "^(\(Self.hexPrefix))?([0-9a-fA-F]{2})*$", options: .regularExpression) != nil
    }

    
    func asBytes() throws -> [UInt8] {
        if !isHex {
            throw Error.invalidHex(self)
        }
        
        let value = removing(prefix: Self.hexPrefix)
        
        var bytes = [UInt8]()
        bytes.reserveCapacity(value.count / 2)
        
        for (position, index) in value.indices.enumerated() {
            guard position % 2 == 0 else {
                continue
            }
            let byteRange = index...value.index(after: index)
            let byteSlice = value[byteRange]
            guard let byte = UInt8(byteSlice, radix: 16) else {
                throw Error.invalidHex(String(byteSlice))
            }
            bytes.append(byte)
        }
        
        return bytes
    }
    
    func removing(prefix: String) -> String {
        guard hasPrefix(prefix) else {
            return self
        }
        
        let index = index(startIndex, offsetBy: prefix.count)
        return String(self[index...])
    }

}

private enum Error: Swift.Error {
    case invalidHex(String)
}
