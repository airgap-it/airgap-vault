package it.airgap.vault.util

private const val HEX_PREFIX = "0x"
fun String.isHex(): Boolean = matches(Regex("^($HEX_PREFIX)?([0-9a-fA-F]{2})+$"))

fun String.asByteArray(): ByteArray =
        if (isHex()) removePrefix(HEX_PREFIX).chunked(2).map { it.toInt(16).toByte() }.toByteArray() else toByteArray()

fun ByteArray.asHexString(): String = joinToString(separator = "") { "%02x".format(it) }