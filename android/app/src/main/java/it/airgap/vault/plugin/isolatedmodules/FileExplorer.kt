package it.airgap.vault.plugin.isolatedmodules

import android.content.Context
import android.os.Build
import com.getcapacitor.JSObject
import it.airgap.vault.plugin.isolatedmodules.js.JSModule
import it.airgap.vault.plugin.isolatedmodules.js.environment.JSEnvironment
import it.airgap.vault.util.Directory
import it.airgap.vault.util.asHexString
import it.airgap.vault.util.getDirectory
import it.airgap.vault.util.readBytes
import java.io.File
import java.nio.file.Files
import java.nio.file.attribute.BasicFileAttributes

interface StaticSourcesExplorer {
    fun readJavaScriptEngineUtils(): ByteArray
    fun readIsolatedModulesScript(): ByteArray
}

interface DynamicSourcesExplorer<in M : JSModule> {
    fun removeModules(modules: List<M>)
    fun removeAllModules()

    fun getInstalledTimestamp(identifier: String): String
}

interface SourcesExplorer<in M : JSModule> {
    fun listModules(): List<String>

    fun readModuleFiles(module: M, predicate: ((String) -> Boolean) = { true }): Sequence<ByteArray>
    fun readModuleManifest(module: String): ByteArray
}

private const val MANIFEST_FILENAME = "manifest.json"
private const val SIGNATURE_FILENAME = "module.sig"

private typealias JSModuleConstructor<T> = (
    identifier: String,
    namespace: String?,
    preferredEnvironment: JSEnvironment.Type,
    files: List<String>,
    manifest: JSObject
) -> T

class FileExplorer private constructor(
    private val context: Context,
    private val assetsExplorer: AssetsExplorer,
    private val filesExplorer: FilesExplorer,
) : StaticSourcesExplorer by assetsExplorer {
    constructor(context: Context) : this(context, AssetsExplorer(context), FilesExplorer(context))

    fun loadAssetModules(): List<JSModule.Asset> = loadModules(assetsExplorer, JSModule.Asset.constructor)

    fun loadInstalledModules(): List<JSModule.Installed> = loadModules(filesExplorer, JSModule.Installed.constructor)

    fun loadAssetModule(identifier: String): JSModule.Asset {
        val manifest = JSObject(assetsExplorer.readModuleManifest(identifier).decodeToString())

        return loadModule(identifier, manifest, JSModule.Asset.constructor)
    }

    fun loadInstalledModule(identifier: String): JSModule.Installed {
        val manifest = JSObject(filesExplorer.readModuleManifest(identifier).decodeToString())

        return loadModule(identifier, manifest, JSModule.Installed.constructor)
    }

    fun loadPreviewModule(path: String, directory: Directory): JSModule.Preview {
        val moduleDir = File(context.getDirectory(directory), path)
        val manifest = JSObject(File(moduleDir, MANIFEST_FILENAME).readBytes().decodeToString())
        val signature = File(moduleDir, SIGNATURE_FILENAME).readBytes().asHexString()

        return loadModule(moduleDir.name, manifest, JSModule.Preview.constructor(moduleDir, signature))
    }

    fun removeInstalledModules(identifiers: List<String>) {
        filesExplorer.removeModules(identifiers.map { loadInstalledModule(it) })
    }

    fun removeAllInstalledModules() {
        filesExplorer.removeAllModules()
    }

    fun readModuleFiles(module: JSModule, predicate: (String) -> Boolean = { true }): Sequence<ByteArray> =
        when (module) {
            is JSModule.Asset -> assetsExplorer.readModuleFiles(module, predicate)
            is JSModule.Installed -> filesExplorer.readModuleFiles(module, predicate)
            is JSModule.Preview -> module.files.asSequence().filter(predicate).map { File(module.path, it).readBytes() }
        }

    fun readModuleSources(module: JSModule): Sequence<ByteArray> =
        readModuleFiles(module) { it.endsWith(".js") }

    fun readModuleManifest(module: JSModule): ByteArray =
        when (module) {
            is JSModule.Asset -> assetsExplorer.readModuleManifest(module.identifier)
            is JSModule.Installed -> filesExplorer.readModuleManifest(module.identifier)
            is JSModule.Preview -> File(module.path, MANIFEST_FILENAME).readBytes()
        }

    private val JSModule.Asset.Companion.constructor: JSModuleConstructor<JSModule.Asset>
        get() = { identifier, namespace, preferredEnvironment, files, _ ->
            JSModule.Asset(identifier, namespace, preferredEnvironment, files)
        }

    private val JSModule.Installed.Companion.constructor: JSModuleConstructor<JSModule.Installed>
        get() = { identifier, namespace, preferredEnvironment, files, manifest ->
            val symbols = manifest
                .getJSObject("res")
                ?.getJSObject("symbol")
                ?.keys()
                ?.asSequence()
                ?.toList()

            JSModule.Installed(
                identifier,
                namespace,
                preferredEnvironment,
                files,
                symbols ?: emptyList(),
                filesExplorer.getInstalledTimestamp(identifier)
            )
        }

    private fun JSModule.Preview.Companion.constructor(moduleDir: File, signature: String): JSModuleConstructor<JSModule.Preview> = { identifier, namespace, preferredEnvironment, files, _ ->
        JSModule.Preview(
            identifier,
            namespace,
            preferredEnvironment,
            files,
            moduleDir.absolutePath,
            signature
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
        val files = buildList {
            val include = manifest.getJSONArray("include")
            for (i in 0 until include.length()) {
                add(include.getString(i).trimStart('/'))
            }
        }

        return constructor(identifier, namespace, preferredEnvironment, files, manifest)
    }
}

private class AssetsExplorer(private val context: Context) : StaticSourcesExplorer, SourcesExplorer<JSModule.Asset>  {
    override fun readJavaScriptEngineUtils(): ByteArray = context.assets.readBytes(JAVA_SCRIPT_ENGINE_UTILS)
    override fun readIsolatedModulesScript(): ByteArray = context.assets.readBytes(SCRIPT)

    override fun listModules(): List<String> = context.assets.list(MODULES_DIR)?.toList() ?: emptyList()

    override fun readModuleFiles(module: JSModule.Asset, predicate: (String) -> Boolean): Sequence<ByteArray> =
        module.files
            .asSequence()
            .filter(predicate)
            .map { context.assets.readBytes(modulePath(module.identifier, it))}
    override fun readModuleManifest(module: String): ByteArray = context.assets.readBytes(modulePath(module, MANIFEST_FILENAME))

    private fun modulePath(module: String, path: String): String =
        "${MODULES_DIR}/${module.trimStart('/')}/${path.trimStart('/')}"

    companion object {
        private const val SCRIPT = "public/assets/native/isolated_modules/isolated-modules.script.js"
        private const val JAVA_SCRIPT_ENGINE_UTILS = "public/assets/native/isolated_modules/isolated-modules.js-engine-android.js"

        private const val MODULES_DIR = "public/assets/protocol_modules"
    }
}

private class FilesExplorer(private val context: Context) : DynamicSourcesExplorer<JSModule.Installed>, SourcesExplorer<JSModule.Installed>  {
    private val modulesDir: File
        get() = File(context.filesDir, MODULES_DIR)

    private val symbolsDir: File
        get() = File(modulesDir, SYMBOLS_DIR)

    override fun removeModules(modules: List<JSModule.Installed>) {
        val symbols = symbolsDir.list()?.toSet() ?: emptySet()
        modules.forEach { module ->
            File(modulesDir, module.identifier).deleteRecursively()
            module.symbols.forEach {
                if (symbols.contains(it)) File(symbolsDir, it).delete()
                if (symbols.contains(symbolMetadata(it))) File(symbolsDir, symbolMetadata(it)).delete()
            }
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

    override fun listModules(): List<String> =
        modulesDir.list()?.toList()?.filter { it != SYMBOLS_DIR } ?: emptyList()

    override fun readModuleFiles(module: JSModule.Installed, predicate: (String) -> Boolean): Sequence<ByteArray> =
        module.files
            .asSequence()
            .filter(predicate)
            .map { File(modulesDir, modulePath(module.identifier, it)).readBytes() }
    override fun readModuleManifest(module: String): ByteArray = File(modulesDir, modulePath(module, MANIFEST_FILENAME)).readBytes()

    private fun modulePath(module: String, path: String): String =
        "${module.trimStart('/')}/${path.trimStart('/')}"

    private fun symbolMetadata(symbol: String): String = "${symbol}.metadata"

    companion object {
        private const val MODULES_DIR = "__airgap_protocol_modules__"
        private const val SYMBOLS_DIR = "__symbols__"
    }
}