package it.airgap.vault.plugin.isolatedmodules

import android.content.Context
import androidx.lifecycle.lifecycleScope
import com.getcapacitor.*
import com.getcapacitor.annotation.CapacitorPlugin
import it.airgap.vault.util.assertReceived
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
        with(call) {
            assertReceived(Param.IDENTIFIER)

            activity.lifecycleScope.launch {
                try {
                    val webView = protocolWebViewManager.get() ?: failWithWebViewNotInitialized()
                    resolve(webView.evaluateKeys(identifier, options))
                } catch (e: Exception) {
                    reject(e.message, e)
                }
            }
        }
    }

    @PluginMethod
    fun getField(call: PluginCall) {
        with(call) {
            assertReceived(Param.IDENTIFIER, Param.KEY)

            activity.lifecycleScope.launch {
                try {
                    val webView = protocolWebViewManager.get() ?: failWithWebViewNotInitialized()
                    resolve(webView.evaluateGetField(identifier, options, key))
                } catch (e: Exception) {
                    reject(e.message, e)
                }
            }
        }
    }

    @PluginMethod
    fun callMethod(call: PluginCall) {
        with(call) {
            assertReceived(Param.IDENTIFIER, Param.KEY)

            activity.lifecycleScope.launch {
                try {
                    val webView = protocolWebViewManager.get() ?: failWithWebViewNotInitialized()
                    resolve(webView.evaluateCallMethod(identifier, options, key, args))
                } catch (e: Exception) {
                    reject(e.message, e)
                }
            }
        }
    }

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