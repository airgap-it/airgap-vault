package it.airgap.vault.util

import android.content.Context
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall

val Plugin.applicationContext: Context
    get() = activity.applicationContext

inline fun Plugin.requiresPermissions(code: Int, vararg permissions: String, block: () -> Unit) {
    if (hasRequiredPermissions()) {
        block()
    } else {
        pluginRequestPermissions(permissions, code)
    }
}

fun PluginCall.resolveWithData(vararg keyValuePairs: Pair<String, Any>) {
    val data = JSObject().apply {
        keyValuePairs.forEach { put(it.first, it.second) }
    }
    resolve(data)
}