package it.airgap.vault.plugin.isolatedmodules.js.environment

import android.content.Context
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

class WebViewEnvironment(
    private val context: Context,
    private val fileExplorer: FileExplorer,
) : JSEnvironment {
    override suspend fun isSupported(): Boolean = true

    private val webViewsMutex: Mutex = Mutex()
    private val webViews: MutableMap<String, WebViewRegistry> = mutableMapOf()

    private val runMutex: Mutex = Mutex()

    @Throws(JSException::class)
    override suspend fun run(module: JSModule, action: JSModuleAction, ref: String?): JSObject = withContext(Dispatchers.Main) {
        runMutex.withLock {
            useIsolatedModule(module, ref) { webView, jsAsyncResult ->
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

    override suspend fun reset(runRef: String) {
        webViewsMutex.withLock {
            webViews.remove(runRef)?.reset()
        }
    }
    override suspend fun destroy() {
        webViewsMutex.withLock {
            webViews.apply {
                values.forEach { it.reset() }
                clear()
            }
        }
    }

    private suspend inline fun <R> useIsolatedModule(module: JSModule, runRef: String?, block: (WebView, JSAsyncResult) -> R): R {
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
            if (runRef != null) webViews.getOrPut(runRef, module) { createWebView() } else createWebView()
        }

        return block(webView, jsAsyncResult).also {
            if (runRef == null) webView.destroy()
        }
    }

    private suspend inline fun MutableMap<String, WebViewRegistry>.getOrPut(
        runRef: String,
        module: JSModule,
        defaultValue: () -> Pair<WebView, JSAsyncResult>
    ): Pair<WebView, JSAsyncResult> = getOrPut(runRef) { WebViewRegistry() }.getOrPut(module) { defaultValue() }

    private class WebViewRegistry : JSEnvironment.SandboxRegistry<Pair<WebView, JSAsyncResult>>() {
        override suspend fun Pair<WebView, JSAsyncResult>.reset() {
            first.destroy()
        }
    }
}