var Module = (function () {
  var _scriptDir = `${location.origin}/assets/wasm/`

  return function (Module) {
    Module = Module || {}

    var Module = typeof Module !== 'undefined' ? Module : {}
    var readyPromiseResolve, readyPromiseReject
    Module['ready'] = new Promise(function (resolve, reject) {
      readyPromiseResolve = resolve
      readyPromiseReject = reject
    })
    var moduleOverrides = {}
    var key
    for (key in Module) {
      if (Module.hasOwnProperty(key)) {
        moduleOverrides[key] = Module[key]
      }
    }
    var arguments_ = []
    var thisProgram = './this.program'
    var quit_ = function (status, toThrow) {
      throw toThrow
    }
    var ENVIRONMENT_IS_WEB = true
    var ENVIRONMENT_IS_WORKER = false
    var scriptDirectory = ''
    function locateFile(path) {
      if (Module['locateFile']) {
        return Module['locateFile'](path, scriptDirectory)
      }
      return scriptDirectory + path
    }
    var read_, readAsync, readBinary, setWindowTitle
    if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
      if (ENVIRONMENT_IS_WORKER) {
        scriptDirectory = self.location.href
      } else if (typeof document !== 'undefined' && document.currentScript) {
        scriptDirectory = document.currentScript.src
      }
      if (_scriptDir) {
        scriptDirectory = _scriptDir
      }
      if (scriptDirectory.indexOf('blob:') !== 0) {
        scriptDirectory = scriptDirectory.substr(0, scriptDirectory.replace(/[?#].*/, '').lastIndexOf('/') + 1)
      } else {
        scriptDirectory = ''
      }
      {
        read_ = function (url) {
          var xhr = new XMLHttpRequest()
          xhr.open('GET', url, false)
          xhr.send(null)
          return xhr.responseText
        }
        if (ENVIRONMENT_IS_WORKER) {
          readBinary = function (url) {
            var xhr = new XMLHttpRequest()
            xhr.open('GET', url, false)
            xhr.responseType = 'arraybuffer'
            xhr.send(null)
            return new Uint8Array(xhr.response)
          }
        }
        readAsync = function (url, onload, onerror) {
          var xhr = new XMLHttpRequest()
          xhr.open('GET', url, true)
          xhr.responseType = 'arraybuffer'
          xhr.onload = function () {
            if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) {
              onload(xhr.response)
              return
            }
            onerror()
          }
          xhr.onerror = onerror
          xhr.send(null)
        }
      }
      setWindowTitle = function (title) {
        document.title = title
      }
    } else {
    }
    var out = Module['print'] || console.log.bind(console)
    var err = Module['printErr'] || console.warn.bind(console)
    for (key in moduleOverrides) {
      if (moduleOverrides.hasOwnProperty(key)) {
        Module[key] = moduleOverrides[key]
      }
    }
    moduleOverrides = null
    if (Module['arguments']) arguments_ = Module['arguments']
    if (Module['thisProgram']) thisProgram = Module['thisProgram']
    if (Module['quit']) quit_ = Module['quit']
    var tempRet0 = 0
    var setTempRet0 = function (value) {
      tempRet0 = value
    }
    var getTempRet0 = function () {
      return tempRet0
    }
    var wasmBinary
    if (Module['wasmBinary']) wasmBinary = Module['wasmBinary']
    var noExitRuntime = Module['noExitRuntime'] || true
    if (typeof WebAssembly !== 'object') {
      abort('no native wasm support detected')
    }
    var wasmMemory
    var ABORT = false
    var EXITSTATUS
    function assert(condition, text) {
      if (!condition) {
        abort('Assertion failed: ' + text)
      }
    }
    function getCFunc(ident) {
      var func = Module['_' + ident]
      assert(func, 'Cannot call unknown function ' + ident + ', make sure it is exported')
      return func
    }
    function ccall(ident, returnType, argTypes, args, opts) {
      var toC = {
        string: function (str) {
          var ret = 0
          if (str !== null && str !== undefined && str !== 0) {
            var len = (str.length << 2) + 1
            ret = stackAlloc(len)
            stringToUTF8(str, ret, len)
          }
          return ret
        },
        array: function (arr) {
          var ret = stackAlloc(arr.length)
          writeArrayToMemory(arr, ret)
          return ret
        }
      }
      function convertReturnValue(ret) {
        if (returnType === 'string') return UTF8ToString(ret)
        if (returnType === 'boolean') return Boolean(ret)
        return ret
      }
      var func = getCFunc(ident)
      var cArgs = []
      var stack = 0
      if (args) {
        for (var i = 0; i < args.length; i++) {
          var converter = toC[argTypes[i]]
          if (converter) {
            if (stack === 0) stack = stackSave()
            cArgs[i] = converter(args[i])
          } else {
            cArgs[i] = args[i]
          }
        }
      }
      var ret = func.apply(null, cArgs)
      function onDone(ret) {
        if (stack !== 0) stackRestore(stack)
        return convertReturnValue(ret)
      }
      ret = onDone(ret)
      return ret
    }
    function cwrap(ident, returnType, argTypes, opts) {
      argTypes = argTypes || []
      var numericArgs = argTypes.every(function (type) {
        return type === 'number'
      })
      var numericRet = returnType !== 'string'
      if (numericRet && numericArgs && !opts) {
        return getCFunc(ident)
      }
      return function () {
        return ccall(ident, returnType, argTypes, arguments, opts)
      }
    }
    var UTF8Decoder = typeof TextDecoder !== 'undefined' ? new TextDecoder('utf8') : undefined
    function UTF8ArrayToString(heap, idx, maxBytesToRead) {
      var endIdx = idx + maxBytesToRead
      var endPtr = idx
      while (heap[endPtr] && !(endPtr >= endIdx)) ++endPtr
      if (endPtr - idx > 16 && heap.subarray && UTF8Decoder) {
        return UTF8Decoder.decode(heap.subarray(idx, endPtr))
      } else {
        var str = ''
        while (idx < endPtr) {
          var u0 = heap[idx++]
          if (!(u0 & 128)) {
            str += String.fromCharCode(u0)
            continue
          }
          var u1 = heap[idx++] & 63
          if ((u0 & 224) == 192) {
            str += String.fromCharCode(((u0 & 31) << 6) | u1)
            continue
          }
          var u2 = heap[idx++] & 63
          if ((u0 & 240) == 224) {
            u0 = ((u0 & 15) << 12) | (u1 << 6) | u2
          } else {
            u0 = ((u0 & 7) << 18) | (u1 << 12) | (u2 << 6) | (heap[idx++] & 63)
          }
          if (u0 < 65536) {
            str += String.fromCharCode(u0)
          } else {
            var ch = u0 - 65536
            str += String.fromCharCode(55296 | (ch >> 10), 56320 | (ch & 1023))
          }
        }
      }
      return str
    }
    function UTF8ToString(ptr, maxBytesToRead) {
      return ptr ? UTF8ArrayToString(HEAPU8, ptr, maxBytesToRead) : ''
    }
    function stringToUTF8Array(str, heap, outIdx, maxBytesToWrite) {
      if (!(maxBytesToWrite > 0)) return 0
      var startIdx = outIdx
      var endIdx = outIdx + maxBytesToWrite - 1
      for (var i = 0; i < str.length; ++i) {
        var u = str.charCodeAt(i)
        if (u >= 55296 && u <= 57343) {
          var u1 = str.charCodeAt(++i)
          u = (65536 + ((u & 1023) << 10)) | (u1 & 1023)
        }
        if (u <= 127) {
          if (outIdx >= endIdx) break
          heap[outIdx++] = u
        } else if (u <= 2047) {
          if (outIdx + 1 >= endIdx) break
          heap[outIdx++] = 192 | (u >> 6)
          heap[outIdx++] = 128 | (u & 63)
        } else if (u <= 65535) {
          if (outIdx + 2 >= endIdx) break
          heap[outIdx++] = 224 | (u >> 12)
          heap[outIdx++] = 128 | ((u >> 6) & 63)
          heap[outIdx++] = 128 | (u & 63)
        } else {
          if (outIdx + 3 >= endIdx) break
          heap[outIdx++] = 240 | (u >> 18)
          heap[outIdx++] = 128 | ((u >> 12) & 63)
          heap[outIdx++] = 128 | ((u >> 6) & 63)
          heap[outIdx++] = 128 | (u & 63)
        }
      }
      heap[outIdx] = 0
      return outIdx - startIdx
    }
    function stringToUTF8(str, outPtr, maxBytesToWrite) {
      return stringToUTF8Array(str, HEAPU8, outPtr, maxBytesToWrite)
    }
    function writeArrayToMemory(array, buffer) {
      HEAP8.set(array, buffer)
    }
    var buffer, HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64
    function updateGlobalBufferAndViews(buf) {
      buffer = buf
      Module['HEAP8'] = HEAP8 = new Int8Array(buf)
      Module['HEAP16'] = HEAP16 = new Int16Array(buf)
      Module['HEAP32'] = HEAP32 = new Int32Array(buf)
      Module['HEAPU8'] = HEAPU8 = new Uint8Array(buf)
      Module['HEAPU16'] = HEAPU16 = new Uint16Array(buf)
      Module['HEAPU32'] = HEAPU32 = new Uint32Array(buf)
      Module['HEAPF32'] = HEAPF32 = new Float32Array(buf)
      Module['HEAPF64'] = HEAPF64 = new Float64Array(buf)
    }
    var INITIAL_MEMORY = Module['INITIAL_MEMORY'] || 16777216
    var wasmTable
    var __ATPRERUN__ = []
    var __ATINIT__ = []
    var __ATPOSTRUN__ = []
    var runtimeInitialized = false
    function preRun() {
      if (Module['preRun']) {
        if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']]
        while (Module['preRun'].length) {
          addOnPreRun(Module['preRun'].shift())
        }
      }
      callRuntimeCallbacks(__ATPRERUN__)
    }
    function initRuntime() {
      runtimeInitialized = true
      callRuntimeCallbacks(__ATINIT__)
    }
    function postRun() {
      if (Module['postRun']) {
        if (typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']]
        while (Module['postRun'].length) {
          addOnPostRun(Module['postRun'].shift())
        }
      }
      callRuntimeCallbacks(__ATPOSTRUN__)
    }
    function addOnPreRun(cb) {
      __ATPRERUN__.unshift(cb)
    }
    function addOnInit(cb) {
      __ATINIT__.unshift(cb)
    }
    function addOnPostRun(cb) {
      __ATPOSTRUN__.unshift(cb)
    }
    var runDependencies = 0
    var runDependencyWatcher = null
    var dependenciesFulfilled = null
    function addRunDependency(id) {
      runDependencies++
      if (Module['monitorRunDependencies']) {
        Module['monitorRunDependencies'](runDependencies)
      }
    }
    function removeRunDependency(id) {
      runDependencies--
      if (Module['monitorRunDependencies']) {
        Module['monitorRunDependencies'](runDependencies)
      }
      if (runDependencies == 0) {
        if (runDependencyWatcher !== null) {
          clearInterval(runDependencyWatcher)
          runDependencyWatcher = null
        }
        if (dependenciesFulfilled) {
          var callback = dependenciesFulfilled
          dependenciesFulfilled = null
          callback()
        }
      }
    }
    Module['preloadedImages'] = {}
    Module['preloadedAudios'] = {}
    function abort(what) {
      {
        if (Module['onAbort']) {
          Module['onAbort'](what)
        }
      }
      what = 'Aborted(' + what + ')'
      err(what)
      ABORT = true
      EXITSTATUS = 1
      what += '. Build with -s ASSERTIONS=1 for more info.'
      var e = new WebAssembly.RuntimeError(what)
      readyPromiseReject(e)
      throw e
    }
    var dataURIPrefix = 'data:application/octet-stream;base64,'
    function isDataURI(filename) {
      return filename.startsWith(dataURIPrefix)
    }
    var wasmBinaryFile
    if (Module['locateFile']) {
      wasmBinaryFile = 'lifehash.wasm'
      if (!isDataURI(wasmBinaryFile)) {
        wasmBinaryFile = locateFile(wasmBinaryFile)
      }
    } else {
      wasmBinaryFile = new URL('lifehash.wasm', _scriptDir).toString()
    }
    function getBinary(file) {
      try {
        if (file == wasmBinaryFile && wasmBinary) {
          return new Uint8Array(wasmBinary)
        }
        if (readBinary) {
          return readBinary(file)
        } else {
          throw 'both async and sync fetching of the wasm failed'
        }
      } catch (err) {
        abort(err)
      }
    }
    function getBinaryPromise() {
      if (!wasmBinary && (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER)) {
        if (typeof fetch === 'function') {
          return fetch(wasmBinaryFile, { credentials: 'same-origin' })
            .then(function (response) {
              if (!response['ok']) {
                throw "failed to load wasm binary file at '" + wasmBinaryFile + "'"
              }
              return response['arrayBuffer']()
            })
            .catch(function () {
              return getBinary(wasmBinaryFile)
            })
        }
      }
      return Promise.resolve().then(function () {
        return getBinary(wasmBinaryFile)
      })
    }
    function createWasm() {
      var info = { a: asmLibraryArg }
      function receiveInstance(instance, module) {
        var exports = instance.exports
        Module['asm'] = exports
        wasmMemory = Module['asm']['x']
        updateGlobalBufferAndViews(wasmMemory.buffer)
        wasmTable = Module['asm']['z']
        addOnInit(Module['asm']['y'])
        removeRunDependency('wasm-instantiate')
      }
      addRunDependency('wasm-instantiate')
      function receiveInstantiationResult(result) {
        receiveInstance(result['instance'])
      }
      function instantiateArrayBuffer(receiver) {
        return getBinaryPromise()
          .then(function (binary) {
            return WebAssembly.instantiate(binary, info)
          })
          .then(function (instance) {
            return instance
          })
          .then(receiver, function (reason) {
            err('failed to asynchronously prepare wasm: ' + reason)
            abort(reason)
          })
      }
      function instantiateAsync() {
        if (
          !wasmBinary &&
          typeof WebAssembly.instantiateStreaming === 'function' &&
          !isDataURI(wasmBinaryFile) &&
          typeof fetch === 'function'
        ) {
          return fetch(wasmBinaryFile, { credentials: 'same-origin' }).then(function (response) {
            var result = WebAssembly.instantiateStreaming(response, info)
            return result.then(receiveInstantiationResult, function (reason) {
              err('wasm streaming compile failed: ' + reason)
              err('falling back to ArrayBuffer instantiation')
              return instantiateArrayBuffer(receiveInstantiationResult)
            })
          })
        } else {
          return instantiateArrayBuffer(receiveInstantiationResult)
        }
      }
      if (Module['instantiateWasm']) {
        try {
          var exports = Module['instantiateWasm'](info, receiveInstance)
          return exports
        } catch (e) {
          err('Module.instantiateWasm callback failed with error: ' + e)
          return false
        }
      }
      instantiateAsync().catch(readyPromiseReject)
      return {}
    }
    function callRuntimeCallbacks(callbacks) {
      while (callbacks.length > 0) {
        var callback = callbacks.shift()
        if (typeof callback == 'function') {
          callback(Module)
          continue
        }
        var func = callback.func
        if (typeof func === 'number') {
          if (callback.arg === undefined) {
            wasmTable.get(func)()
          } else {
            wasmTable.get(func)(callback.arg)
          }
        } else {
          func(callback.arg === undefined ? null : callback.arg)
        }
      }
    }
    function ___assert_fail(condition, filename, line, func) {
      abort(
        'Assertion failed: ' +
          UTF8ToString(condition) +
          ', at: ' +
          [filename ? UTF8ToString(filename) : 'unknown filename', line, func ? UTF8ToString(func) : 'unknown function']
      )
    }
    function ___cxa_allocate_exception(size) {
      return _malloc(size + 16) + 16
    }
    function ExceptionInfo(excPtr) {
      this.excPtr = excPtr
      this.ptr = excPtr - 16
      this.set_type = function (type) {
        HEAP32[(this.ptr + 4) >> 2] = type
      }
      this.get_type = function () {
        return HEAP32[(this.ptr + 4) >> 2]
      }
      this.set_destructor = function (destructor) {
        HEAP32[(this.ptr + 8) >> 2] = destructor
      }
      this.get_destructor = function () {
        return HEAP32[(this.ptr + 8) >> 2]
      }
      this.set_refcount = function (refcount) {
        HEAP32[this.ptr >> 2] = refcount
      }
      this.set_caught = function (caught) {
        caught = caught ? 1 : 0
        HEAP8[(this.ptr + 12) >> 0] = caught
      }
      this.get_caught = function () {
        return HEAP8[(this.ptr + 12) >> 0] != 0
      }
      this.set_rethrown = function (rethrown) {
        rethrown = rethrown ? 1 : 0
        HEAP8[(this.ptr + 13) >> 0] = rethrown
      }
      this.get_rethrown = function () {
        return HEAP8[(this.ptr + 13) >> 0] != 0
      }
      this.init = function (type, destructor) {
        this.set_type(type)
        this.set_destructor(destructor)
        this.set_refcount(0)
        this.set_caught(false)
        this.set_rethrown(false)
      }
      this.add_ref = function () {
        var value = HEAP32[this.ptr >> 2]
        HEAP32[this.ptr >> 2] = value + 1
      }
      this.release_ref = function () {
        var prev = HEAP32[this.ptr >> 2]
        HEAP32[this.ptr >> 2] = prev - 1
        return prev === 1
      }
    }
    function CatchInfo(ptr) {
      this.free = function () {
        _free(this.ptr)
        this.ptr = 0
      }
      this.set_base_ptr = function (basePtr) {
        HEAP32[this.ptr >> 2] = basePtr
      }
      this.get_base_ptr = function () {
        return HEAP32[this.ptr >> 2]
      }
      this.set_adjusted_ptr = function (adjustedPtr) {
        HEAP32[(this.ptr + 4) >> 2] = adjustedPtr
      }
      this.get_adjusted_ptr_addr = function () {
        return this.ptr + 4
      }
      this.get_adjusted_ptr = function () {
        return HEAP32[(this.ptr + 4) >> 2]
      }
      this.get_exception_ptr = function () {
        var isPointer = ___cxa_is_pointer_type(this.get_exception_info().get_type())
        if (isPointer) {
          return HEAP32[this.get_base_ptr() >> 2]
        }
        var adjusted = this.get_adjusted_ptr()
        if (adjusted !== 0) return adjusted
        return this.get_base_ptr()
      }
      this.get_exception_info = function () {
        return new ExceptionInfo(this.get_base_ptr())
      }
      if (ptr === undefined) {
        this.ptr = _malloc(8)
        this.set_adjusted_ptr(0)
      } else {
        this.ptr = ptr
      }
    }
    var exceptionCaught = []
    function exception_addRef(info) {
      info.add_ref()
    }
    var uncaughtExceptionCount = 0
    function ___cxa_begin_catch(ptr) {
      var catchInfo = new CatchInfo(ptr)
      var info = catchInfo.get_exception_info()
      if (!info.get_caught()) {
        info.set_caught(true)
        uncaughtExceptionCount--
      }
      info.set_rethrown(false)
      exceptionCaught.push(catchInfo)
      exception_addRef(info)
      return catchInfo.get_exception_ptr()
    }
    var exceptionLast = 0
    function ___cxa_free_exception(ptr) {
      try {
        return _free(new ExceptionInfo(ptr).ptr)
      } catch (e) {}
    }
    function exception_decRef(info) {
      if (info.release_ref() && !info.get_rethrown()) {
        var destructor = info.get_destructor()
        if (destructor) {
          wasmTable.get(destructor)(info.excPtr)
        }
        ___cxa_free_exception(info.excPtr)
      }
    }
    function ___cxa_end_catch() {
      _setThrew(0)
      var catchInfo = exceptionCaught.pop()
      exception_decRef(catchInfo.get_exception_info())
      catchInfo.free()
      exceptionLast = 0
    }
    function ___resumeException(catchInfoPtr) {
      var catchInfo = new CatchInfo(catchInfoPtr)
      var ptr = catchInfo.get_base_ptr()
      if (!exceptionLast) {
        exceptionLast = ptr
      }
      catchInfo.free()
      throw ptr
    }
    function ___cxa_find_matching_catch_2() {
      var thrown = exceptionLast
      if (!thrown) {
        setTempRet0(0)
        return 0 | 0
      }
      var info = new ExceptionInfo(thrown)
      var thrownType = info.get_type()
      var catchInfo = new CatchInfo()
      catchInfo.set_base_ptr(thrown)
      catchInfo.set_adjusted_ptr(thrown)
      if (!thrownType) {
        setTempRet0(0)
        return catchInfo.ptr | 0
      }
      var typeArray = Array.prototype.slice.call(arguments)
      for (var i = 0; i < typeArray.length; i++) {
        var caughtType = typeArray[i]
        if (caughtType === 0 || caughtType === thrownType) {
          break
        }
        if (___cxa_can_catch(caughtType, thrownType, catchInfo.get_adjusted_ptr_addr())) {
          setTempRet0(caughtType)
          return catchInfo.ptr | 0
        }
      }
      setTempRet0(thrownType)
      return catchInfo.ptr | 0
    }
    function ___cxa_find_matching_catch_3() {
      var thrown = exceptionLast
      if (!thrown) {
        setTempRet0(0)
        return 0 | 0
      }
      var info = new ExceptionInfo(thrown)
      var thrownType = info.get_type()
      var catchInfo = new CatchInfo()
      catchInfo.set_base_ptr(thrown)
      catchInfo.set_adjusted_ptr(thrown)
      if (!thrownType) {
        setTempRet0(0)
        return catchInfo.ptr | 0
      }
      var typeArray = Array.prototype.slice.call(arguments)
      for (var i = 0; i < typeArray.length; i++) {
        var caughtType = typeArray[i]
        if (caughtType === 0 || caughtType === thrownType) {
          break
        }
        if (___cxa_can_catch(caughtType, thrownType, catchInfo.get_adjusted_ptr_addr())) {
          setTempRet0(caughtType)
          return catchInfo.ptr | 0
        }
      }
      setTempRet0(thrownType)
      return catchInfo.ptr | 0
    }
    function ___cxa_throw(ptr, type, destructor) {
      var info = new ExceptionInfo(ptr)
      info.init(type, destructor)
      exceptionLast = ptr
      uncaughtExceptionCount++
      throw ptr
    }
    function _abort() {
      abort('')
    }
    function abortOnCannotGrowMemory(requestedSize) {
      abort('OOM')
    }
    function _emscripten_resize_heap(requestedSize) {
      var oldSize = HEAPU8.length
      requestedSize = requestedSize >>> 0
      abortOnCannotGrowMemory(requestedSize)
    }
    function _getTempRet0() {
      return getTempRet0()
    }
    var asmLibraryArg = {
      r: ___assert_fail,
      i: ___cxa_allocate_exception,
      q: ___cxa_begin_catch,
      p: ___cxa_end_catch,
      b: ___cxa_find_matching_catch_2,
      f: ___cxa_find_matching_catch_3,
      k: ___cxa_free_exception,
      j: ___cxa_throw,
      c: ___resumeException,
      t: _abort,
      s: _emscripten_resize_heap,
      a: _getTempRet0,
      n: invoke_ii,
      e: invoke_iii,
      h: invoke_iiii,
      m: invoke_iiiii,
      u: invoke_v,
      d: invoke_vii,
      w: invoke_viid,
      g: invoke_viii,
      o: invoke_viiii,
      l: invoke_viiiii,
      v: invoke_viiiiii
    }
    var asm = createWasm()
    var ___wasm_call_ctors = (Module['___wasm_call_ctors'] = function () {
      return (___wasm_call_ctors = Module['___wasm_call_ctors'] = Module['asm']['y']).apply(null, arguments)
    })
    var _lifehash_image_free = (Module['_lifehash_image_free'] = function () {
      return (_lifehash_image_free = Module['_lifehash_image_free'] = Module['asm']['A']).apply(null, arguments)
    })
    var _free = (Module['_free'] = function () {
      return (_free = Module['_free'] = Module['asm']['B']).apply(null, arguments)
    })
    var _malloc = (Module['_malloc'] = function () {
      return (_malloc = Module['_malloc'] = Module['asm']['C']).apply(null, arguments)
    })
    var _lifehash_make_from_utf8 = (Module['_lifehash_make_from_utf8'] = function () {
      return (_lifehash_make_from_utf8 = Module['_lifehash_make_from_utf8'] = Module['asm']['D']).apply(null, arguments)
    })
    var _lifehash_make_from_data = (Module['_lifehash_make_from_data'] = function () {
      return (_lifehash_make_from_data = Module['_lifehash_make_from_data'] = Module['asm']['E']).apply(null, arguments)
    })
    var _lifehash_make_from_digest = (Module['_lifehash_make_from_digest'] = function () {
      return (_lifehash_make_from_digest = Module['_lifehash_make_from_digest'] = Module['asm']['F']).apply(null, arguments)
    })
    var _lifehash_data_to_hex = (Module['_lifehash_data_to_hex'] = function () {
      return (_lifehash_data_to_hex = Module['_lifehash_data_to_hex'] = Module['asm']['G']).apply(null, arguments)
    })
    var _lifehash_hex_to_data = (Module['_lifehash_hex_to_data'] = function () {
      return (_lifehash_hex_to_data = Module['_lifehash_hex_to_data'] = Module['asm']['H']).apply(null, arguments)
    })
    var _lifehash_sha256 = (Module['_lifehash_sha256'] = function () {
      return (_lifehash_sha256 = Module['_lifehash_sha256'] = Module['asm']['I']).apply(null, arguments)
    })
    var stackSave = (Module['stackSave'] = function () {
      return (stackSave = Module['stackSave'] = Module['asm']['J']).apply(null, arguments)
    })
    var stackRestore = (Module['stackRestore'] = function () {
      return (stackRestore = Module['stackRestore'] = Module['asm']['K']).apply(null, arguments)
    })
    var stackAlloc = (Module['stackAlloc'] = function () {
      return (stackAlloc = Module['stackAlloc'] = Module['asm']['L']).apply(null, arguments)
    })
    var _setThrew = (Module['_setThrew'] = function () {
      return (_setThrew = Module['_setThrew'] = Module['asm']['M']).apply(null, arguments)
    })
    var ___cxa_can_catch = (Module['___cxa_can_catch'] = function () {
      return (___cxa_can_catch = Module['___cxa_can_catch'] = Module['asm']['N']).apply(null, arguments)
    })
    var ___cxa_is_pointer_type = (Module['___cxa_is_pointer_type'] = function () {
      return (___cxa_is_pointer_type = Module['___cxa_is_pointer_type'] = Module['asm']['O']).apply(null, arguments)
    })
    function invoke_vii(index, a1, a2) {
      var sp = stackSave()
      try {
        wasmTable.get(index)(a1, a2)
      } catch (e) {
        stackRestore(sp)
        if (e !== e + 0 && e !== 'longjmp') throw e
        _setThrew(1, 0)
      }
    }
    function invoke_viiii(index, a1, a2, a3, a4) {
      var sp = stackSave()
      try {
        wasmTable.get(index)(a1, a2, a3, a4)
      } catch (e) {
        stackRestore(sp)
        if (e !== e + 0 && e !== 'longjmp') throw e
        _setThrew(1, 0)
      }
    }
    function invoke_viii(index, a1, a2, a3) {
      var sp = stackSave()
      try {
        wasmTable.get(index)(a1, a2, a3)
      } catch (e) {
        stackRestore(sp)
        if (e !== e + 0 && e !== 'longjmp') throw e
        _setThrew(1, 0)
      }
    }
    function invoke_iii(index, a1, a2) {
      var sp = stackSave()
      try {
        return wasmTable.get(index)(a1, a2)
      } catch (e) {
        stackRestore(sp)
        if (e !== e + 0 && e !== 'longjmp') throw e
        _setThrew(1, 0)
      }
    }
    function invoke_iiii(index, a1, a2, a3) {
      var sp = stackSave()
      try {
        return wasmTable.get(index)(a1, a2, a3)
      } catch (e) {
        stackRestore(sp)
        if (e !== e + 0 && e !== 'longjmp') throw e
        _setThrew(1, 0)
      }
    }
    function invoke_viid(index, a1, a2, a3) {
      var sp = stackSave()
      try {
        wasmTable.get(index)(a1, a2, a3)
      } catch (e) {
        stackRestore(sp)
        if (e !== e + 0 && e !== 'longjmp') throw e
        _setThrew(1, 0)
      }
    }
    function invoke_ii(index, a1) {
      var sp = stackSave()
      try {
        return wasmTable.get(index)(a1)
      } catch (e) {
        stackRestore(sp)
        if (e !== e + 0 && e !== 'longjmp') throw e
        _setThrew(1, 0)
      }
    }
    function invoke_viiiii(index, a1, a2, a3, a4, a5) {
      var sp = stackSave()
      try {
        wasmTable.get(index)(a1, a2, a3, a4, a5)
      } catch (e) {
        stackRestore(sp)
        if (e !== e + 0 && e !== 'longjmp') throw e
        _setThrew(1, 0)
      }
    }
    function invoke_iiiii(index, a1, a2, a3, a4) {
      var sp = stackSave()
      try {
        return wasmTable.get(index)(a1, a2, a3, a4)
      } catch (e) {
        stackRestore(sp)
        if (e !== e + 0 && e !== 'longjmp') throw e
        _setThrew(1, 0)
      }
    }
    function invoke_viiiiii(index, a1, a2, a3, a4, a5, a6) {
      var sp = stackSave()
      try {
        wasmTable.get(index)(a1, a2, a3, a4, a5, a6)
      } catch (e) {
        stackRestore(sp)
        if (e !== e + 0 && e !== 'longjmp') throw e
        _setThrew(1, 0)
      }
    }
    function invoke_v(index) {
      var sp = stackSave()
      try {
        wasmTable.get(index)()
      } catch (e) {
        stackRestore(sp)
        if (e !== e + 0 && e !== 'longjmp') throw e
        _setThrew(1, 0)
      }
    }
    var calledRun
    dependenciesFulfilled = function runCaller() {
      if (!calledRun) run()
      if (!calledRun) dependenciesFulfilled = runCaller
    }
    function run(args) {
      args = args || arguments_
      if (runDependencies > 0) {
        return
      }
      preRun()
      if (runDependencies > 0) {
        return
      }
      function doRun() {
        if (calledRun) return
        calledRun = true
        Module['calledRun'] = true
        if (ABORT) return
        initRuntime()
        readyPromiseResolve(Module)
        if (Module['onRuntimeInitialized']) Module['onRuntimeInitialized']()
        postRun()
      }
      if (Module['setStatus']) {
        Module['setStatus']('Running...')
        setTimeout(function () {
          setTimeout(function () {
            Module['setStatus']('')
          }, 1)
          doRun()
        }, 1)
      } else {
        doRun()
      }
    }
    Module['run'] = run
    if (Module['preInit']) {
      if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']]
      while (Module['preInit'].length > 0) {
        Module['preInit'].pop()()
      }
    }
    run()
    Module['onRuntimeInitialized'] = function () {
      Module['makeFromUTF8'] = function (s, version, moduleSize) {
        const inputPtr = this.allocString(s)
        const imagePtr = ccall(
          'lifehash_make_from_utf8',
          'number',
          ['number', 'number', 'number', 'boolean'],
          [inputPtr, version, moduleSize, true]
        )
        const image = this.produceImage(imagePtr, version)
        this.free(inputPtr)
        this.imageFree(imagePtr)
        return image
      }
      Module['makeFromData'] = function (data, version, moduleSize) {
        const inputPtr = this.malloc(data.length)
        const i = new Uint8Array(HEAPU8.buffer, inputPtr, data.length)
        i.set(data)
        const imagePtr = ccall(
          'lifehash_make_from_data',
          'number',
          ['number', 'number', 'number', 'number', 'boolean'],
          [inputPtr, data.length, version, moduleSize, true]
        )
        const image = this.produceImage(imagePtr, version)
        this.free(inputPtr)
        this.imageFree(imagePtr)
        return image
      }
      Module['makeFromDigest'] = function (digest, version, moduleSize) {
        if (digest.length !== 32) {
          throw new Error('Digest must be exactly 32 bytes.')
        }
        const inputPtr = this.malloc(digest.length)
        const i = new Uint8Array(HEAPU8.buffer, inputPtr, digest.length)
        i.set(digest)
        const imagePtr = ccall(
          'lifehash_make_from_digest',
          'number',
          ['number', 'number', 'number', 'boolean'],
          [inputPtr, version, moduleSize, true]
        )
        const image = this.produceImage(imagePtr, version)
        this.free(inputPtr)
        this.imageFree(imagePtr)
        return image
      }
      Module['malloc'] = cwrap('malloc', 'number', ['number'])
      Module['free'] = cwrap('free', null, ['number'])
      Module['imageFree'] = cwrap('lifehash_image_free', null, ['number'])
      Module['allocString'] = function (s) {
        const utf8 = new TextEncoder().encode(s)
        const sPtr = this.malloc(utf8.length + 1)
        const i = new Uint8Array(HEAPU8.buffer, sPtr, utf8.length)
        i.set(utf8)
        HEAPU8[sPtr + utf8.length] = 0
        return sPtr
      }
      Module['produceImage'] = function (imagePtr, version) {
        const imageStruct = new Uint32Array(HEAPU8.buffer, imagePtr, 3)
        const width = imageStruct[0]
        const height = imageStruct[1]
        const inColorsPtr = imageStruct[2]
        const colorsLength = width * height * 4
        const inColors = new Uint8Array(HEAPU8.buffer, inColorsPtr, colorsLength)
        const outColors = new Uint8ClampedArray(new ArrayBuffer(colorsLength))
        outColors.set(inColors)
        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')
        canvas.width = width
        canvas.height = height
        const imageData = context.createImageData(width, height)
        imageData.data.set(outColors)
        context.putImageData(imageData, 0, 0)
        const dataURI = canvas.toDataURL()
        const image = new Image()
        const scale = version === 2 ? 0.5 : 1
        image.width = width * scale
        image.height = height * scale
        image.src = dataURI
        return image
      }
      Module['sha256'] = function (s) {
        const utf8 = new TextEncoder().encode(s)
        const inputPtr = this.malloc(utf8.length)
        const i = new Uint8Array(HEAPU8.buffer, inputPtr, utf8.length)
        i.set(utf8)
        const outputPtr = this.malloc(32)
        ccall('lifehash_sha256', null, ['number', 'number', 'number'], [inputPtr, utf8.length, outputPtr])
        const o = new Uint8Array(new ArrayBuffer(32))
        o.set(new Uint8Array(HEAPU8.buffer, outputPtr, 32))
        this.free(inputPtr)
        this.free(outputPtr)
        return o
      }
      Module['dataToHex'] = function (data) {
        const inputPtr = this.malloc(data.length)
        const i = new Uint8Array(HEAPU8.buffer, inputPtr, data.length)
        i.set(data)
        const outputPtr = ccall('lifehash_data_to_hex', 'number', ['number', 'number'], [inputPtr, data.length])
        const result = UTF8ToString(outputPtr)
        this.free(inputPtr)
        this.free(outputPtr)
        return result
      }
      Module['hexToData'] = function (hex) {
        const utf8 = new TextEncoder().encode(hex)
        const inputPtr = this.malloc(utf8.length)
        const i = new Uint8Array(HEAPU8.buffer, inputPtr, utf8.length)
        i.set(utf8)
        const outputPtrPtr = this.malloc(4)
        const outputLenPtr = this.malloc(4)
        const outputPtr = 0
        const success = ccall(
          'lifehash_hex_to_data',
          'boolean',
          ['number', 'number', 'number', 'number'],
          [inputPtr, utf8.length, outputPtrPtr, outputLenPtr]
        )
        let result = null
        if (success) {
          const outputLen = new Uint32Array(HEAPU8.buffer, outputLenPtr, 1)[0]
          const outputPtr = new Uint32Array(HEAPU8.buffer, outputPtrPtr, 1)[0]
          const output = new Uint8Array(HEAPU8.buffer, outputPtr, outputLen)
          result = new Uint8Array(new ArrayBuffer(outputLen))
          result.set(output)
        }
        this.free(inputPtr)
        this.free(outputLenPtr)
        this.free(outputPtr)
        this.free(outputPtrPtr)
        return result
      }
    }

    return Module.ready
  }
})()
export default Module
