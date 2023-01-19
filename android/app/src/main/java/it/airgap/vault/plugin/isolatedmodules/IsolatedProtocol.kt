package it.airgap.vault.plugin.isolatedmodules

import android.webkit.WebView
import androidx.lifecycle.lifecycleScope
import com.getcapacitor.*
import com.getcapacitor.annotation.CapacitorPlugin
import it.airgap.vault.util.JSCompletableDeferred
import it.airgap.vault.util.JSUndefined
import it.airgap.vault.util.addJavascriptInterface
import it.airgap.vault.util.assertReceived
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

@CapacitorPlugin
class IsolatedProtocol : Plugin() {

    @PluginMethod
    fun getField(call: PluginCall) {
        with(call) {
            assertReceived(Param.IDENTIFIER, Param.KEY)

            activity.lifecycleScope.launch(Dispatchers.Default) {
                call.resolve(getField(identifier, options, key))
            }
        }
    }

    @PluginMethod
    fun callMethod(call: PluginCall) {
        with(call) {
            assertReceived(Param.IDENTIFIER, Param.KEY)

            activity.lifecycleScope.launch(Dispatchers.Default) {
                call.resolve(callMethod(identifier, options, key, args?.replaceNullWithUndefined()))
            }
        }
    }

    private suspend fun getField(identifier: String, options: JSObject?, key: String): Result<JSObject> =
        spawnCoinlibWebView(identifier, options, JSProtocolAction.GetField, """
            var __platform__field = '$key'
        """.trimIndent())

    private suspend fun callMethod(identifier: String, options: JSObject?, key: String, args: JSArray?): Result<JSObject> {
        val args = args?.toString() ?: "[]"

        return spawnCoinlibWebView(identifier, options, JSProtocolAction.CallMethod, """
            var __platform__method = '$key'
            var __platform__args = $args
        """.trimIndent())
    }

    private suspend fun spawnCoinlibWebView(
        identifier: String,
        options: JSObject?,
        action: JSProtocolAction,
        script: String? = null,
    ): Result<JSObject> {
        val webViewContext = Dispatchers.Main

        val resultDeferred = JSCompletableDeferred("resultDeferred")
        val webView = withContext(webViewContext) {
            WebView(context).apply {
                settings.javaScriptEnabled = true
                addJavascriptInterface(resultDeferred)
            }
        }

        val html = """
            <script type="text/javascript">
                var __platform__identifier = '$identifier'
                var __platform__options = ${options.orUndefined()}
                var __platform__action = '${action.value}'
                
                ${script ?: ""}
                
                function __platform__handleError(error) {
                    ${resultDeferred.name}.throwFromJS(error)
                }
                
                function __platform__handleResult(result) {
                    ${resultDeferred.name}.completeFromJS(JSON.stringify({ result }))
                }
            </script>
            <script src="$ASSETS_PATH/$COINLIB_SOURCE" type="text/javascript"></script>
            <script src="$ASSETS_PATH/$COMMON_SOURCE" type="text/javascript"></script>
        """.trimIndent()

        withContext(webViewContext) {
            webView.loadDataWithBaseURL(
                ASSETS_PATH,
                html,
                "text/html",
                "utf-8",
                null,
            )
        }

        return resultDeferred.await()
    }

    private fun JSObject?.orUndefined(): Any = this ?: JSUndefined

    private fun JSArray.replaceNullWithUndefined(): JSArray =
        JSArray(toList<Any>().map { if (it == JSObject.NULL) JSUndefined else it })

    private fun PluginCall.resolve(result: Result<JSObject>) {
        result.onSuccess { resolve(it) }
        result.onFailure { errorCallback(it.message) }
    }

    private val PluginCall.identifier: String
        get() = getString(Param.IDENTIFIER)!!

    private val PluginCall.options: JSObject?
        get() = getObject(Param.OPTIONS, null)

    private val PluginCall.key: String
        get() = getString(Param.KEY)!!

    private val PluginCall.args: JSArray?
        get() = getArray(Param.ARGS, null)

    private enum class JSProtocolAction(val value: String) {
        GetField("getField"),
        CallMethod("callMethod")
    }

    private object Param {
        const val IDENTIFIER = "identifier"
        const val OPTIONS = "options"
        const val KEY = "key"
        const val ARGS = "args"
    }

    companion object {
        private const val ASSETS_PATH: String = "file:///android_asset"

        private const val COINLIB_SOURCE: String = "public/assets/libs/airgap-coin-lib.browserify.js"
        private const val COMMON_SOURCE: String = "public/assets/native/isolated_modules/protocol_common.js"
    }
}