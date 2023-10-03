package it.airgap.vault.plugin.isolatedmodules.js.environment

import android.annotation.SuppressLint
import android.content.Context
import android.os.Build
import androidx.annotation.RequiresApi
import androidx.javascriptengine.IsolateStartupParameters
import androidx.javascriptengine.JavaScriptIsolate
import androidx.javascriptengine.JavaScriptSandbox
import com.getcapacitor.JSObject
import it.airgap.vault.plugin.isolatedmodules.FileExplorer
import it.airgap.vault.plugin.isolatedmodules.js.*
import it.airgap.vault.util.JSException
import kotlinx.coroutines.Deferred
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.awaitAll
import kotlinx.coroutines.guava.asDeferred
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.coroutines.withContext

@RequiresApi(Build.VERSION_CODES.O)
class JavaScriptEngineEnvironment(
    private val context: Context,
    private val fileExplorer: FileExplorer,
) : JSEnvironment {
    private val sandbox: Deferred<JavaScriptSandbox> by lazy { JavaScriptSandbox.createConnectedInstanceAsync(context).asDeferred() }

    private val isolatedMutex: Mutex = Mutex()
    private val isolates: MutableMap<String, JavaScriptIsolateRegistry> = mutableMapOf()

    override suspend fun isSupported(): Boolean =
        JavaScriptSandbox.isSupported() && sandbox.await().let {
            it.isFeatureSupported(JavaScriptSandbox.JS_FEATURE_PROVIDE_CONSUME_ARRAY_BUFFER)
                    && it.isFeatureSupported(JavaScriptSandbox.JS_FEATURE_PROMISE_RETURN)
        }

    @Throws(JSException::class)
    override suspend fun run(module: JSModule, action: JSModuleAction, ref: String?): JSObject = withContext(Dispatchers.Default) {
        useIsolatedModule(module, ref) { jsIsolate ->
            val namespace = module.namespace?.let { "global.$it" } ?: "global"

            val script = """
                new Promise((resolve, reject) => {
                    execute(
                        $namespace,
                        '${module.identifier}',
                        ${action.toJson()},
                        function (result) {
                            resolve(JSON.stringify(result));
                        },
                        function (error) {
                            reject(JSON.stringify({ error }));
                        }
                    );
                })
            """.trimIndent()

            val result = jsIsolate.evaluateJavaScriptAsync(script).asDeferred().await()
            val jsObject = JSObject(result)
            jsObject.getString("error")?.let { error -> throw JSException(error) }

            jsObject
        }
    }

    override suspend fun reset(runRef: String) {
        isolatedMutex.withLock {
            isolates.remove(runRef)?.reset()
        }
    }

    override suspend fun destroy() {
        isolatedMutex.withLock {
            isolates.apply {
                values.forEach { it.reset() }
                clear()
            }
        }
        sandbox.await().close()
    }

    private suspend inline fun <R> useIsolatedModule(module: JSModule, runRef: String?, block: (JavaScriptIsolate) -> R): R {
        val createIsolate: suspend () -> JavaScriptIsolate = {
            sandbox.await().createIsolate(IsolateStartupParameters()).also {
                listOf(
                    it.evaluateJavaScriptAsync(fileExplorer.readJavaScriptEngineUtils().decodeToString()).asDeferred(),
                    it.evaluateJavaScriptAsync(fileExplorer.readIsolatedModulesScript().decodeToString()).asDeferred(),
                ).awaitAll()
                it.loadModule(module)
            }
        }

        val jsIsolate = isolatedMutex.withLock {
            if (runRef != null) isolates.getOrPut(runRef, module) { createIsolate() } else createIsolate()
        }

        return block(jsIsolate).also {
            if (runRef == null) jsIsolate.close()
        }
    }

    @SuppressLint("RequiresFeature" /* checked in JavaScriptEngineEnvironment#isSupported */)
    private suspend fun JavaScriptIsolate.loadModule(module: JSModule) {
        val sources = fileExplorer.readModuleSources(module)
        sources.forEachIndexed { idx, source ->
            val scriptId = "${module.identifier}-$idx-script"
            provideNamedData(scriptId, source)
            evaluateJavaScriptAsync("""
                android.consumeNamedDataAsArrayBuffer('${scriptId}').then((value) => {
                    var string = utf8ArrayToString(new Uint8Array(value));
                    eval(string);
                });
            """.trimIndent()).asDeferred().await()
        }
    }

    private suspend inline fun MutableMap<String, JavaScriptIsolateRegistry>.getOrPut(
        runRef: String,
        module: JSModule,
        defaultValue: () -> JavaScriptIsolate
    ): JavaScriptIsolate = getOrPut(runRef) { JavaScriptIsolateRegistry() }.getOrPut(module) { defaultValue() }

    private class JavaScriptIsolateRegistry : JSEnvironment.SandboxRegistry<JavaScriptIsolate>() {
        override suspend fun JavaScriptIsolate.reset() {
            close()
        }
    }
}