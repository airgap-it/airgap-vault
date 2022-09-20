//
//  WK+Additions.swift
//  App
//
//  Created by Julia Samol on 20.09.22.
//

import Foundation
import WebKit

extension WKUserContentController {
    
    func add(_ jsCallbackHandler: JSCallbackHandler) {
        add(jsCallbackHandler, name: jsCallbackHandler.name)
    }
}
