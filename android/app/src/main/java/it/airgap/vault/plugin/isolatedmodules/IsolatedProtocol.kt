package it.airgap.vault.plugin.isolatedmodules

import android.webkit.WebView
import com.getcapacitor.*
import com.getcapacitor.annotation.CapacitorPlugin
import it.airgap.vault.util.JSCompletableDeferred
import it.airgap.vault.util.JSUndefined
import it.airgap.vault.util.assertReceived
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

@CapacitorPlugin
class IsolatedProtocol : Plugin() {

    @PluginMethod
    fun getField(call: PluginCall) {
        with(call) {
            assertReceived(Param.IDENTIFIER, Param.KEY)

            CoroutineScope(Dispatchers.Default).launch {
                call.resolve(getField(identifier, options.orUndefinedIfEmpty(), key))
            }
        }
    }

    @PluginMethod
    fun callMethod(call: PluginCall) {
        with(call) {
            assertReceived(Param.IDENTIFIER, Param.KEY)

            CoroutineScope(Dispatchers.Default).launch {
                call.resolve(callMethod(identifier, options.orUndefinedIfEmpty(), key, args.orNullifEmpty()?.replaceNullWithUndefined()))
            }
        }
    }

    private suspend fun getField(identifier: String, options: Any, key: String): Result<JSObject> =
        spawnCoinlibWebView(identifier, options, """
            callback(protocol.${key})
        """.trimIndent())

    private suspend fun callMethod(identifier: String, options: Any, key: String, args: JSArray?): Result<JSObject> {
        val args = args?.let { "...${args}" } ?: ""

        return spawnCoinlibWebView(identifier, options, """
            protocol.${key}(${args}).then(callback).catch(onError())
        """.trimIndent())
    }

    private suspend fun spawnCoinlibWebView(identifier: String, options: Any, getResult: String): Result<JSObject> {
        val webViewContext = Dispatchers.Main

        val resultDeferred = JSCompletableDeferred()
        val webView = withContext(webViewContext) {
            WebView(context).apply {
                settings.javaScriptEnabled = true
                addJavascriptInterface(resultDeferred, "resultDeferred")
            }
        }

        val html = """
            <script src="file:///android_asset/$COINLIB_SOURCE" type="text/javascript"></script>
            <script src="file:///android_asset/$UTILS_SOURCE" type="text/javascript"></script>
            <script type="text/javascript">
                function onError(description) {
                    return createOnError(description, function(error) { 
                        resultDeferred.throwFromJS(error) 
                    })
                }
                    
                function loadCoinlib(callback) {
                    airgapCoinLib.isCoinlibReady().then(callback).catch(onError())
                }
                
                function createProtocol(identifier) {
                    return airgapCoinLib.createProtocolByIdentifier(identifier, $options)
                }
                
                function getResult(protocol, callback) {
                    $getResult
                }
                
                loadCoinlib(function () {
                    var protocol = createProtocol('$identifier')
                    getResult(protocol, function(result) {
                        resultDeferred.completeFromJS(JSON.stringify({ result }))
                    })
                })
            </script>
        """.trimIndent()

        withContext(webViewContext) {
            webView.loadDataWithBaseURL(
                "file:///android_asset",
                html,
                "text/html",
                "utf-8",
                null,
            )
        }

        return resultDeferred.await()
    }

    private fun JSArray.orNullifEmpty(): JSArray? = takeIf { it.length() > 0 }
    private fun JSObject.orUndefinedIfEmpty(): Any = takeIf { it.length() > 0 } ?: JSUndefined

    private fun JSArray.replaceNullWithUndefined(): JSArray =
        JSArray(toList<Any>().map { if (it == JSObject.NULL) JSUndefined else it })

    private fun PluginCall.resolve(result: Result<JSObject>) {
        result.onSuccess { resolve(it) }
        result.onFailure { errorCallback(it.message) }
    }

    private val PluginCall.identifier: String
        get() = getString(Param.IDENTIFIER)!!

    private val PluginCall.options: JSObject
        get() = getObject(Param.OPTIONS)

    private val PluginCall.key: String
        get() = getString(Param.KEY)!!

    private val PluginCall.args: JSArray
        get() = getArray(Param.ARGS)

    private object Param {
        const val IDENTIFIER = "identifier"
        const val OPTIONS = "options"
        const val KEY = "key"
        const val ARGS = "args"
    }

    companion object {
        private const val COINLIB_SOURCE: String = "public/assets/libs/airgap-coin-lib.browserify.js"
        private const val UTILS_SOURCE: String = "isolated_modules/utils.js"
    }
}