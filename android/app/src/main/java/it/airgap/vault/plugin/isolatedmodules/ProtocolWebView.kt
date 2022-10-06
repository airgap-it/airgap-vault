package it.airgap.vault.plugin.isolatedmodules

import android.content.Context
import android.view.View
import android.webkit.WebView
import android.webkit.WebViewClient
import com.getcapacitor.JSArray
import com.getcapacitor.JSObject
import it.airgap.vault.util.JSAsyncResult
import it.airgap.vault.util.JSUndefined
import it.airgap.vault.util.addJavascriptInterface
import it.airgap.vault.util.evaluateJavascript
import kotlinx.coroutines.CompletableDeferred
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class ProtocolWebView(context: Context) {
    private val jsAsyncResult: JSAsyncResult = JSAsyncResult()

    private val webViewLoadedDeferred: CompletableDeferred<Unit> = CompletableDeferred()
    private val webView: WebView = WebView(context).apply {
        visibility = View.GONE

        with(settings) {
            javaScriptEnabled = true
            allowFileAccess = false
        }

        addJavascriptInterface(jsAsyncResult)
        webViewClient = object : WebViewClient() {
            override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
                webViewLoadedDeferred.complete(Unit)
            }
        }

        loadUrl("${ASSETS_PATH}/${ISOLATED_PROTOCOL_HTML_SOURCE}")
    }

    suspend fun evaluateKeys(identifier: String, options: JSObject?): JSObject =
        evaluate(identifier, options, JSProtocolAction.Keys)

    suspend fun evaluateGetField(identifier: String, options: JSObject?, key: String): JSObject =
        evaluate(identifier, options, JSProtocolAction.GetField(key))

    suspend fun evaluateCallMethod(identifier: String, options: JSObject?, key: String, args: JSArray?): JSObject =
        evaluate(identifier, options, JSProtocolAction.CallMethod(key, args?.replaceNullWithUndefined()))

    private suspend fun evaluate(
        identifier: String,
        options: JSObject?,
        action: JSProtocolAction,
    ): JSObject = withContext(Dispatchers.Main) {
        with(webView) {
            waitUntilLoaded()
            clear()

            val resultId = jsAsyncResult.createId()
            val script = """    
                execute(
                    '$identifier',
                    ${options.orUndefined()},
                    $action,
                    function (result) {
                        ${jsAsyncResult}.completeFromJS('$resultId', JSON.stringify({ ${action.resultField}: result }));
                    },
                    function (error) {
                        ${jsAsyncResult}.throwFromJS('$resultId', error);
                    }
                );
            """.trimIndent()

            evaluateJavascript(script)

            val result = jsAsyncResult.await(resultId).getOrThrow()
            JSObject(result).also { webView.clear() }
        }
    }

    private fun JSObject?.orUndefined(): Any = this ?: JSUndefined

    private fun JSArray.replaceNullWithUndefined(): JSArray =
        JSArray(toList<Any>().map { if (it == JSObject.NULL) JSUndefined else it })

    private suspend fun WebView.waitUntilLoaded() {
        webViewLoadedDeferred.await()
    }

    private fun WebView.clear() {
        clearCache(false)
        clearHistory()
        clearMatches()
        clearFormData()
        clearSslPreferences()
    }

    private sealed interface JSProtocolAction {
        val resultField: String
            get() = "result"

        object Keys : JSProtocolAction {
            private const val TYPE = "keys"
            override val resultField: String = "keys"

            override fun toString(): String = JSObject("""
                {
                    "type": "$TYPE"
                }
            """.trimIndent()).toString()
        }

        data class GetField(val key: String) : JSProtocolAction {
            override fun toString(): String = JSObject("""
                {
                    "type": "$TYPE",
                    "field": "$key"
                }
            """.trimIndent()).toString()

            companion object {
                private const val TYPE = "getField"
            }
        }

        data class CallMethod(val key: String, val args: JSArray?) : JSProtocolAction {
            override fun toString(): String {
                val args = args?.toString() ?: "[]"

                return JSObject("""
                    {
                        "type": "$TYPE",
                        "method": "$key",
                        "args": $args
                    }
                """.trimIndent()).toString()
            }

            companion object {
                private const val TYPE = "callMethod"
            }
        }
    }

    companion object {
        private const val ASSETS_PATH: String = "file:///android_asset"
        private const val ISOLATED_PROTOCOL_HTML_SOURCE: String = "public/assets/native/isolated_modules/isolated-protocol.html"
    }
}