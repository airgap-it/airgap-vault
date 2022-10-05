package it.airgap.vault.util

fun String.minify(): String = replace("\n", "").replace(" ", "")