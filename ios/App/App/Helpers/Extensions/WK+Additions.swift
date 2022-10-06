//
//  WK+Additions.swift
//  App
//
//  Created by Julia Samol on 20.09.22.
//

import Foundation
import WebKit

extension WKUserContentController {
    
    func add<T: WKScriptMessageHandler & Identifiable>(_ scriptMessageHandler: T) where T.ID == String {
        add(scriptMessageHandler, name: scriptMessageHandler.id)
    }
}
