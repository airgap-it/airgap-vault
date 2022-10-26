package it.airgap.vault.util

import android.webkit.JavascriptInterface
import com.getcapacitor.JSObject
import kotlinx.coroutines.CompletableDeferred
import java.util.*

@Suppress("PrivatePropertyName")
val JSUndefined: Any by lazy {
    object : Any() {
        override fun equals(other: Any?): Boolean = other == this || other?.equals(null) ?: true
        override fun hashCode(): Int = Objects.hashCode(null)
        override fun toString(): String = "undefined"
    }
}

class JSCompletableDeferred(val name: String) : CompletableDeferred<Result<JSObject>> by CompletableDeferred() {
    @JavascriptInterface
    fun completeFromJS(value: String) {
        complete(Result.success(JSObject(value)))
    }

    @JavascriptInterface
    fun throwFromJS(error: String) {
        complete(Result.failure(JSException(error)))
    }
}

class JSException(message: String) : Exception(message)