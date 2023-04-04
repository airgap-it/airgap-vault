package it.airgap.vault.plugin.isolatedmodules.js

import android.content.Context
import android.os.Build
import com.getcapacitor.JSArray
import com.getcapacitor.JSObject
import it.airgap.vault.plugin.isolatedmodules.FileExplorer
import it.airgap.vault.plugin.isolatedmodules.js.environment.JSEnvironment
import it.airgap.vault.plugin.isolatedmodules.js.environment.JavaScriptEngineEnvironment
import it.airgap.vault.plugin.isolatedmodules.js.environment.WebViewEnvironment
import it.airgap.vault.util.*
import kotlinx.coroutines.*
import java.util.*

class JSEvaluator constructor(
    private val defaultEnvironment: JSEnvironment,
    private val environments: Map<JSEnvironment.Type, JSEnvironment?>
) {
    private val modules: MutableMap<String, JSModule> = mutableMapOf()

    fun registerModule(module: JSModule, protocolIdentifiers: List<String>) {
        module.registerFor(protocolIdentifiers)
    }

    fun deregisterModules(identifiers: List<String>) {
        identifiers.forEach { modules.remove(it) }
    }

    fun deregisterAllModules() {
        modules.clear()
    }

    suspend fun evaluatePreviewModule(module: JSModule, keepEnvironment: Boolean = false): JSObject =
        module.run(JSModuleAction.Load(null, null), keepEnvironment = keepEnvironment).also {
            module.appendType(it)
        }

    suspend fun evaluateLoadModules(
        modules: List<JSModule>,
        protocolType: JSProtocolType?,
        ignoreProtocols: JSArray?,
        keepEnvironment: Boolean = false
    ): JSObject {
        val modulesJson = modules.asyncMap { module ->
            module.run(JSModuleAction.Load(protocolType, ignoreProtocols), keepEnvironment = keepEnvironment).also {
                module.appendType(it)
                module.registerFor(it)
            }
        }

        return JSObject("""
            {
                "modules": $modulesJson
            }
        """.trimIndent())
    }

    suspend fun evaluateCallOfflineProtocolMethod(
        name: String,
        args: JSArray?,
        protocolIdentifier: String,
        keepEnvironment: Boolean = false
    ): JSObject {
        val module = modules[protocolIdentifier] ?: failWithModuleForProtocolNotFound(protocolIdentifier)
        return module.run(JSModuleAction.CallMethod.OfflineProtocol(name, args, protocolIdentifier), keepEnvironment = keepEnvironment)
    }

    suspend fun evaluateCallOnlineProtocolMethod(
        name: String,
        args: JSArray?,
        protocolIdentifier: String,
        networkId: String?,
        keepEnvironment: Boolean = false
    ): JSObject {
        val module = modules[protocolIdentifier] ?: failWithModuleForProtocolNotFound(protocolIdentifier)
        return module.run(JSModuleAction.CallMethod.OnlineProtocol(name, args, protocolIdentifier, networkId), keepEnvironment = keepEnvironment)
    }

    suspend fun evaluateCallBlockExplorerMethod(
        name: String,
        args: JSArray?,
        protocolIdentifier: String,
        networkId: String?,
        keepEnvironment: Boolean = false
    ): JSObject {
        val module = modules[protocolIdentifier] ?: failWithModuleForProtocolNotFound(protocolIdentifier)
        return module.run(JSModuleAction.CallMethod.BlockExplorer(name, args, protocolIdentifier, networkId), keepEnvironment = keepEnvironment)
    }

    suspend fun evaluateCallV3SerializerCompanionMethod(
        name: String,
        args: JSArray?,
        moduleIdentifier: String,
        keepEnvironment: Boolean = false
    ): JSObject {
        val module = modules[moduleIdentifier] ?: failWithModuleNotFound(moduleIdentifier)
        return module.run(JSModuleAction.CallMethod.V3SerializerCompanion(name, args), keepEnvironment = keepEnvironment)
    }


    suspend fun reset() {
        environments.values.forEach { it?.reset() }
    }

    suspend fun destroy() {
        environments.values.forEach { it?.destroy() }
    }

    private suspend fun JSModule.run(action: JSModuleAction, keepEnvironment: Boolean): JSObject {
        val environment = environments[preferredEnvironment] ?: defaultEnvironment

        return environment.run(this, action, keepAlive = keepEnvironment)
    }

    private fun JSModule.appendType(json: JSObject) {
        val type = when (this) {
            is JSModule.Asset -> "static"
            is JSModule.Installed, is JSModule.Preview -> "dynamic"
        }

        json.put("type", type)
    }

    private fun JSModule.registerFor(json: JSObject) {
        val protocols = json.getJSONArray("protocols")
        val protocolIdentifiers = buildList {
            for (i in 0 until protocols.length()) {
                val protocol = protocols.getJSONObject(i)
                add(protocol.getString("identifier"))
            }
        }

        registerFor(protocolIdentifiers)
    }

    private fun JSModule.registerFor(protocolIdentifiers: List<String>) {
        modules[identifier] = this
        protocolIdentifiers.forEach { modules[it] = this }
    }

    @Throws(IllegalStateException::class)
    private fun failWithModuleForProtocolNotFound(protocolIdentifier: String): Nothing = throw IllegalStateException("Module for protocol $protocolIdentifier could not be found.")

    @Throws(IllegalStateException::class)
    private fun failWithModuleNotFound(moduleIdentifier: String): Nothing = throw IllegalStateException("Module $moduleIdentifier could not be found.")
}

suspend fun JSEvaluator(context: Context, fileExplorer: FileExplorer): JSEvaluator {
    val webViewEnvironment = WebViewEnvironment(context, fileExplorer)
    val javaScriptEngineEnvironment =
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) JavaScriptEngineEnvironment(context, fileExplorer).takeIf { it.isSupported() }
        else null

    val environments = mapOf(
        JSEnvironment.Type.WebView to webViewEnvironment,
        JSEnvironment.Type.JavaScriptEngine to javaScriptEngineEnvironment,
    )

    return JSEvaluator(webViewEnvironment, environments)
}