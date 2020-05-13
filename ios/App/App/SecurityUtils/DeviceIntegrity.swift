import Cordova
//
//  DeviceIntegrity.swift
//  AGUtilities
//
//  Created by Mike Godenzi on 14.06.19.
//  Copyright © 2019 Mike Godenzi. All rights reserved.
//

import Foundation
import MachO

public enum DeviceIntegrity {

    private static let fileList = """
    L3ByaXZhdGUvdmFyL3N0YXNoCi9wcml2YXRlL3Zhci9saWIvYXB0Ci9wcml2YXRlL3Zhci90bXAvY3lkaWEubG9nCi9wcml2YXRlL3Zhci9saWIvY3lkaWEKL3ByaXZhdGUvdmFyL21vYmlsZS9MaWJyYXJ5L1NCU2V0dGluZ3MvVGhlbWVzCi9MaWJyYXJ5L01vYmlsZVN1YnN0cmF0ZS9Nb2JpbGVTdWJzdHJhdGUuZHlsaWIKL0xpYnJhcnkvTW9iaWxlU3Vic3RyYXRlL0R5bmFtaWNMaWJyYXJpZXMvVmVlbmN5LnBsaXN0Ci9MaWJyYXJ5L01vYmlsZVN1YnN0cmF0ZS9EeW5hbWljTGlicmFyaWVzL0xpdmVDbG9jay5wbGlzdAovU3lzdGVtL0xpYnJhcnkvTGF1bmNoRGFlbW9ucy9jb20uaWtleS5iYm90LnBsaXN0Ci9TeXN0ZW0vTGlicmFyeS9MYXVuY2hEYWVtb25zL2NvbS5zYXVyaWsuQ3lkaWEuU3RhcnR1cC5wbGlzdAovdmFyL2NhY2hlL2FwdAovdmFyL2xpYi9hcHQKL3Zhci9saWIvY3lkaWEKL3Zhci9sb2cvc3lzbG9nCi92YXIvdG1wL2N5ZGlhLmxvZwovYmluL2Jhc2gKL2Jpbi9zaAovdXNyL3NiaW4vc3NoZAovdXNyL2xpYmV4ZWMvc3NoLWtleXNpZ24KL3Vzci9zYmluL3NzaGQKL3Vzci9iaW4vc3NoZAovdXNyL2xpYmV4ZWMvc2Z0cC1zZXJ2ZXIKL2V0Yy9zc2gvc3NoZF9jb25maWcKL2V0Yy9hcHQKL0FwcGxpY2F0aW9ucy9DeWRpYS5hcHAKL0FwcGxpY2F0aW9ucy9Sb2NrQXBwLmFwcAovQXBwbGljYXRpb25zL0ljeS5hcHAKL0FwcGxpY2F0aW9ucy9XaW50ZXJCb2FyZC5hcHAKL0FwcGxpY2F0aW9ucy9TQlNldHRpbmdzLmFwcAovQXBwbGljYXRpb25zL014VHViZS5hcHAKL0FwcGxpY2F0aW9ucy9JbnRlbGxpU2NyZWVuLmFwcAovQXBwbGljYXRpb25zL0Zha2VDYXJyaWVyLmFwcAovQXBwbGljYXRpb25zL2JsYWNrcmExbi5hcHA=
    """

    private static let linkList = """
    L0xpYnJhcnkvUmluZ3RvbmVzCi9MaWJyYXJ5L1dhbGxwYXBlcgovdXNyL2luY2x1ZGUKL3Vzci9saWJleGVjCi91c3Ivc2hhcmUKL0FwcGxpY2F0aW9ucw==
    """

    private static let RTLD_DEFAULT = UnsafeMutableRawPointer(bitPattern: -2)

    private static let queue = DispatchQueue(label: "it.airgap.DI", qos: .default)

    @inline(__always) public static func assess(completion: @escaping (ResultSet) -> () ) {
        DeviceIntegrity.queue.async {
            let result: ResultSet = [
                checkFiles(),
                checkLinks(),
                checkSyscalls(),
                checkWrite(),
                checkLibraries(),
                checkDebugger()
            ]
            completion(result)
        }
    }

    @inline(__always) private static func checkFiles() -> ResultSet {
        #if !targetEnvironment(simulator)

        typealias Access = @convention(c) (UnsafePointer<Int8>, Int32) -> Int32

        guard let access: Access = lookup(.access) else {
            return .state
        }

        return checkPaths(DeviceIntegrity.fileList) { path in
            return path.withCString { cString in
                return access(cString, F_OK) == -1 ? .ok : .files
            }
        }

        #else
        return .ok
        #endif
    }

    @inline(__always) private static func checkLinks() -> ResultSet {
        #if !targetEnvironment(simulator)

        typealias Lstat = @convention(c) (UnsafePointer<Int8>, UnsafeMutablePointer<stat>) -> Int32

        guard let lstat: Lstat = lookup(.lstat) else {
            return .state
        }

        return checkPaths(DeviceIntegrity.linkList) { (path) in
            return path.withCString { cString in
                var s = stat()
                _ = lstat(cString, &s)
                return (s.st_mode & S_IFMT) == S_IFLNK ? .links : .ok
            }
        }

        #else
        return .ok
        #endif
    }

    @inline(__always) private static func checkPaths(_ string: String, using block: (String) -> ResultSet) -> ResultSet {
        guard let paths = string.base64Decode() else {
            return .state
        }
        let list = paths.split(separator: "\n")
        for path in list {
            let result = block(String(path))
            guard result == .ok else {
                return result
            }
        }
        return .ok
    }

    @inline(__always) private static func checkSyscalls() -> ResultSet {
        #if !targetEnvironment(simulator)

        typealias Fork = @convention(c) () -> Int32
        typealias System = @convention(c) (Int32) -> Int32

        guard
            let fork: Fork = lookup(.fork),
            let system: System = lookup(.system)    else {
                return .state
        }

        guard fork() == -1 else {
            return .syscalls
        }

        guard system(0) == 0 else {
            return .syscalls
        }

        #endif
        return .ok
    }

    @inline(__always) private static func lookup<FunctionType>(_ function: Function) -> FunctionType? {

        typealias Dlsym = @convention(c) (UnsafeMutableRawPointer?, UnsafePointer<Int8>) -> UnsafeMutableRawPointer?

        let dlsymFnc: Dlsym? = Function.dlsym.name?.withCString { cString in
            guard let fnc = dlsym(DeviceIntegrity.RTLD_DEFAULT, cString) else {
                return nil
            }
            return unsafeBitCast(fnc, to: Dlsym.self)
        }

        guard let dlsym = dlsymFnc else {
            return nil
        }

        return function.name?.withCString { cString in
            guard let fnc = dlsym(DeviceIntegrity.RTLD_DEFAULT, cString) else {
                return nil
            }
            return unsafeBitCast(fnc, to: FunctionType.self)
        }
    }

    @inline(__always) private static func checkWrite() -> ResultSet {
        #if !targetEnvironment(simulator)

        typealias Access = @convention(c) (UnsafePointer<Int8>, Int32) -> Int32

        guard
            let access: Access = lookup(.access),
            let privatePath = "L3ByaXZhdGU=".base64Decode() else {
                return .state
        }

        return privatePath.withCString { cString in
            return access(cString, W_OK) == -1 ? .ok : .write
        }

        #else
        return .ok
        #endif
    }

    @inline(__always) private static func checkLibraries() -> ResultSet {
        #if !targetEnvironment(simulator)

        typealias DyldImageCount = @convention(c) () -> UInt32
        typealias DyldGetImageName = @convention(c) (UInt32) -> UnsafePointer<Int8>

        guard
            let substrarePath = "L0xpYnJhcnkvTW9iaWxlU3Vic3RyYXRl".base64Decode(),
            let dyldImageCount: DyldImageCount = lookup(.dyldImageCount),
            let dyldGetImageName: DyldGetImageName = lookup(.dyldGetImageName) else {
                return .state
        }

        let count = dyldImageCount()
        for i in 0..<count {
            let path = String(cString: dyldGetImageName(i))
            guard !path.hasPrefix(substrarePath) else {
                return .dynamicLib
            }
        }

        #endif
        return .ok
    }

    @inline(__always) private static func checkDebugger() -> ResultSet {
        #if DEBUG
        return .ok
        #else
        typealias SysCtl = @convention(c) (UnsafeMutablePointer<Int32>, u_int, UnsafeMutableRawPointer, UnsafeMutablePointer<Int>, UnsafeMutableRawPointer?, Int) -> UInt32

        guard let sysctl: SysCtl = lookup(.sysctl) else {
            return .state
        }

        var info = kinfo_proc()
        var mib : [Int32] = [CTL_KERN, KERN_PROC, KERN_PROC_PID, getpid()]
        var size = MemoryLayout<kinfo_proc>.stride
        let status = sysctl(&mib, UInt32(mib.count), &info, &size, nil, 0)
        guard status == 0 else {
            return .state
        }
        return (info.kp_proc.p_flag & P_TRACED) != 0 ? .debugger : .ok
        #endif
    }

    public struct ResultSet: OptionSet {
        public let rawValue: Int

        public static let ok = ResultSet(rawValue: 1 << 0)
        public static let state = ResultSet(rawValue: 1 << 1)
        public static let files = ResultSet(rawValue: 1 << 2)
        public static let links = ResultSet(rawValue: 1 << 3)
        public static let syscalls = ResultSet(rawValue: 1 << 4)
        public static let write = ResultSet(rawValue: 1 << 5)
        public static let dynamicLib = ResultSet(rawValue: 1 << 6)
        public static let debugger = ResultSet(rawValue: 1 << 7)

        public init(rawValue: Int) {
            self.rawValue = rawValue
        }
    }

    private struct Function {
        static let access = Function(encoded: "YWNjZXNz")
        static let lstat = Function(encoded: "bHN0YXQ=")
        static let fork = Function(encoded: "Zm9yaw==")
        static let system = Function(encoded: "c3lzdGVt")
        static let dyldImageCount = Function(encoded: "X2R5bGRfaW1hZ2VfY291bnQ=")
        static let dyldGetImageName = Function(encoded: "X2R5bGRfZ2V0X2ltYWdlX25hbWU=")
        static let sysctl = Function(encoded: "c3lzY3Rs")
        static let dlsym = Function(encoded: "ZGxzeW0=")

        let encoded: String
        var name: String? {
            return encoded.base64Decode()
        }
    }
}

private extension String {

    @inline(__always) func base64Decode() -> String? {
        guard
            let data = Data(base64Encoded: self),
            let string = String(bytes: data, encoding: .utf8) else {
                return nil
        }
        return string
    }
}
