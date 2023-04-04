package it.airgap.vault.plugin.isolatedmodules.js.environment

import com.getcapacitor.JSObject
import it.airgap.vault.plugin.isolatedmodules.js.JSModule
import it.airgap.vault.plugin.isolatedmodules.js.JSModuleAction
import it.airgap.vault.util.JSException

interface JSEnvironment {
    suspend fun isSupported(): Boolean
    @Throws(JSException::class)
    suspend fun run(module: JSModule, action: JSModuleAction, keepAlive: Boolean): JSObject
    suspend fun reset()
    suspend fun destroy()

    enum class Type {
        WebView, JavaScriptEngine;

        companion object {
            fun fromString(value: String): Type? = values().find { it.name.lowercase() == value.lowercase() }
        }
    }
}