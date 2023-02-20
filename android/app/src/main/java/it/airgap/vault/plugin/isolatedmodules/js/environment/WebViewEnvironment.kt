package it.airgap.vault.plugin.isolatedmodules.js.environment

import android.content.Context
import android.content.res.AssetManager
import android.os.Build
import android.view.View
import android.webkit.WebSettings
import android.webkit.WebView
import com.getcapacitor.JSObject
import it.airgap.vault.plugin.isolatedmodules.FileExplorer
import it.airgap.vault.plugin.isolatedmodules.js.*
import it.airgap.vault.util.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class WebViewEnvironment(
    private val context: Context,
    private val fileExplorer: FileExplorer,
) : JSEnvironment {
    override suspend fun isSupported(): Boolean = true

    @Throws(JSException::class)
    override suspend fun run(module: JSModule, action: JSModuleAction): JSObject = withContext(Dispatchers.Main) {
        useIsolatedModule(module) { webView, jsAsyncResult ->
            val script = """
                execute(
                    ${module.namespace ?: JSUndefined},
                    '${module.identifier}',
                    ${action.toJson()},
                    function (result) {
                        ${jsAsyncResult}.completeFromJS(JSON.stringify(result));
                    },
                    function (error) {
                        ${jsAsyncResult}.throwFromJS(error);
                    }
                );
            """.trimIndent()

            webView.evaluateJavascript(script)

            JSObject(jsAsyncResult.await().getOrThrow())
        }
    }

    override suspend fun destroy() {
        /* no action */
    }

    private inline fun <R> useIsolatedModule(module: JSModule, block: (WebView, JSAsyncResult) -> R): R {
        val jsAsyncResult = JSAsyncResult()
        val webView = WebView(context).apply {
            visibility = View.GONE

            with(settings) {
                javaScriptEnabled = true

                allowContentAccess = false
                allowFileAccess = false
                blockNetworkImage = true
                cacheMode = WebSettings.LOAD_NO_CACHE
                displayZoomControls = false
                setGeolocationEnabled(false)
                loadsImagesAutomatically = false
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) safeBrowsingEnabled = true
                setSupportZoom(false)
            }

            setLayerType(View.LAYER_TYPE_HARDWARE, null)
            setNetworkAvailable(false)

            addJavascriptInterface(jsAsyncResult)
        }

        with(webView) {
            evaluateJavascript(fileExplorer.readIsolatedModulesScript().decodeToString())

            val sources = fileExplorer.readModuleSources(module)
            sources.forEach { evaluateJavascript(it.decodeToString()) }
        }

        return block(webView, jsAsyncResult).also {
            webView.destroy()
        }
    }
}