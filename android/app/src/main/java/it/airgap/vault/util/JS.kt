package it.airgap.vault.util

import android.webkit.JavascriptInterface
import kotlinx.coroutines.CompletableDeferred
import java.lang.System.currentTimeMillis
import java.util.*

@Suppress("PrivatePropertyName")
val JSUndefined: Any by lazy {
    object : Any() {
        override fun equals(other: Any?): Boolean = other == this || other?.equals(null) ?: true
        override fun hashCode(): Int = Objects.hashCode(null)
        override fun toString(): String = "it.airgap.vault.__UNDEFINED__"
    }
}

class JSAsyncResult(override val name: String = "$DEFAULT_NAME\$${currentTimeMillis()}") : Named {
    private val completableDeferred: CompletableDeferred<Result<String>> = CompletableDeferred()

    suspend fun await(): Result<String> = runCatching {
        completableDeferred.await().getOrThrow()
    }

    @JavascriptInterface
    fun completeFromJS(value: String) {
        completableDeferred.complete(Result.success(value))
    }

    @JavascriptInterface
    fun throwFromJS(error: String) {
        completableDeferred.complete(Result.failure(JSException(error)))
    }

    override fun toString(): String = name

    companion object {
        const val DEFAULT_NAME = "jsAsyncResult"
    }
}

class JSException(message: String) : Exception(message)