function createOnError(description, handler) {
  return function (error) {
    var fullDescription
    if (typeof error === 'string') {
      if (typeof description === 'string') {
        fullDescription = `${description} (${error})`
      } else {
        fullDescription = error
      }
    } else if (typeof error === 'object' && (typeof error.stack === 'string' || typeof error.message === 'string')) {
      if (typeof description === 'string') {
        fullDescription = `${description} (${error.stack || error.message})`
      } else {
        fullDescription = error.stack || error.message
      }
    } else {
      if (typeof description === 'string') {
        fullDescription = description
      } else {
        fullDescription = "Unknown error"
      }
    }
      
    handler(fullDescription)
  }
}

function loadCoinlib(callback, errorHandler) {
  airgapCoinLib.isCoinlibReady().then(callback).catch(errorHandler('loadCoinlib'))
}

function createProtocol(identifier, options) {
  return airgapCoinLib.createProtocolByIdentifier(identifier, options)
}

function keys(protocol, callback) {
  let propertyNames = []
  let obj = protocol
  while (obj) {
    propertyNames = propertyNames.concat(Object.getOwnPropertyNames(obj))
    obj = Object.getPrototypeOf(obj)
  }

  callback(propertyNames.map((key) => [key, typeof protocol[key] === 'function' ? 'method' : 'field']))
}

function getField(protocol, field, callback) {
  callback(protocol[field])
}

function callMethod(protocol, method, args, callback, errorHandler) {
  protocol[method](...args).then(callback).catch(errorHandler(method))
}

const ACTION_KEYS = 'keys'
const ACTION_GET_FIELD = 'getField'
const ACTION_CALL_METHOD = 'callMethod'

function execute(identifier, options, action, handleResult, handleError) {
  const errorHandler = (description) => {
    const prefixedDescription = `[${identifier}]${description ? ' ' + description : undefined}`
    return createOnError(prefixedDescription, function (error) { 
      handleError(error)
    })
  }

  loadCoinlib(function () {
    try {
      var protocol = createProtocol(identifier, options)
      switch (action.type) {
        case ACTION_KEYS:
          keys(protocol, handleResult)
          break
        case ACTION_GET_FIELD:
          getField(protocol, action.field, handleResult)
          break
        case ACTION_CALL_METHOD:
          callMethod(protocol, action.method, action.args, handleResult, errorHandler)
          break
        default:
          throw new Error(`Unknown action ${action.type}`)
      }
    } catch (error) {
      errorHandler()(error)
    }
  }, errorHandler)
}