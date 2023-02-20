package it.airgap.vault.util

import android.content.Context
import android.os.Environment
import java.io.File

enum class Directory(val value: String) {
    Documents("DOCUMENTS"),
    Data("DATA"),
    Library("LIBRARY"),
    Cache("CACHE"),
    External("EXTERNAL"),
    ExternalStorage("EXTERNAL_STORAGE");

    companion object {
        fun fromString(value: String): Directory? = values().find { it.value == value }
    }
}

fun Context.getDirectory(directory: Directory?): File? =
    when (directory) {
        Directory.Documents -> Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOCUMENTS)
        Directory.Data, Directory.Library -> filesDir
        Directory.Cache -> cacheDir
        Directory.External -> getExternalFilesDir(null)
        Directory.ExternalStorage -> Environment.getExternalStorageDirectory()
        else -> null
    }