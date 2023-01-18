package it.airgap.vault.plugin.zip

import android.net.Uri
import android.os.Environment
import androidx.lifecycle.lifecycleScope
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import it.airgap.vault.util.assertReceived
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.io.File
import java.io.FileInputStream
import java.io.FileOutputStream
import java.io.IOException
import java.io.InputStream
import java.util.zip.ZipEntry
import java.util.zip.ZipInputStream

@CapacitorPlugin
class Zip : Plugin() {

    @PluginMethod
    fun unzip(call: PluginCall) {
        with(call) {
            assertReceived(Param.FROM, Param.TO)

            activity.lifecycleScope.launch {
                try {
                    unzip(from, directory, to, toDirectory)
                    call.resolve()
                } catch (e: Exception) {
                    reject("Unzip failed", e)
                }
            }
        }
    }

    @Throws(IOException::class)
    private suspend fun unzip(from: String, directory: String?, to: String, toDirectory: String?) {
        val fromStream = getInputStream(from, directory) ?: throw IOException("Failed to create `to` InputStream")
        val outFile = getFile(to, toDirectory)

        ZipInputStream(fromStream).unzip(outFile)
    }

    private suspend fun ZipInputStream.unzip(destination: File) {
        use {
            while (true) {
                val zipEntry = nextEntry ?: break
                it.unzip(zipEntry, destination)
                withContext(Dispatchers.IO) {
                    closeEntry()
                }
            }
        }
    }

    @Throws(IOException::class)
    private suspend fun ZipInputStream.unzip(entry: ZipEntry, destination: File) {
        val file = File(destination, entry.name).takeIf { shouldCopy(it) } ?: return

        if (entry.isDirectory) {
            if (!file.isDirectory && !file.mkdirs()) throw IOException("Failed to create directory ${file.path}")
            return
        }

        withContext(Dispatchers.IO) {
            FileOutputStream(file).use { this@unzip.copyTo(it) }
        }
    }

    private fun shouldCopy(file: File): Boolean {
        val isIgnored = ignoredFiles.contains(file.name)

        return !isIgnored && file.parentFile?.let { shouldCopy(it) } ?: true
    }

    @Throws(IOException::class)
    private fun getInputStream(path: String, directory: String?): InputStream? =
        processFilePath(path, directory, ::FileInputStream, context.contentResolver::openInputStream)

    @Throws(IOException::class)
    private fun getFile(path: String, directory: String?): File =
        processFilePath(path, directory, { it })

    @Throws(IOException::class)
    private fun <T> processFilePath(
        path: String,
        directory: String?,
        processFile: (File) -> T,
        processContent: ((Uri) -> T)? = null,
    ): T {
        if (directory == null) {
            val uri = Uri.parse(path)
            if (uri.scheme == "content") {
                return processContent?.invoke(uri) ?: throw IOException("`content` URI not supported")
            } else if (uri.path != null) {
                return processFile(File(uri.path!!))
            }
        }

        val androidDirectory = getDirectory(directory) ?: throw IOException("Directory not found")

        return processFile(File(androidDirectory, path))
    }

    private fun getDirectory(directory: String?): File? =
        when (directory) {
            Directory.DOCUMENTS -> Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOCUMENTS)
            Directory.DATA, Directory.LIBRARY -> context.filesDir
            Directory.CACHE -> context.cacheDir
            Directory.EXTERNAL -> context.getExternalFilesDir(null)
            Directory.EXTERNAL_STORAGE -> Environment.getExternalStorageDirectory()
            else -> null
        }

    private val PluginCall.from: String
        get() = getString(Param.FROM)!!

    private val PluginCall.to: String
        get() = getString(Param.TO)!!

    private val PluginCall.directory: String?
        get() = getString(Param.DIRECTORY)

    private val PluginCall.toDirectory: String?
        get() = getString(Param.TO_DIRECTORY)

    private object Param {
        const val FROM = "from"
        const val TO = "to"
        const val DIRECTORY = "directory"
        const val TO_DIRECTORY = "toDirectory"
    }

    private object Directory {
        const val DOCUMENTS = "DOCUMENTS"
        const val DATA = "DATA"
        const val LIBRARY = "LIBRARY"
        const val CACHE = "CACHE"
        const val EXTERNAL = "EXTERNAL"
        const val EXTERNAL_STORAGE = "EXTERNAL_STORAGE"
    }

    private companion object {
        val ignoredFiles = setOf(
            "__MACOSX",
            ".DS_Store"
        )
    }
}