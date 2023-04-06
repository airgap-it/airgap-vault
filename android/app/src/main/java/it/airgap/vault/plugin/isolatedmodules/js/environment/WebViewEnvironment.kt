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
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.coroutines.withContext
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.ConcurrentMap

class WebViewEnvironment(
    private val context: Context,
    private val fileExplorer: FileExplorer,
) : JSEnvironment {
    override suspend fun isSupported(): Boolean = true

    private val webViewsMutex: Mutex = Mutex()
    private val webViews: ConcurrentMap<String, Pair<WebView, JSAsyncResult>> = ConcurrentHashMap()

    private val runMutex: Mutex = Mutex()

    @Throws(JSException::class)
    override suspend fun run(module: JSModule, action: JSModuleAction, keepAlive: Boolean): JSObject = withContext(Dispatchers.Main) {
        runMutex.withLock {
            useIsolatedModule(module, keepAlive) { webView, jsAsyncResult ->
                val resultId = jsAsyncResult.createId()
                val script = """
                    execute(
                        ${module.namespace ?: JSUndefined},
                        '${module.identifier}',
                        ${action.toJson()},
                        function (result) {
                            ${jsAsyncResult}.completeFromJS('$resultId', JSON.stringify(result));
                        },
                        function (error) {
                            ${jsAsyncResult}.throwFromJS('$resultId', error);
                        }
                    );
                """.trimIndent()

                webView.evaluateJavascript(script)

                JSObject(jsAsyncResult.await(resultId).getOrThrow())
            }
        }
    }

    override suspend fun reset() {
        webViewsMutex.withLock {
            webViews.apply {
                values.forEach { it.first.destroy() }
                clear()
            }
        }
    }
    override suspend fun destroy() {
        reset()
    }

    private suspend inline fun <R> useIsolatedModule(module: JSModule, keepAlive: Boolean, block: (WebView, JSAsyncResult) -> R): R {
        val createWebView = {
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
            }.apply {
                evaluateJavascript(fileExplorer.readIsolatedModulesScript().decodeToString())

                val sources = fileExplorer.readModuleSources(module)
                sources.forEach { evaluateJavascript(it.decodeToString()) }
            }

            Pair(webView, jsAsyncResult)
        }

        val (webView, jsAsyncResult) = webViewsMutex.withLock {
            if (keepAlive) webViews.getOrPut(module.identifier) { createWebView() } else createWebView()
        }

        return block(webView, jsAsyncResult).also {
            if (!keepAlive) webView.destroy()
        }
    }
}