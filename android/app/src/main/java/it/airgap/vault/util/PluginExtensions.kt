package it.airgap.vault.util

import android.content.Context
import android.util.Log
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall

/*
 * Plugin Extensions
 */

val Plugin.applicationContext: Context
    get() = activity.applicationContext

inline fun Plugin.requiresPermissions(code: Int, vararg permissions: String, block: () -> Unit) {
    if (hasRequiredPermissions()) {
        block()
    } else {
        pluginRequestPermissions(permissions, code)
    }
}

fun Plugin.logDebug(message: String) {
    Log.d(this::class.java.simpleName, message)
}

/*
 * PluginCall Extensions
 */

fun PluginCall.resolveWithData(vararg keyValuePairs: Pair<String, Any>) {
    val data = JSObject().apply {
        keyValuePairs.forEach { put(it.first, it.second) }
    }
    resolve(data)
}

fun PluginCall.assertReceived(vararg params: String, acceptEmpty: Boolean = false) {
    val hasAll = params.map(data::has).all { it }
    val hasEmpty = !acceptEmpty && params.mapNotNull { getString(it)?.isBlank() }.any { it }

    if (!hasAll || hasEmpty) {
        reject("$methodName requires: ${params.joinToString()}")
    }
}