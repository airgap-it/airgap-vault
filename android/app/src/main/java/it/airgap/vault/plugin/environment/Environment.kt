package it.airgap.vault.plugin.environment

import android.content.Intent
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.annotation.CapacitorPlugin

@CapacitorPlugin
class Environment : Plugin() {

    override fun handleOnNewIntent(intent: Intent?) {
        val context = Context.fromString(intent?.getStringExtra("it.airgap.vault.CONTEXT"))
        handleContextChanged(context)

        super.handleOnNewIntent(intent)
    }

    private fun handleContextChanged(context: Context) {
        val data = JSObject().apply { put("context", context.value) }
        notifyListeners("envContextChanged", data, true)
    }

    private enum class Context(val value: String) {
        Empty("empty"),
        Knox("knox");

        companion object {
            fun fromString(value: String?): Context = value?.let {
                v -> values().find { it.value == v }
            } ?: Empty
        }
    }
}