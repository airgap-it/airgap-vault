package it.airgap.vault.util

fun Any.serialize(): Any = when (this) {
    is String -> "\"$this\""
    else -> toString()
}