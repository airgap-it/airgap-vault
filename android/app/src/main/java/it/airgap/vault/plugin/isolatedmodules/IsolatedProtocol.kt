package it.airgap.vault.plugin.isolatedmodules

import androidx.lifecycle.lifecycleScope
import com.getcapacitor.*
import com.getcapacitor.annotation.CapacitorPlugin
import it.airgap.vault.util.JSUndefined
import it.airgap.vault.util.assertReceived
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

@CapacitorPlugin
class IsolatedProtocol : Plugin() {
    private lateinit var webView: ProtocolWebView

    override fun load() {
        activity.lifecycleScope.launch(Dispatchers.Main) {
            webView = ProtocolWebView(context)
        }
        super.load()
    }

    @PluginMethod
    fun keys(call: PluginCall) {
        with(call) {
            assertReceived(Param.IDENTIFIER)

            activity.lifecycleScope.launch(Dispatchers.Default) {
                call.resolve(webView.evaluateKeys(identifier, options))
            }
        }
    }

    @PluginMethod
    fun getField(call: PluginCall) {
        with(call) {
            assertReceived(Param.IDENTIFIER, Param.KEY)

            activity.lifecycleScope.launch(Dispatchers.Default) {
                call.resolve(webView.evaluateGetField(identifier, options, key))
            }
        }
    }

    @PluginMethod
    fun callMethod(call: PluginCall) {
        with(call) {
            assertReceived(Param.IDENTIFIER, Param.KEY)

            activity.lifecycleScope.launch(Dispatchers.Default) {
                call.resolve(webView.evaluateCallMethod(identifier, options, key, args))
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

    private object Param {
        const val IDENTIFIER = "identifier"
        const val OPTIONS = "options"
        const val KEY = "key"
        const val ARGS = "args"
    }
}