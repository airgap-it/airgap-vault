package it.airgap.vault.plugin.isolatedmodules.js.environment

import com.getcapacitor.JSObject
import it.airgap.vault.plugin.isolatedmodules.js.JSModule
import it.airgap.vault.plugin.isolatedmodules.js.JSModuleAction
import it.airgap.vault.util.JSException
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock

interface JSEnvironment {
    suspend fun isSupported(): Boolean
    @Throws(JSException::class)
    suspend fun run(module: JSModule, action: JSModuleAction, ref: String? = null): JSObject
    suspend fun reset(runRef: String)
    suspend fun destroy()

    abstract class SandboxRegistry<T> {
        val mutex: Mutex = Mutex()
        val sandboxes: MutableMap<String, T> = mutableMapOf()

        suspend inline fun getOrPut(module: JSModule, defaultValue: () -> T): T =
            mutex.withLock {
                sandboxes.getOrPut(module.identifier, defaultValue)
            }

        suspend fun reset() {
            mutex.withLock {
                sandboxes.apply {
                    values.forEach { it.reset() }
                    clear()
                }
            }
        }

        protected abstract suspend fun T.reset()
    }

    enum class Type {
        WebView, JavaScriptEngine;

        companion object {
            fun fromString(value: String): Type? = values().find { it.name.lowercase() == value.lowercase() }
        }
    }
}