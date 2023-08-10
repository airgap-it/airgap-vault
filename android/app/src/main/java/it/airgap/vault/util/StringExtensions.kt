package it.airgap.vault.util

fun String?.toJS(): Any = this?.serialize() ?: JSUndefined