package it.airgap.vault.plugin.isolatedmodules

import androidx.lifecycle.lifecycleScope
import com.getcapacitor.JSArray
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import it.airgap.vault.plugin.isolatedmodules.js.*
import it.airgap.vault.util.*
import kotlinx.coroutines.Deferred
import kotlinx.coroutines.launch
import org.bouncycastle.crypto.params.Ed25519PublicKeyParameters
import org.bouncycastle.crypto.signers.Ed25519Signer
import org.json.JSONObject

@CapacitorPlugin
class IsolatedModules : Plugin() {
    private val jsEvaluator: Deferred<JSEvaluator> = ExecutableDeferred { JSEvaluator(context, fileExplorer) }
    private val fileExplorer: FileExplorer by lazy { FileExplorer(context) }

    @PluginMethod
    fun previewDynamicModule(call: PluginCall) {
        call.executeCatching {
            assertReceived(Param.PATH, Param.DIRECTORY)

            activity.lifecycleScope.launch {
                executeCatching {
                    val module = fileExplorer.loadPreviewModule(path, directory)
                    val manifest = fileExplorer.readModuleManifest(module)
                    val moduleJson = jsEvaluator.await().evaluatePreviewModule(module)

                    resolve(
                        JSObject(
                            """
                                {
                                    "module": $moduleJson,
                                    "manifest": ${JSObject(manifest.decodeToString())}
                                }
                            """.trimIndent()
                        )
                    )
                }
            }
        }
    }

    @PluginMethod
    fun verifyDynamicModule(call: PluginCall) {
        call.executeCatching {
            assertReceived(Param.PATH, Param.DIRECTORY)

            activity.lifecycleScope.launch {
                executeCatching {
                    val module = fileExplorer.loadPreviewModule(path, directory)
                    val manifest = fileExplorer.readModuleManifest(module)
                    val files = fileExplorer.readModuleFiles(module)

                    val message = (files + manifest).reduce(ByteArray::plus)
                    val publicKey = JSObject(manifest.decodeToString()).getString("publicKey")!!

                    val verified = Ed25519Signer()
                        .apply {
                            init(false, Ed25519PublicKeyParameters(publicKey.asByteArray()))
                            update(message, 0, message.size)
                        }
                        .verifySignature(module.signature.asByteArray())

                    resolve(
                        JSObject(
                            """
                                {
                                    "verified": $verified
                                }
                            """.trimIndent()
                        )
                    )
                }
            }
        }
    }

    @PluginMethod
    fun registerDynamicModule(call: PluginCall) {
        call.executeCatching {
            assertReceived(Param.IDENTIFIER, Param.PROTOCOL_IDENTIFIERS)

            activity.lifecycleScope.launch {
                executeCatching {
                    val module = fileExplorer.loadInstalledModule(identifier)
                    jsEvaluator.await().registerModule(module, protocolIdentifiers)

                    resolve()
                }
            }
        }
    }

    @PluginMethod
    fun readDynamicModule(call: PluginCall) {
        call.executeCatching {
            assertReceived(Param.IDENTIFIER)

            activity.lifecycleScope.launch {
                executeCatching {
                    val module = fileExplorer.loadInstalledModule(identifier)
                    val manifest = fileExplorer.readModuleManifest(module)

                    resolve(
                        JSObject(
                            """
                                {
                                    "manifest": ${JSObject(manifest.decodeToString())},
                                    "installedAt": "${module.installedAt}"
                                }
                            """.trimIndent()
                        )
                    )
                }
            }
        }
    }

    @PluginMethod
    fun removeDynamicModules(call: PluginCall) {
        activity.lifecycleScope.launch {
            call.executeCatching {
                val jsEvaluator = jsEvaluator.await()

                identifiers?.let {
                    fileExplorer.removeInstalledModules(it)
                    jsEvaluator.deregisterModules(it)
                } ?: run {
                    fileExplorer.removeAllInstalledModules()
                    jsEvaluator.deregisterAllModules()
                }

                resolve()
            }
        }
    }

    @PluginMethod
    fun readAssetModule(call: PluginCall) {
        call.executeCatching {
            assertReceived(Param.IDENTIFIER)

            activity.lifecycleScope.launch {
                executeCatching {
                    val module = fileExplorer.loadAssetModule(identifier)
                    val manifest = fileExplorer.readModuleManifest(module)

                    resolve(
                        JSObject(
                            """
                                {
                                    "manifest": ${JSObject(manifest.decodeToString())}
                                }
                            """.trimIndent()
                        )
                    )
                }
            }
        }
    }

    @PluginMethod
    fun loadAllModules(call: PluginCall) {
        activity.lifecycleScope.launch {
            call.executeCatching {
                val modules = fileExplorer.loadAssetModules() + fileExplorer.loadInstalledModules()

                resolve(jsEvaluator.await().evaluateLoadModules(modules, protocolType, ignoreProtocols))
            }
        }
    }

    @PluginMethod
    fun callMethod(call: PluginCall) {
        call.executeCatching {
            assertReceived(Param.TARGET, Param.METHOD)

            activity.lifecycleScope.launch {
                executeCatching {
                    val value = when (target) {
                        JSCallMethodTarget.OfflineProtocol -> {
                            assertReceived(Param.PROTOCOL_IDENTIFIER)
                            jsEvaluator.await().evaluateCallOfflineProtocolMethod(method, args, protocolIdentifier)
                        }
                        JSCallMethodTarget.OnlineProtocol -> {
                            assertReceived(Param.PROTOCOL_IDENTIFIER)
                            jsEvaluator.await().evaluateCallOnlineProtocolMethod(method, args, protocolIdentifier, networkId)
                        }
                        JSCallMethodTarget.BlockExplorer -> {
                            assertReceived(Param.PROTOCOL_IDENTIFIER)
                            jsEvaluator.await().evaluateCallBlockExplorerMethod(method, args, protocolIdentifier, networkId)
                        }
                        JSCallMethodTarget.V3SerializerCompanion -> {
                            assertReceived(Param.MODULE_IDENTIFIER)
                            jsEvaluator.await().evaluateCallV3SerializerCompanionMethod(method, args, moduleIdentifier)
                        }
                    }
                    resolve(value)
                }
            }
        }
    }

    @PluginMethod
    fun batchCallMethod(call: PluginCall) {
        call.executeCatching {
            assertReceived(Param.OPTIONS)

            activity.lifecycleScope.launch {
                executeCatching {
                    val jsEvaluator = jsEvaluator.await()

                    val values = jsEvaluator.singleRun { runRef ->
                        options.toList<JSONObject>().asyncMap { jsonObject ->
                            try {
                                val jsObject = JSObject(jsonObject.toString())
                                assertReceivedIn(jsObject, Param.TARGET, Param.METHOD)

                                val target = jsObject.getString(Param.TARGET)?.let { JSCallMethodTarget.fromString(it) }!!
                                val method = jsObject.getString(Param.METHOD)!!
                                val args = if (jsObject.has(Param.ARGS)) JSArray(jsObject.getJSONArray(Param.ARGS).toString()) else null
                                val protocolIdentifier = jsObject.getString(Param.PROTOCOL_IDENTIFIER)
                                val networkId = jsObject.getString(Param.NETWORK_ID)
                                val moduleIdentifier = jsObject.getString(Param.MODULE_IDENTIFIER)

                                val value = when (target) {
                                    JSCallMethodTarget.OfflineProtocol -> {
                                        assertReceivedIn(jsObject, Param.PROTOCOL_IDENTIFIER)
                                        jsEvaluator.evaluateCallOfflineProtocolMethod(method, args, protocolIdentifier!!, runRef)
                                    }
                                    JSCallMethodTarget.OnlineProtocol -> {
                                        assertReceivedIn(jsObject, Param.PROTOCOL_IDENTIFIER)
                                        jsEvaluator.evaluateCallOnlineProtocolMethod(method, args, protocolIdentifier!!, networkId, runRef)
                                    }
                                    JSCallMethodTarget.BlockExplorer -> {
                                        assertReceivedIn(jsObject, Param.PROTOCOL_IDENTIFIER)
                                        jsEvaluator.evaluateCallBlockExplorerMethod(method, args, protocolIdentifier!!, networkId, runRef)
                                    }
                                    JSCallMethodTarget.V3SerializerCompanion -> {
                                        assertReceivedIn(jsObject, Param.MODULE_IDENTIFIER)
                                        jsEvaluator.evaluateCallV3SerializerCompanionMethod(method, args, moduleIdentifier!!, runRef)
                                    }
                                }

                                JSObject("""
                                    {
                                        "type": "success",
                                        "value": ${value.get("value").serialize()}
                                    }
                                """.trimIndent())
                            } catch (e: Exception) {
                                JSObject("""
                                    {
                                        "type": "error",
                                        "error": "${e.message}"
                                    }
                                """.trimIndent())
                            }
                        }
                    }

                    resolve(JSObject("""
                        {
                            "values": ${JSArray(values)}
                        }
                    """.trimMargin()))
                }
            }
        }
    }

    override fun handleOnDestroy() {
        super.handleOnDestroy()
        activity.lifecycleScope.launch {
            jsEvaluator.await().destroy()
        }
    }

    private val PluginCall.path: String
        get() = getString(Param.PATH)!!

    private val PluginCall.directory: Directory
        get() = getString(Param.DIRECTORY)?.let { Directory.fromString(it) }!!

    private val PluginCall.identifier: String
        get() = getString(Param.IDENTIFIER)!!

    private val PluginCall.identifiers: List<String>?
        get() = getArray(Param.IDENTIFIERS, null)?.toList()

    private  val PluginCall.protocolIdentifiers: List<String>
        get() = getArray(Param.PROTOCOL_IDENTIFIERS).toList()

    private val PluginCall.protocolType: JSProtocolType?
        get() = getString(Param.PROTOCOL_TYPE)?.let { JSProtocolType.fromString(it) }

    private val PluginCall.ignoreProtocols: JSArray?
        get() = getArray(Param.IGNORE_PROTOCOLS, null)

    private val PluginCall.target: JSCallMethodTarget
        get() = getString(Param.TARGET)?.let { JSCallMethodTarget.fromString(it) }!!

    private val PluginCall.method: String
        get() = getString(Param.METHOD)!!

    private val PluginCall.args: JSArray?
        get() = getArray(Param.ARGS, null)

    private val PluginCall.protocolIdentifier: String
        get() = getString(Param.PROTOCOL_IDENTIFIER)!!

    private val PluginCall.moduleIdentifier: String
        get() = getString(Param.MODULE_IDENTIFIER)!!

    private val PluginCall.networkId: String?
        get() = getString(Param.NETWORK_ID)

    private val PluginCall.options: JSArray
        get() = getArray(Param.OPTIONS)

    private object Param {
        const val PATH = "path"
        const val DIRECTORY = "directory"
        const val IDENTIFIER = "identifier"
        const val IDENTIFIERS = "identifiers"
        const val PROTOCOL_IDENTIFIERS = "protocolIdentifiers"
        const val PROTOCOL_TYPE = "protocolType"
        const val IGNORE_PROTOCOLS = "ignoreProtocols"
        const val TARGET = "target"
        const val METHOD = "method"
        const val ARGS = "args"
        const val PROTOCOL_IDENTIFIER = "protocolIdentifier"
        const val MODULE_IDENTIFIER = "moduleIdentifier"
        const val NETWORK_ID = "networkId"
        const val OPTIONS = "options"
    }
}