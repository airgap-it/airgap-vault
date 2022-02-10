package it.airgap.vault.util

import android.view.View
import android.view.ViewGroup
import android.view.ViewParent

fun ViewParent.addView(child: View?, params: ViewGroup.LayoutParams) {
    if (child != null) {
        (this as? ViewGroup)?.addView(child, params)
    }
}

fun ViewParent.removeView(view: View?) {
    if (view != null) {
        (this as? ViewGroup)?.removeView(view)
    }
}