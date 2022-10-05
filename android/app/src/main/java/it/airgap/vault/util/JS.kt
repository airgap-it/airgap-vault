package it.airgap.vault.util

import android.webkit.JavascriptInterface
import com.getcapacitor.JSObject
import kotlinx.coroutines.CompletableDeferred
import java.lang.System.currentTimeMillis
import java.util.*
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.ConcurrentMap

@Suppress("PrivatePropertyName")
val JSUndefined: Any by lazy {
    object : Any() {
        override fun equals(other: Any?): Boolean = other == this || other?.equals(null) ?: true
        override fun hashCode(): Int = Objects.hashCode(null)
        override fun toString(): String = "undefined"
    }
}

class JSAsyncResult(override val name: String = "$DEFAULT_NAME\$${currentTimeMillis()}") : Named {
    private val completableDeferredRegistry: ConcurrentMap<String, CompletableDeferred<Result<String>>> = ConcurrentHashMap()

    fun createId(): String = UUID.randomUUID().toString().also {
        completableDeferredRegistry[it] = CompletableDeferred()
    }

    suspend fun await(id: String): Result<String> = runCatching {
        val completableDeferred = completableDeferredRegistry[id] ?: throw IllegalStateException("JSAsyncResult: result $id not found.")

        completableDeferred.await().getOrThrow().also {
            completableDeferredRegistry.remove(id)
        }
    }

    @JavascriptInterface
    fun completeFromJS(id: String, value: String) {
        completableDeferredRegistry[id]?.complete(Result.success(value))
    }

    @JavascriptInterface
    fun throwFromJS(id: String, error: String) {
        completableDeferredRegistry[id]?.complete(Result.failure(JSException(error)))
    }

    override fun toString(): String = name

    companion object {
        const val DEFAULT_NAME = "jsAsyncResult"
    }
}

class JSException(message: String) : Exception(message)