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

    suspend fun evaluatePreviewModule(module: JSModule): JSObject =
        module.environment.run(module, JSModuleAction.Load(null)).also {
            module.appendType(it)
        }

    suspend fun evaluateLoadModules(modules: List<JSModule>, protocolType: JSProtocolType?): JSObject {
        val modulesJson = modules.asyncMap { module ->
            module.environment.run(module, JSModuleAction.Load(protocolType)).also {
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
    ): JSObject {
        val module = modules[protocolIdentifier] ?: failWithModuleForProtocolNotFound(protocolIdentifier)
        return module.environment.run(module, JSModuleAction.CallMethod.OfflineProtocol(name, args, protocolIdentifier))
    }

    suspend fun evaluateCallOnlineProtocolMethod(
        name: String,
        args: JSArray?,
        protocolIdentifier: String,
        networkId: String?,
    ): JSObject {
        val module = modules[protocolIdentifier] ?: failWithModuleForProtocolNotFound(protocolIdentifier)
        return module.environment.run(module, JSModuleAction.CallMethod.OnlineProtocol(name, args, protocolIdentifier, networkId))
    }

    suspend fun evaluateCallBlockExplorerMethod(
        name: String,
        args: JSArray?,
        protocolIdentifier: String,
        networkId: String?,
    ): JSObject {
        val module = modules[protocolIdentifier] ?: failWithModuleForProtocolNotFound(protocolIdentifier)
        return module.environment.run(module, JSModuleAction.CallMethod.BlockExplorer(name, args, protocolIdentifier, networkId))
    }

    suspend fun evaluateCallV3SerializerCompanionMethod(
        name: String,
        args: JSArray?,
        moduleIdentifier: String,
    ): JSObject {
        val module = modules[moduleIdentifier] ?: failWithModuleNotFound(moduleIdentifier)
        return module.environment.run(module, JSModuleAction.CallMethod.V3SerializerCompanion(name, args))
    }


    suspend fun destroy() {
        environments.values.forEach { it?.destroy() }
    }

    private val JSModule.environment: JSEnvironment
        get() = environments[preferredEnvironment] ?: defaultEnvironment

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