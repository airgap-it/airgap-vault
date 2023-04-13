package it.airgap.vault.util

import android.annotation.SuppressLint
import android.webkit.WebView

@SuppressLint("JavascriptInterface")
fun WebView.addJavascriptInterface(javascriptInterface: Named) {
    addJavascriptInterface(javascriptInterface, javascriptInterface.name)
}

fun WebView.removeJavascriptInterface(javascriptInterface: Named) {
    removeJavascriptInterface(javascriptInterface.name)
}

fun WebView.evaluateJavascript(script: String) {
    evaluateJavascript(script, null)
}
