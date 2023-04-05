package it.airgap.vault.util

fun String?.toJson(): Any = this?.let { "\"$it\"" } ?: JSUndefined