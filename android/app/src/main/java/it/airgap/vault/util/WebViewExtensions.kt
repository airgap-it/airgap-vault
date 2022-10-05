package it.airgap.vault.util

import android.webkit.WebView

fun WebView.addJavascriptInterface(javascriptInterface: Named) {
    addJavascriptInterface(javascriptInterface, javascriptInterface.name)
}

fun WebView.removeJavascriptInterface(javascriptInterface: Named) {
    removeJavascriptInterface(javascriptInterface.name)
}

fun WebView.evaluateJavascript(script: String) {
    evaluateJavascript(script, null)
}