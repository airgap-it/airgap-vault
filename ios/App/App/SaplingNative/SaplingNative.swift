//
//  SaplingNative.swift
//  App
//
//  Created by Julia Samol on 02.03.21.
//

import Foundation
import Capacitor

#if (arch(x86_64) || arch(arm64))
import Sapling
#endif

@objc(SaplingNative)
public class SaplingNative: CAPPlugin {
    
    @objc func isSupported(_ call: CAPPluginCall) {
        #if (arch(x86_64) || arch(arm64))
        call.resolve([Key.IS_SUPPORTED: true])
        #else
        call.resolve([Key.IS_SUPPORTED: false])
        #endif
    }
    
    #if (arch(x86_64) || arch(arm64))
    private lazy var sapling = Sapling()
    
    @objc func initParameters(_ call: CAPPluginCall) {
        do {
            let publicURL = Bundle.main.url(forResource: "public", withExtension: nil)
            guard
                let spendParamsPath = publicURL?.appendingPathComponent("assets/sapling/sapling-spend.params"),
                let spendParams = FileManager.default.contents(atPath: spendParamsPath.path),
                let outputParamsPath = publicURL?.appendingPathComponent("assets/sapling/sapling-output.params"),
                let outputParams = FileManager.default.contents(atPath: outputParamsPath.path)
            else {
                throw Error.fileNotFound
            }
            
            try sapling.initParameters(spend: [UInt8](spendParams), output: [UInt8](outputParams))
            call.resolve()
        } catch {
            call.reject("Error: \(error)")
        }
    }
    
    @objc func initProvingContext(_ call: CAPPluginCall) {
        do {
            let context = try sapling.initProvingContext()
            
            call.resolve([Key.CONTEXT: String(Int(bitPattern: context))])
        } catch {
            call.reject("Error: \(error)")
        }
    }
    
    @objc func dropProvingContext(_ call: CAPPluginCall) {
        call.assertReceived(forMethod: "dropProvingContext", requiredParams: Param.CONTEXT)
        
        do {
            guard let context = call.context else {
                throw Error.invalidData
            }
            sapling.dropProvingContext(context)
            
            call.resolve()
        } catch {
            call.reject("Error: \(error)")
        }
    }
    
    @objc func prepareSpendDescription(_ call: CAPPluginCall) {
        call.assertReceived(
            forMethod: "prepareSpendDescription",
            requiredParams: Param.CONTEXT,
                            Param.SPENDING_KEY,
                            Param.ADDRESS,
                            Param.RCM,
                            Param.AR,
                            Param.VALUE,
                            Param.ROOT,
                            Param.MERKLE_PATH
        )
        
        do {
            guard
                let context = call.context,
                let spendingKey = call.spendingKey,
                let address = call.address,
                let rcm = call.rcm,
                let ar = call.ar,
                let value = call.value,
                let root = call.root,
                let merklePath = call.merklePath
            else { throw Error.invalidData }
            
            let spendDescription = try sapling.prepareSpendDescription(
                with: context,
                using: spendingKey,
                to: address,
                withRcm: rcm,
                withAr: ar,
                ofValue: value,
                withAnchor: root,
                at: merklePath
            )
            
            call.resolve([Key.SPEND_DESCRIPTION: spendDescription.asHexString()])
        } catch {
            call.reject("Error: \(error)")
        }
    }
    
    @objc func preparePartialOutputDescription(_ call: CAPPluginCall) {
        call.assertReceived(
            forMethod: "preparePartialOutputDescription",
            requiredParams: Param.CONTEXT,
                            Param.ADDRESS,
                            Param.RCM,
                            Param.ESK,
                            Param.VALUE
        )
        
        do {
            guard
                let context = call.context,
                let address = call.address,
                let rcm = call.rcm,
                let esk = call.esk,
                let value = call.value
            else { throw Error.invalidData }
            
            let outputDescription = try sapling.preparePartialOutputDescription(
                with: context,
                to: address,
                withRcm: rcm,
                withEsk: esk,
                ofValue: value
            )
            
            call.resolve([Key.OUTPUT_DESCRIPTION: outputDescription.asHexString()])
        } catch {
            call.reject("Error: \(error)")
        }
    }
    
    @objc func createBindingSignature(_ call: CAPPluginCall) {
        call.assertReceived(forMethod: "createBindingSignature", requiredParams: Param.CONTEXT, Param.BALANCE, Param.SIGHASH)
        
        do {
            guard
                let context = call.context,
                let balance = call.balance,
                let sighash = call.sighash
            else { throw Error.invalidData }
            
            let bindingSignature = try sapling.createBindingSignature(with: context, balance: balance, sighash: sighash)
            
            call.resolve([Key.BINDING_SIGNATURE: bindingSignature.asHexString()])
        } catch {
            call.reject("Error: \(error)")
        }
    }
    #else
    @objc func initParameters(_ call: CAPPluginCall) {
        call.reject("Unsupported call")
    }
    
    @objc func initProvingContext(_ call: CAPPluginCall) {
        call.reject("Unsupported call")
    }
    
    @objc func dropProvingContext(_ call: CAPPluginCall) {
        call.reject("Unsupported call")
    }
    
    @objc func prepareSpendDescription(_ call: CAPPluginCall) {
        call.reject("Unsupported call")
    }
    
    @objc func preparePartialOutputDescription(_ call: CAPPluginCall) {
        call.reject("Unsupported call")
    }
    
    @objc func prepareBindingSignature(_ call: CAPPluginCall) {
        call.reject("Unsupported call")
    }
    #endif
    
    struct Param {
        static let CONTEXT = "context"

        static let SPENDING_KEY = "spendingKey"
        static let ADDRESS = "address"
        static let RCM = "rcm"
        static let AR = "ar"
        static let ESK = "esk"
        static let VALUE = "value"
        static let ROOT = "root"
        static let MERKLE_PATH = "merklePath"

        static let BALANCE = "balance"
        static let SIGHASH = "sighash"
    }
    
    struct Key {
        static let IS_SUPPORTED = "isSupported"
        
        static let CONTEXT = "context"
        static let SPEND_DESCRIPTION = "spendDescription"
        static let OUTPUT_DESCRIPTION = "outputDescription"
        static let BINDING_SIGNATURE = "bindingSignature"
    }
    
    enum Error: Swift.Error {
        case fileNotFound
        case invalidData
    }
}

private extension CAPPluginCall {
    var context: UnsafeMutableRawPointer? {
        guard let stringValue = getString(SaplingNative.Param.CONTEXT), let intValue = Int(stringValue) else {
            return nil
        }
        
        return UnsafeMutableRawPointer(bitPattern: intValue)
    }
    
    var spendingKey: [UInt8]? { return getString(SaplingNative.Param.SPENDING_KEY)?.asBytes() }
    var address: [UInt8]? { return getString(SaplingNative.Param.ADDRESS)?.asBytes() }
    var rcm: [UInt8]? { return getString(SaplingNative.Param.RCM)?.asBytes() }
    var ar: [UInt8]? { return getString(SaplingNative.Param.AR)?.asBytes() }
    var esk: [UInt8]? { return getString(SaplingNative.Param.ESK)?.asBytes() }
    var value: UInt64? {
        guard let stringValue = getString(SaplingNative.Param.VALUE) else {
            return nil
        }
        
        return UInt64(stringValue)
    }
    var root: [UInt8]? { return getString(SaplingNative.Param.ROOT)?.asBytes() }
    var merklePath: [UInt8]? { return getString(SaplingNative.Param.MERKLE_PATH)?.asBytes() }
    
    var balance: Int64? {
        guard let stringValue = getString(SaplingNative.Param.BALANCE) else {
            return nil
        }
        
        return Int64(stringValue)
    }
    var sighash: [UInt8]? { return getString(SaplingNative.Param.SIGHASH)?.asBytes() }
}

extension String {
    func asBytes() -> [UInt8]? {
        var bytes = [UInt8]()
        bytes.reserveCapacity(count / 2)
        
        for (position, index) in indices.enumerated() {
            guard position % 2 == 0 else {
                continue
            }
            let byteRange = index...self.index(after: index)
            let byteSlice = self[byteRange]
            guard let byte = UInt8(byteSlice, radix: 16) else {
                return nil
            }
            bytes.append(byte)
        }
        
        return bytes
    }
}

extension Array where Element == UInt8 {
    func asHexString() -> String {
        return map { b in String(format: "%02x", b) }.joined()
    }
}
