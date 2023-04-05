package it.airgap.vault.plugin.isolatedmodules

import android.content.Context
import android.os.Build
import com.getcapacitor.JSObject
import it.airgap.vault.plugin.isolatedmodules.js.JSModule
import it.airgap.vault.plugin.isolatedmodules.js.environment.JSEnvironment
import it.airgap.vault.util.Directory
import it.airgap.vault.util.getDirectory
import it.airgap.vault.util.readBytes
import java.io.File
import java.nio.file.Files
import java.nio.file.attribute.BasicFileAttributes

interface StaticSourcesExplorer {
    fun readJavaScriptEngineUtils(): ByteArray
    fun readIsolatedModulesScript(): ByteArray
}

interface DynamicSourcesExplorer {
    fun removeModules(identifiers: List<String>)
    fun removeAllModules()

    fun getInstalledTimestamp(identifier: String): String
}

interface SourcesExplorer<in M : JSModule> {
    fun listModules(): List<String>

    fun readModuleSources(module: M): Sequence<ByteArray>
    fun readModuleManifest(module: String): ByteArray
}

private const val MANIFEST_FILENAME = "manifest.json"

private typealias JSModuleConstructor<T> = (identifier: String, namespace: String?, preferredEnvironment: JSEnvironment.Type, paths: List<String>) -> T

class FileExplorer private constructor(
    private val context: Context,
    private val assetsExplorer: AssetsExplorer,
    private val filesExplorer: FilesExplorer,
) : StaticSourcesExplorer by assetsExplorer {
    constructor(context: Context) : this(context, AssetsExplorer(context), FilesExplorer(context))

    fun loadAssetModules(): List<JSModule.Asset> = loadModules(assetsExplorer, JSModule.Asset.constructor)

    fun loadInstalledModules(): List<JSModule.Installed> = loadModules(filesExplorer, JSModule.Installed.constructor)

    fun loadInstalledModule(identifier: String): JSModule.Installed {
        val manifest = JSObject(filesExplorer.readModuleManifest(identifier).decodeToString())

        return loadModule(identifier, manifest, JSModule.Installed.constructor)
    }

    fun loadPreviewModule(path: String, directory: Directory): JSModule.Preview {
        val moduleDir = File(context.getDirectory(directory), path)
        val manifest = JSObject(File(moduleDir, MANIFEST_FILENAME).readBytes().decodeToString())

        return loadModule(moduleDir.name, manifest, JSModule.Preview.constructor(moduleDir))
    }

    fun removeInstalledModules(identifiers: List<String>) {
        filesExplorer.removeModules(identifiers)
    }

    fun removeAllInstalledModules() {
        filesExplorer.removeAllModules()
    }

    fun readModuleSources(module: JSModule): Sequence<ByteArray> =
        when (module) {
            is JSModule.Asset -> assetsExplorer.readModuleSources(module)
            is JSModule.Installed -> filesExplorer.readModuleSources(module)
            is JSModule.Preview -> module.sources.asSequence().map { File(module.path, it).readBytes() }
        }

    fun readModuleManifest(module: JSModule): ByteArray =
        when (module) {
            is JSModule.Asset -> assetsExplorer.readModuleManifest(module.identifier)
            is JSModule.Installed -> filesExplorer.readModuleManifest(module.identifier)
            is JSModule.Preview -> File(module.path, MANIFEST_FILENAME).readBytes()
        }

    private val JSModule.Asset.Companion.constructor: JSModuleConstructor<JSModule.Asset>
        get() = JSModule::Asset

    private val JSModule.Installed.Companion.constructor: JSModuleConstructor<JSModule.Installed>
        get() = { identifier, namespace, preferredEnvironment, paths ->
            JSModule.Installed(
                identifier,
                namespace,
                preferredEnvironment,
                paths,
                filesExplorer.getInstalledTimestamp(identifier)
            )
        }

    private fun JSModule.Preview.Companion.constructor(moduleDir: File): JSModuleConstructor<JSModule.Preview> = { identifier, namespace, preferredEnvironment, paths ->
            JSModule.Preview(
                identifier,
                namespace,
                preferredEnvironment,
                paths,
                moduleDir.absolutePath
            )
        }

    private fun <T : JSModule> loadModules(
        explorer: SourcesExplorer<T>,
        constructor: JSModuleConstructor<T>,
    ): List<T> = explorer.listModules().map { module ->
        val manifest = JSObject(explorer.readModuleManifest(module).decodeToString())
        loadModule(module, manifest, constructor)
    }

    private fun <T : JSModule> loadModule(
        identifier: String,
        manifest: JSObject,
        constructor: JSModuleConstructor<T>,
    ): T {
        val namespace = manifest.getJSObject("src")?.getString("namespace")
        val preferredEnvironment = manifest.getJSObject("jsenv")?.getString("android")?.let { JSEnvironment.Type.fromString(it) } ?: JSEnvironment.Type.JavaScriptEngine
        val sources = buildList {
            val include = manifest.getJSONArray("include")
            for (i in 0 until include.length()) {
                val source = include.getString(i).takeIf { it.endsWith(".js") } ?: continue
                add(source.trimStart('/'))
            }
        }

        return constructor(identifier, namespace, preferredEnvironment, sources)
    }
}

private class AssetsExplorer(private val context: Context) : StaticSourcesExplorer, SourcesExplorer<JSModule.Asset>  {
    override fun readJavaScriptEngineUtils(): ByteArray = context.assets.readBytes(JAVA_SCRIPT_ENGINE_UTILS)
    override fun readIsolatedModulesScript(): ByteArray = context.assets.readBytes(SCRIPT)

    override fun listModules(): List<String> = context.assets.list(MODULES_DIR)?.toList() ?: emptyList()

    override fun readModuleSources(module: JSModule.Asset): Sequence<ByteArray> =
        module.sources.asSequence().map { context.assets.readBytes(modulePath(module.identifier, it))}
    override fun readModuleManifest(module: String): ByteArray = context.assets.readBytes(modulePath(module, MANIFEST_FILENAME))

    private fun modulePath(module: String, path: String): String =
        "${MODULES_DIR}/${module.trimStart('/')}/${path.trimStart('/')}"

    companion object {
        private const val SCRIPT = "public/assets/native/isolated_modules/isolated-modules.script.js"
        private const val JAVA_SCRIPT_ENGINE_UTILS = "public/assets/native/isolated_modules/isolated-modules.js-engine-android.js"

        private const val MODULES_DIR = "public/assets/protocol_modules"
    }
}

private class FilesExplorer(private val context: Context) : DynamicSourcesExplorer, SourcesExplorer<JSModule.Installed>  {
    private val modulesDir: File
        get() = File(context.filesDir, MODULES_DIR)

    override fun removeModules(identifiers: List<String>) {
        identifiers.forEach {
            File(modulesDir, it).deleteRecursively()
        }
    }

    override fun removeAllModules() {
        modulesDir.deleteRecursively()
    }

    override fun getInstalledTimestamp(identifier: String): String {
        val file = File(modulesDir, identifier)

        val timestamp = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val attributes = Files.readAttributes(file.toPath(), BasicFileAttributes::class.java)
            attributes.creationTime().toMillis()
        } else file.lastModified()

        return timestamp.toString()
    }

    override fun listModules(): List<String> = modulesDir.list()?.toList() ?: emptyList()

    override fun readModuleSources(module: JSModule.Installed): Sequence<ByteArray> =
        module.sources.asSequence().map { File(modulesDir, modulePath(module.identifier, it)).readBytes() }
    override fun readModuleManifest(module: String): ByteArray = File(modulesDir, modulePath(module, MANIFEST_FILENAME)).readBytes()

    private fun modulePath(module: String, path: String): String =
        "${module.trimStart('/')}/${path.trimStart('/')}"

    companion object {
        private const val MODULES_DIR = "protocol_modules"
    }
}