package it.airgap.vault.plugin

data class CodedError(val message: String, val code: Int) {
    override fun toString(): String = "$message (code: $code)"
}

object PluginError {
    val maxAuthenticationRetriesVault = CodedError("Max authentication tries exceeded", 1)
    val maxAuthenticationRetriesSystem = CodedError("Max authentication tries exceeded", 2)
}