import { BigNumber } from 'bignumber.js'
export function deepCopy(obj) {
  var rv

  switch (typeof obj) {
    case 'object':
      if (obj === null) {
        // null => null
        rv = null
      } else {
        switch (toString.call(obj)) {
          case '[object Array]':
            // It's an array, create a new array with
            // deep copies of the entries
            rv = obj.map(deepCopy)
            break
          case '[object BigNumber]':
            // Clone the RegExp
            rv = new BigNumber(obj)
            break
          // ...probably a few others
          default:
            // Some other kind of object, deep-copy its
            // properties into a new object
            rv = Object.keys(obj).reduce(function(prev, key) {
              prev[key] = deepCopy(obj[key])
              return prev
            }, {})
            break
        }
      }
      break
    default:
      // It's a primitive, copy via assignment
      rv = obj
      break
  }
  return rv
}
