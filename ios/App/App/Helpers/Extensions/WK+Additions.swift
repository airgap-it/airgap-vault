//
//  WK+Additions.swift
//  App
//
//  Created by Julia Samol on 20.09.22.
//

import Foundation
import WebKit

extension WKUserContentController {
    
<<<<<<< HEAD
    func add<T: WKScriptMessageHandler & Identifiable>(_ scriptMessageHandler: T) where T.ID == String {
        add(scriptMessageHandler, name: scriptMessageHandler.id)
=======
    func add(_ jsCallbackHandler: JSCallbackHandler) {
        add(jsCallbackHandler, name: jsCallbackHandler.name)
>>>>>>> 774ad380550b7f4aef269c39f2e18b7b19feec52
    }
}
