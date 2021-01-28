//
//  LocalAuthentication.swift
//  AGUtilities
//
//  Created by Mike Godenzi on 25.06.19.
//  Copyright © 2019 Mike Godenzi. All rights reserved.
//

import Foundation
import LocalAuthentication
import UIKit

extension VaultError.Domain {
    static let localAuthentication: Self = "LocalAuthentication"
}

extension VaultError.Code {
    static let cancelled: Self = -300
    static let passwordMismatch: Self = -301
}

extension VaultError {
    static let cancelled = VaultError(domain: .localAuthentication, code: .cancelled, message: "Operation cancelled")
    static let passwordMismatch = VaultError(domain: .localAuthentication, code: .passwordMismatch, message: "The password does not match")
}

class LocalAuthentication {

    static let shared = LocalAuthentication()

    private static var automaticKey = "local_auth_automatic"
    private static var authenticationReasonKey = "local_auth_reason"
    private static var localAuthenticationKey = "local_authentication_key"
    private static var policyStateKey = "policy_state_key"
    private static var localAuthenticationData = { return "local_authentication".data(using: .utf8)! }()
    private static var defaultAuthenticationReason = "Please authenticate to continue to use the app."

    private lazy var context: LAContext = {
        let result = LAContext()
        result.localizedReason = self.localizedAuthenticationReason
        return result
    }()

    private var queue: OperationQueue = {
        let result = OperationQueue()
        result.maxConcurrentOperationCount = 1
        result.name = "ch.papers.security-utils.LocalAuthentication"
        return result
    }()

    private var lastAuthentication: Date = .distantFuture
    private var lastBackground: Date?
    var invalidateAfter: TimeInterval = 10
    fileprivate(set) var isAuthenticated = false

    private var defaults: UserDefaults { return UserDefaults.standard }
    var automatic: Bool {
        get {
            return defaults.bool(forKey: LocalAuthentication.automaticKey)
        }
        set {
            defer {
                updateAutomaticAuthenticationIfNeeded()
            }
            let current = self.automatic
            guard current != newValue else {
                return
            }
            defaults.set(newValue, forKey: LocalAuthentication.automaticKey)
        }
    }

    private var currentBiometrySate: Data? {
        get { return defaults.data(forKey: LocalAuthentication.policyStateKey) }
        set {
            let currentValue = currentBiometrySate
            guard newValue != nil && newValue != currentValue else {
                return
            }
            defaults.set(newValue, forKey: LocalAuthentication.policyStateKey)
        }
    }

    var localizedAuthenticationReason: String {
        get {
            return defaults.string(forKey: LocalAuthentication.authenticationReasonKey) ?? LocalAuthentication.defaultAuthenticationReason
        }
        set {
            defaults.set(newValue, forKey: LocalAuthentication.authenticationReasonKey)
            context.localizedReason = newValue
        }
    }

    private var didBecomeActiveObserver: Observer?
    private var didEnterBackgroundObserver: Observer?
    private var needsAccessInvalidation: Bool { return Date() > lastAuthentication.addingTimeInterval(invalidateAfter) }

    private var needsAuthenticationInvalidation: Bool {
        guard let lastBackground = self.lastBackground else {
            return false
        }
        let now = Date()
        return now > lastBackground.addingTimeInterval(invalidateAfter)
    }

    static func defaultAccessFlags() -> SecAccessControlCreateFlags {
        return [.userPresence]
    }

    private static func canUseBiometrics(with context: LAContext = LAContext()) -> Bool {
        var error: NSError?
        var canUseBiometrics = context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error)
        if !canUseBiometrics, let error = error as? LAError {
            canUseBiometrics = LAError.Code(rawValue: error.errorCode) == .biometryLockout ? true : canUseBiometrics
        }
        return canUseBiometrics
    }

    struct PasswordPrompt {
        let title: String
        let message: String
    }

    private func createPromptOperations(from prompts: [PasswordPrompt]) -> [PasswordPromptOperation] {
        var passwordPromptOperations = [PasswordPromptOperation]()
        passwordPromptOperations.reserveCapacity(prompts.count)
        for prompt in prompts {
            let previous = passwordPromptOperations.first
            let current = PasswordPromptOperation(prompt: prompt, previousPromptOperation: previous)
            passwordPromptOperations.insert(current, at: 0)
        }
        return passwordPromptOperations
    }

    private func extractPassword(from operations: [PasswordPromptOperation]) throws -> String? {
        var password: String? = nil
        for operation in operations {
            if let error = operation.error {
                throw error
            }
            if let currentPassword = operation.password, let prevPassword = password, currentPassword != prevPassword {
                throw VaultError.passwordMismatch
            }
            password = operation.password
        }
        return password
    }

    func fetchContextForSecureItemAccess(using prompts: [PasswordPrompt], _ authenticationHandler: @escaping (Result<LAContext, VaultError>) -> Bool) {
        let invalidateOperation = InvalidateOperation(localAuth: self, condition: self.needsAccessInvalidation)
        let passwordPromptOperations = createPromptOperations(from: prompts)
        passwordPromptOperations.last?.addDependency(invalidateOperation)
        let operation = BlockOperation {
            let context = self.context
            if !passwordPromptOperations.isEmpty {
                do {
                    let password = try self.extractPassword(from: passwordPromptOperations)
                    if let password = password {
                        context.setCredential(password.data(using: .utf8), type: .applicationPassword)
                    }
                } catch {
                    _ = authenticationHandler(.failure(VaultError(domain: .localAuthentication, other: error)))
                    return
                }
            }
            if authenticationHandler(.success(context)) {
                self.lastAuthentication = Date()
                self.isAuthenticated = true
            }
        }
        operation.addDependency(passwordPromptOperations.first ?? invalidateOperation)
        enqueue(operation)
    }

    func authenticate(localizedReason reason: String? = nil, completion: @escaping (Result<Bool, VaultError>) -> ()) {
        let operation = AuthenticationOperation(localAuth: self)
        operation.localizedReason = reason ?? context.localizedReason
        let invalidate = InvalidateOperation(localAuth: self, condition: self.needsAuthenticationInvalidation)
        operation.addDependency(invalidate)
        operation.completionBlock = { [unowned operation] in
            guard operation.error == nil else {
                completion(.failure(operation.error!))
                return
            }
            completion(.success(operation.result))
        }
        enqueue(operation)
    }

    func invalidate(completion: @escaping () -> ()) {
        let operation = InvalidateOperation(localAuth: self, condition: true)
        operation.completionBlock = completion
        queue.addOperation(operation)
    }

    func setInvalidationTimeout(_ timeout: TimeInterval) {
        queue.addOperation {
            self.invalidateAfter = timeout
        }
    }

    func updateAutomaticAuthenticationIfNeeded() {
        if automatic && didBecomeActiveObserver == nil {
            didBecomeActiveObserver = Observer(name: UIApplication.didBecomeActiveNotification, object: UIApplication.shared) { [unowned self] _ in
                self.authenticate() { result in
                    if case let .failure(error) = result {
                        print(error)
                    }
                }
            }
            didEnterBackgroundObserver = Observer(name: UIApplication.didEnterBackgroundNotification, object: UIApplication.shared, queue: queue) { [unowned self] _ in
                self.lastBackground = Date()
            }
        } else if !automatic && didBecomeActiveObserver != nil {
            didBecomeActiveObserver = nil
            didEnterBackgroundObserver = nil
        }
    }

    private func enqueue(_ operation: Operation) {
        for dependent in operation.dependencies where !dependent.isFinished && !dependent.isExecuting {
            enqueue(dependent)
        }
        queue.addOperation(operation)
    }

    class AsyncOperation: Operation {

        override open var isAsynchronous: Bool {
            return true
        }

        private var _isExecuring: Bool = false
        private static let isExecutingKey = "isExecuting"
        override open var isExecuting: Bool {
            get {
                return _isExecuring
            }
            set {
                willChangeValue(forKey: AsyncOperation.isExecutingKey)
                _isExecuring = newValue
                didChangeValue(forKey: AsyncOperation.isExecutingKey)
            }
        }

        private var _isFinished: Bool = false
        private static let isFinishedKey = "isFinished"
        override open var isFinished: Bool {
            get {
                return _isFinished
            }
            set {
                willChangeValue(forKey: AsyncOperation.isFinishedKey)
                _isFinished = newValue
                didChangeValue(forKey: AsyncOperation.isFinishedKey)
            }
        }

        var error: VaultError?

        override func start() {
            guard !isCancelled else {
                return
            }

            isExecuting = true

            perform {
                self.stop()
            }
        }

        func perform(completion: @escaping () -> ()) {
            completion()
        }

        override open func cancel() {
            if error == nil {
                error = .cancelled
            }
            super.cancel()
            stop()
        }

        func cancel(with error: VaultError) {
            self.error = error
            self.cancel()
        }

        private func stop() {
            if !isFinished {
                isFinished = true
            }
            if isExecuting {
                isExecuting = false
            }
        }
    }

    class AuthenticationOperation: AsyncOperation {

        unowned let localAuth: LocalAuthentication
        var context: LAContext { return localAuth.context }
        var localizedReason: String = "Please authenticate"
        private(set) var result: Bool = false

        init(localAuth: LocalAuthentication) {
            self.localAuth = localAuth
        }

        override func perform(completion: @escaping () -> ()) {
            guard !localAuth.isAuthenticated else {
                result = true
                self.localAuth.lastBackground = nil
                completion()
                return
            }

            do {
                try authenticate()
                result = true
                self.localAuth.lastAuthentication = Date()
                self.localAuth.isAuthenticated = true
            } catch {
                self.error = VaultError(domain: .localAuthentication, other: error)
                result = false
            }
            self.localAuth.lastBackground = nil
            completion()
        }

        private func authenticate(savePolicyState: Bool = false) throws {
            do {
                _ = try Keychain.Password.load(account: LocalAuthentication.localAuthenticationKey, includeData: false, using: context)
                if savePolicyState {
                    localAuth.currentBiometrySate = context.evaluatedPolicyDomainState
                }
            } catch {
                guard
                    let keychainError = error as? VaultError,
                    keychainError.domain == .keychain && keychainError.code == .itemNotFound else {
                        throw error
                }
                let flags = LocalAuthentication.defaultAccessFlags()
                let item = Keychain.Password(
                    data: LocalAuthentication.localAuthenticationData,
                    account: LocalAuthentication.localAuthenticationKey,
                    accessControl: flags
                )
                try item.save()
                if #available(iOS 11.3, *) {
                    try authenticate(savePolicyState: flags.contains(.biometryCurrentSet))
                } else {
                    try authenticate(savePolicyState: flags.contains(.touchIDCurrentSet))
                }
            }
        }
    }

    class InvalidateOperation: Operation {

        unowned let localAuth: LocalAuthentication
        private let condition: () -> Bool

        init(localAuth: LocalAuthentication, condition: @escaping @autoclosure () -> Bool) {
            self.localAuth = localAuth
            self.condition = condition
        }

        override func main() {
            guard condition() else {
                return
            }
            let context = LAContext()
            context.localizedReason = localAuth.localizedAuthenticationReason
            localAuth.context.invalidate()
            localAuth.context = context
            localAuth.isAuthenticated = false
        }
    }

    class PasswordPromptOperation: AsyncOperation {

        let prompt: PasswordPrompt
        let previousPromptOperation: PasswordPromptOperation?
        var password: String?

        private var outterController: UIViewController? {
            guard let root = UIApplication.shared.keyWindow?.rootViewController else {
                return nil
            }
            var result = root
            while let presented = result.presentedViewController, !presented.isBeingDismissed {
                result = presented
            }
            return result
        }

        init(prompt: PasswordPrompt, previousPromptOperation: PasswordPromptOperation? = nil) {
            self.prompt = prompt
            self.previousPromptOperation = previousPromptOperation
            super.init()
            if let operation = previousPromptOperation {
                addDependency(operation)
            }
        }

        override func perform(completion: @escaping () -> ()) {
            if let error = previousPromptOperation?.error {
                self.error = error
                completion()
                return
            }
            DispatchQueue.main.async {
                let alert = UIAlertController(title: self.prompt.title, message: self.prompt.message, preferredStyle: .alert)
                alert.addTextField { (textField) in
                    textField.isSecureTextEntry = true
                }
                alert.addAction(UIAlertAction(title: "Ok", style: .default, handler: { [weak alert, unowned self] _ in
                    self.password = alert?.textFields?.first?.text
                    completion()
                }))
                alert.addAction(UIAlertAction(title: "Cancel", style: .cancel, handler: { _ in
                    self.error = .cancelled
                    completion()
                }))

                self.outterController?.present(alert, animated: true)
            }
        }
    }
}
