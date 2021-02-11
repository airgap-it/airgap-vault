//
//  VaultError.swift
//  App
//
//  Created by Mike Godenzi on 28.01.21.
//

import Foundation

struct VaultError: Error {

    public let domain: Domain
    public let code: Code
    public var message: String
    public let other: Swift.Error?

    init(domain: Domain, code: Code, message: String = "", other: Swift.Error? = nil) {
        if let other = other as? VaultError {
            self = other
            return
        }
        self.domain = domain
        self.code = code
        self.message = message
        self.other = other
    }

    init(domain: Domain, other: Swift.Error? = nil) {
        self.init(domain: domain, code: .other, other: other)
    }

    public struct Domain: RawRepresentable, ExpressibleByStringLiteral, Equatable {

        public typealias StringLiteralType = String
        public typealias RawValue = String

        public let rawValue: String

        public init?(rawValue: RawValue) {
            self.rawValue = rawValue
        }

        public init(stringLiteral value: StringLiteralType) {
            self.rawValue = value
        }
    }

    public struct Code: RawRepresentable, Equatable, ExpressibleByIntegerLiteral {

        public typealias RawValue = Int
        public typealias IntegerLiteralType = RawValue

        public static let unknown: Code = -1
        public static let other: Code = -2

        public let rawValue: RawValue

        public init?(rawValue: RawValue) {
            self.rawValue = rawValue
        }

        public init(integerLiteral value: IntegerLiteralType) {
            self.rawValue = value
        }

        public init(_ code: Int) {
            self.rawValue = code
        }
    }
}

extension VaultError.Code: Comparable {

    static func <(lhs: Self, rhs: Self) -> Bool {
        return lhs.rawValue < rhs.rawValue
    }
}

extension VaultError: CustomStringConvertible {

    public var description: String {
        var result = baseDescription
        if let other = other {
            result += " - \(other.localizedDescription)"
        }
        return result
    }

    public var localizedDescription: String {
        guard let other = other else {
            return baseDescription
        }
        return other.localizedDescription
    }

    private var baseDescription: String {
        let description = "\(domain.rawValue) (\(code.rawValue)): \(message)"

        let charactersToTrim = CharacterSet(charactersIn: ":").union(.whitespacesAndNewlines)
        return description.trimmingCharacters(in: charactersToTrim)
    }
}
