package it.airgap.vault.util

import android.webkit.WebView


fun WebView.addJavascriptInterface(jsCompletableDeferred: JSCompletableDeferred) {
    addJavascriptInterface(jsCompletableDeferred, jsCompletableDeferred.name)
}