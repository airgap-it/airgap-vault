package it.airgap.vault.plugin.isolatedmodules

import android.content.Context
import androidx.lifecycle.lifecycleScope
import com.getcapacitor.*
import com.getcapacitor.annotation.CapacitorPlugin
import it.airgap.vault.util.assertReceived
import it.airgap.vault.util.executeCatching
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock

@CapacitorPlugin
class IsolatedProtocol : Plugin() {

    private val protocolWebViewManager: ProtocolWebViewManager = ProtocolWebViewManager()

    override fun load() {
        activity.lifecycleScope.launch(Dispatchers.Main) {
            protocolWebViewManager.createWebView(context)
        }
        super.load()
    }

    @PluginMethod
    fun keys(call: PluginCall) {
        call.executeCatching {
            assertReceived(Param.IDENTIFIER)

            activity.lifecycleScope.launch {
                executeCatching {
                    val webView = protocolWebViewManager.get() ?: failWithWebViewNotInitialized()
                    resolve(webView.evaluateKeys(identifier, options))
                }
            }
        }
    }

    @PluginMethod
    fun getField(call: PluginCall) {
        call.executeCatching {
            assertReceived(Param.IDENTIFIER, Param.KEY)

            activity.lifecycleScope.launch {
                executeCatching {
                    val webView = protocolWebViewManager.get() ?: failWithWebViewNotInitialized()
                    resolve(webView.evaluateGetField(identifier, options, key))
                }
            }
        }
    }

    @PluginMethod
    fun callMethod(call: PluginCall) {
        call.executeCatching {
            assertReceived(Param.IDENTIFIER, Param.KEY)

            activity.lifecycleScope.launch {
                executeCatching {
                    val webView = protocolWebViewManager.get() ?: failWithWebViewNotInitialized()
                    resolve(webView.evaluateCallMethod(identifier, options, key, args))
                }
            }
        }
    }

    private val PluginCall.identifier: String
        get() = getString(Param.IDENTIFIER)!!

    private val PluginCall.options: JSObject?
        get() = getObject(Param.OPTIONS, null)

    private val PluginCall.key: String
        get() = getString(Param.KEY)!!

    private val PluginCall.args: JSArray?
        get() = getArray(Param.ARGS, null)

    private class ProtocolWebViewManager {
        private val mutex: Mutex = Mutex()
        private var webView: ProtocolWebView? = null

        suspend fun createWebView(context: Context) = mutex.withLock {
            webView = ProtocolWebView(context)
        }

        suspend fun get(): ProtocolWebView? = mutex.withLock {
            webView
        }
    }

    private object Param {
        const val IDENTIFIER = "identifier"
        const val OPTIONS = "options"
        const val KEY = "key"
        const val ARGS = "args"
    }

    private fun failWithWebViewNotInitialized(): Nothing = throw IllegalStateException("WebView has not been initialized yet.")
}