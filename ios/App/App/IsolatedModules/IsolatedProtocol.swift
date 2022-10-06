//
//  IsolatedProtocol.swift
//  App
//
//  Created by Julia Samol on 08.09.22.
//

import Foundation
import Capacitor
import WebKit

@objc(IsolatedProtocol)
public class IsolatedProtocol: CAPPlugin {
    private static let assetsURL: URL? = Bundle.main.url(
        forResource: "public",
        withExtension: nil
    )?.appendingPathComponent("assets")
    
    private let protocolWebViewManager: ProtocolWebViewManager = .init()
    
    public override func load() {
        if let assetsURL = Self.assetsURL {
            Task {
                await protocolWebViewManager.createWebViewWithAssetsURL(assetsURL)
            }
        }
    }
    
    @objc func keys(_ call: CAPPluginCall) {
        call.assertReceived(forMethod: "keys", requiredParams: Param.IDENTIFIER)
        
        do {
            guard let identifier = call.identifier else {
                throw Error.invalidData
            }
            
            let options = call.options
            
            Task {
                do {
                    guard let webView = await protocolWebViewManager.webView else {
                        throw Error.webViewNotLoaded
                    }
                    
                    let result = try await webView.evaluateKeys(
                        ofProtocol: identifier,
                        builtWithOptions: options
                    )
                    call.resolve(result)
                } catch {
                    call.reject("Error: \(error)")
                }
            }
        } catch {
            call.reject("Error: \(error)")
        }
    }
    
    @objc func getField(_ call: CAPPluginCall) {
        call.assertReceived(forMethod: "getField", requiredParams: Param.IDENTIFIER, Param.KEY)
        
        do {
            guard let identifier = call.identifier, let key = call.key else {
                throw Error.invalidData
            }
            
            let options = call.options
            
            Task {
                do {
                    guard let webView = await protocolWebViewManager.webView else {
                        throw Error.webViewNotLoaded
                    }
                    
                    let result = try await webView.evaluateGetField(
                        key,
                        ofProtocol: identifier,
                        builtWithOptions: options
                    )
                    call.resolve(result)
                } catch {
                    call.reject("Error: \(error)")
                }
            }
        } catch {
            call.reject("Error: \(error)")
        }
    }
    
    @objc func callMethod(_ call: CAPPluginCall) {
        call.assertReceived(forMethod: "callMethod", requiredParams: Param.IDENTIFIER, Param.KEY)
        
        do {
            guard let identifier = call.identifier, let key = call.key else {
                throw Error.invalidData
            }
            
            let options = call.options
            let args = call.args
            
            Task {
                do {
                    guard let webView = await protocolWebViewManager.webView else {
                        throw Error.webViewNotLoaded
                    }
                    
                    let result = try await webView.evaluateCallMethod(
                        key,
                        ofProtocol: identifier,
                        builtWithOptions: options,
                        withArgs: args
                    )
                    call.resolve(result)
                } catch {
                    call.reject("Error: \(error)")
                }
            }
        } catch {
            call.reject("Error: \(error)")
        }
    }
    
    private actor ProtocolWebViewManager {
        private(set) var webView: ProtocolWebView?
        
        func createWebViewWithAssetsURL(_ assetsURL: URL) async {
            webView = await .init(assetsURL: assetsURL)
        }
    }
    
    struct Param {
        static let IDENTIFIER = "identifier"
        static let OPTIONS = "options"
        static let KEY = "key"
        static let ARGS = "args"
    }
    
    enum Error: Swift.Error {
        case invalidData
        case webViewNotLoaded
    }
}

private extension CAPPluginCall {
    var identifier: String? { return getString(IsolatedProtocol.Param.IDENTIFIER) }
    var options: JSObject? { return getObject(IsolatedProtocol.Param.OPTIONS) }
    var key: String? { return getString(IsolatedProtocol.Param.KEY) }
    var args: JSArray? { return getArray(IsolatedProtocol.Param.ARGS)}
}
