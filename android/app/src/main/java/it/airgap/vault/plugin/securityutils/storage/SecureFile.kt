package it.airgap.vault.plugin.securityutils.storage

import java.io.File
import java.io.FileInputStream
import java.io.FileOutputStream

class SecureFile(parent: File, name: String, private val immediatelySave: Boolean = true) {

    constructor(parent: File, hashedKey: ByteArray, immediatelySave: Boolean = true) : this(parent, hashedKey.toHexString(), immediatelySave)

    private val source: File = File(parent, name)
    private val temp: File by lazy {
        File(parent, "$name\$temp").also {
            if (source.exists()) {
                source.copyTo(it, overwrite = true)
            } else if (it.exists()) {
                it.delete()
            }
        }
    }

    private val file: File
        get() = if (immediatelySave) source else temp

    val exists: Boolean
        get() = source.exists()

    fun input(block: (FileInputStream) -> Unit) {
        file.inputStream().use(block)
    }

    fun output(block: (FileOutputStream) -> Unit) {
        file.outputStream().use(block)
    }

    fun readToBuffer(buffer: ByteArray): Int {
        var readByteCount = 0
        var totalByteCount = 0

        input {
            while (readByteCount != -1 && buffer.size > totalByteCount) {
                readByteCount = it.read(buffer, totalByteCount, buffer.size - totalByteCount)
                totalByteCount += readByteCount
            }
        }

        return totalByteCount
    }

    fun save() {
        temp.apply {
            if (exists()) {
                copyTo(source, overwrite = true)
            }
            delete()
        }
    }

    fun delete(): Boolean {
        val sourceDelete = if (source.exists()) source.delete() else true
        val tempDelete = if (temp.exists()) temp.delete() else true

        return sourceDelete && tempDelete
    }

    companion object {
        private fun ByteArray.toHexString(): String =
                joinToString(separator = "") { String.format("%02x", it) }
    }
}