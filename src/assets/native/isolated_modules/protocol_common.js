/**
 * START PLATFORM DEFINED 
 */

/*** START required ***/

var identifier = __platform__identifier /* : string */
var options = __platform__options /* : object */
var action = __platform__action /* : 'getField' | 'callMethod */

var handleError = __platform__handleError /* : function(error: string) */
var handleResult = __platform__handleResult /* : function(result: any) */

/*** END required ***/

/*** START optional ***/

var field = typeof __platform__field !== 'undefined' ? __platform__field : undefined /* : string */

var method = typeof __platform__method !== 'undefined' ? __platform__method : undefined /* : string */
var args = typeof __platform__args !== 'undefined' ? __platform__args : undefined /* : [any] */

/*** END optional ***/

/**
 * END PLATFORM DEFINED 
 */

function createOnError(description, handler) {
  return function(error) {
    var fullDescription
    if (typeof error === 'string') {
      if (typeof description === 'string') {
        fullDescription = `${description} (${error})`
      } else {
        fullDescription = error
      }
    } else if (typeof error === 'object' && typeof error.message === 'string') {
      if (typeof description === 'string') {
        fullDescription = `${description} (${error.message})`
      } else {
        fullDescription = error.message
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

function onError(description) {
  return createOnError(description, function(error) { 
    handleError(error)
  })
}
  
function loadCoinlib(callback) {
  airgapCoinLib.isCoinlibReady().then(callback).catch(onError())
}

function createProtocol(identifier, options) {
  return airgapCoinLib.createProtocolByIdentifier(identifier, options)
}

function getField(protocol, field, callback) {
  callback(protocol[field])
}

function callMethod(protocol, method, args, callback) {
  protocol[method](...args).then(callback).catch(onError())
}

loadCoinlib(function() {
  var protocol = createProtocol(identifier, options)
  switch (action) {
    case 'getField':
      getField(protocol, field, handleResult)
      break
    case 'callMethod':
      callMethod(protocol, method, args, handleResult)
      break
    default:
      throw new Error(`Unknown action ${action}`)
  }
})