'use strict'
var __assign =
  (this && this.__assign) ||
  function() {
    __assign =
      Object.assign ||
      function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i]
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p]
        }
        return t
      }
    return __assign.apply(this, arguments)
  }
exports.__esModule = true
var fs_1 = require('fs')
var pkg = JSON.parse(fs_1.readFileSync('./package.json', 'utf-8'))
pkg.devDependencies = __assign({}, pkg.buildDependencies)
fs_1.writeFileSync('./package.json', JSON.stringify(pkg, undefined, 2))
