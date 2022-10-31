//
//  String+Additions.swift
//  App
//
//  Created by Julia Samol on 31.10.22.
//

import Foundation

extension String {
    
    func starts<PossiblePrefix>(withAny possiblePrefixes: PossiblePrefix...) -> Bool where PossiblePrefix : Sequence, Character == PossiblePrefix.Element {
        possiblePrefixes.contains(where: { starts(with: $0) })
    }
}
