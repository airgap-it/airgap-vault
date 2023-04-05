package it.airgap.vault.plugin.isolatedmodules.js

import com.getcapacitor.JSArray
import com.getcapacitor.JSObject
import it.airgap.vault.plugin.isolatedmodules.js.environment.JSEnvironment
import it.airgap.vault.util.JSUndefined
import it.airgap.vault.util.assign
import it.airgap.vault.util.toJson
import java.util.*

sealed interface JSModule {
    val identifier: String
    val namespace: String?
    val preferredEnvironment: JSEnvironment.Type
    val sources: List<String>

    data class Asset(
        override val identifier: String,
        override val namespace: String?,
        override val preferredEnvironment: JSEnvironment.Type,
        override val sources: List<String>,
    ) : JSModule {
        companion object {}
    }

    data class Installed(
        override val identifier: String,
        override val namespace: String?,
        override val preferredEnvironment: JSEnvironment.Type,
        override val sources: List<String>,
        val installedAt: String
    ) : JSModule {
        companion object {}
    }

    data class Preview(
        override val identifier: String,
        override val namespace: String?,
        override val preferredEnvironment: JSEnvironment.Type,
        override val sources: List<String>,
        val path: String,
    ) : JSModule {
        companion object {}
    }

    companion object {}
}

enum class JSProtocolType {
    Offline, Online, Full;

    override fun toString(): String = name.replaceFirstChar { it.lowercase(Locale.getDefault()) }

    companion object {
        fun fromString(value: String): JSProtocolType? = values().find { it.name.lowercase() == value.lowercase() }
    }
}

enum class JSCallMethodTarget {
    OfflineProtocol, OnlineProtocol, BlockExplorer, V3SerializerCompanion;

    override fun toString(): String = name.replaceFirstChar { it.lowercase(Locale.getDefault()) }

    companion object {
        fun fromString(value: String): JSCallMethodTarget? = values().find { it.name.lowercase() == value.lowercase() }
    }
}

sealed interface JSModuleAction {
    fun toJson(): String

    data class Load(val protocolType: JSProtocolType?, val ignoreProtocols: JSArray?) : JSModuleAction {
        override fun toJson(): String = JSObject("""
                {
                    "type": "$TYPE",
                    "protocolType": ${protocolType?.toString().toJson()},
                    "ignoreProtocols": ${ignoreProtocols ?: "[]"}
                }
            """.trimIndent()).toString()

        companion object {
            private const val TYPE = "load"
        }
    }

    sealed class CallMethod(val target: JSCallMethodTarget, private val partial: JSObject) :
        JSModuleAction {
        abstract val name: String
        abstract val args: JSArray?

        override fun toJson(): String {
            val args = args?.toString() ?: "[]"

            return JSObject("""
                    {
                        "type": "$TYPE",
                        "target": "$target",
                        "method": "$name",
                        "args": $args
                    }
                """.trimIndent())
                .assign(partial)
                .toString()
        }

        data class OfflineProtocol(
            override val name: String,
            override val args: JSArray?,
            val protocolIdentifier: String,
        ) : CallMethod(
            JSCallMethodTarget.OfflineProtocol, JSObject("""
            {
                protocolIdentifier: "$protocolIdentifier"
            }
        """.trimIndent())
        )

        data class OnlineProtocol(
            override val name: String,
            override val args: JSArray?,
            val protocolIdentifier: String,
            val networkId: String?,
        ) : CallMethod(
            JSCallMethodTarget.OnlineProtocol, JSObject("""
            {
                protocolIdentifier: "$protocolIdentifier",
                networkId: ${networkId.toJson()}
            }
        """.trimIndent())
        )

        data class BlockExplorer(
            override val name: String,
            override val args: JSArray?,
            val protocolIdentifier: String,
            val networkId: String?,
        ) : CallMethod(
            JSCallMethodTarget.BlockExplorer, JSObject("""
            {
                protocolIdentifier: "$protocolIdentifier",
                networkId: ${networkId.toJson()}
            }
        """.trimIndent())
        )

        data class V3SerializerCompanion(
            override val name: String,
            override val args: JSArray?
        ) : CallMethod(JSCallMethodTarget.V3SerializerCompanion, JSObject("{}"))

        companion object {
            private const val TYPE = "callMethod"
        }
    }
}