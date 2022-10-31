package it.airgap.vault.util

fun String.startsWithAny(vararg prefixes: String, ignoreCase: Boolean = false): Boolean = prefixes.any { startsWith(it, ignoreCase) }