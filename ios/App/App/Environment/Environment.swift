//
//  Environment.swift
//  App
//
//  Created by Julia Samol on 20.04.23.
//

import Foundation
import Capacitor

@objc(Environment)
public class Environment: CAPPlugin {
    override public func load() {
        notifyListeners(
            "envContextChanged",
            data: ["context": Context.empty.rawValue],
            retainUntilConsumed: true
        )
    }
    
    private enum Context: String {
        case empty
    }
}
