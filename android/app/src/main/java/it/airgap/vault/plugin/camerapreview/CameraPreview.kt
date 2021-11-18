package it.airgap.vault.plugin.camerapreview

import android.Manifest
import android.graphics.Color
import android.graphics.Point
import android.os.Build
import android.util.DisplayMetrics
import android.util.TypedValue
import android.view.View
import android.view.ViewGroup
import android.view.ViewParent
import android.view.WindowInsets
import android.widget.FrameLayout
import com.getcapacitor.PermissionState
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import com.getcapacitor.annotation.Permission
import com.getcapacitor.annotation.PermissionCallback
import it.airgap.vault.plugin.camerapreview.CameraFragment.CameraPreviewListener
import it.airgap.vault.util.releaseCallIfKept
import it.airgap.vault.util.resolveWithData

/**
 * Forked from: https://github.com/arielhernandezmusa/capacitor-camera-preview
 */

@CapacitorPlugin(
    permissions = [
        Permission(strings = [Manifest.permission.CAMERA], alias = CameraPreview.PERMISSION_ALIAS_CAMERA)
    ]
)
class CameraPreview : Plugin(), CameraPreviewListener {
    private var lastCallbackId: String? = null
    private var lastCall: PluginCall?
        get() = lastCallbackId?.let { bridge.getSavedCall(it) }
        set(value) {
            value?.let {
                bridge.saveCall(it)
                lastCallbackId = it.callbackId
            }
        }

    private var fragment: CameraFragment? = null
    private val containerViewId = 20

    private val previewContainerView: View?
        get() = activity.findViewById(containerViewId)

    @PluginMethod
    fun start(call: PluginCall) {
        lastCall = call
        if (getPermissionState(PERMISSION_ALIAS_CAMERA) == PermissionState.GRANTED) {
            startCamera(call)
        } else {
            requestPermissionForAlias(PERMISSION_ALIAS_CAMERA, call, "cameraPermissionCallback")
        }
    }

    @PluginMethod
    fun flip(call: PluginCall) {
        fragment?.switchCamera() ?: call.reject("camera has not started")
    }

    @PluginMethod
    fun capture(call: PluginCall) {
        lastCall = call
        val width = call.getInt(Param.WIDTH) ?: 0
        val height = call.getInt(Param.HEIGHT) ?: 0
        val quality = call.getInt(Param.QUALITY) ?: 85

        fragment?.takePicture(width, height, quality) ?: call.reject("camera has not started")
    }

    @PluginMethod
    fun stop(call: PluginCall) {
        activity.runOnUiThread {
            if (previewContainerView != null) {
                hideCameraPreview()
                fragment = null
                call.resolve()
            } else {
                call.reject("camera already stopped")
            }
        }
    }

    @PermissionCallback
    fun cameraPermissionCallback(call: PluginCall) {
        if (getPermissionState(PERMISSION_ALIAS_CAMERA) == PermissionState.GRANTED) {
            startCamera(bridge.getSavedCall(null))
        } else {
            call.reject("permissions not granted")
        }
    }

    private fun startCamera(call: PluginCall) {
        val defaultCamera = call.getString(Param.CAMERA, Param.CAMERA_DEFAULT_VALUE)
        val disableExifHeaderStripping = call.getBoolean(Param.DISABLE_EXIF_HEADER_STRIPPING) ?: Param.DISABLE_EXIF_HEADER_STRIPPING_DEFAULT_VALUE

        fragment = CameraFragment().apply {
            setEventListener(this@CameraPreview)
            setParams(defaultCamera, disableExifHeaderStripping)
        }

        activity.runOnUiThread {
            val size = Point().also {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                    val metrics = activity.windowManager.currentWindowMetrics
                    val windowInsets = metrics.windowInsets
                    val insets = windowInsets.getInsetsIgnoringVisibility(WindowInsets.Type.navigationBars() or WindowInsets.Type.displayCutout())
                    val insetsWidth = insets.right + insets.left
                    val insetsHeight = insets.top + insets.bottom

                    it.x = metrics.bounds.width() - insetsWidth
                    it.y = metrics.bounds.height() - insetsHeight
                } else {
                    activity.windowManager.defaultDisplay.getSize(it)
                }
            }

            val x = call.getInt(Param.X) ?: Param.X_DEFAULT_VALUE
            val y = call.getInt(Param.Y) ?: Param.Y_DEFAULT_VALUE

            val width = call.getInt(Param.WIDTH) ?: size.x
            val height = call.getInt(Param.HEIGHT) ?: size.y

            setPreviewRect(x, y, width, height, activity.resources.displayMetrics)

            if (previewContainerView == null) {
                showCameraPreview()
                call.resolve()
            } else {
                call.reject("camera already started")
            }
        }
    }

    override fun onPictureTaken(originalPicture: String) {
        lastCall?.run {
            resolveWithData(Key.VALUE to originalPicture)
            releaseCallIfKept(callbackId)
        }
    }

    override fun onPictureTakenError(message: String) {
        lastCall?.run {
            reject(message)
            releaseCallIfKept(callbackId)
        }
    }

    override fun onSnapshotTaken(originalPicture: String) {
        lastCall?.run {
            resolveWithData(Key.VALUE to originalPicture)
            releaseCallIfKept(callbackId)
        }
    }

    override fun onSnapshotTakenError(message: String) {
        lastCall?.run {
            reject(message)
            releaseCallIfKept(callbackId)
        }
    }

    override fun onFocusSet(pointX: Int, pointY: Int) = Unit
    override fun onFocusSetError(message: String) = Unit
    override fun onBackButton() = Unit

    override fun onCameraStarted() {
        println("camera started")
        lastCall?.run {
            resolve()
            releaseCallIfKept(callbackId)
        }
    }

    private fun setPreviewRect(x: Int, y: Int, width: Int, height: Int, metrics: DisplayMetrics) { // offset
        val computedX = computeDimension(x, metrics)
        val computedY = computeDimension(y, metrics)

        val computedWidth = computeDimension(width, metrics)
        val computedHeight = computeDimension(height, metrics)

        fragment?.setRect(computedX, computedY, computedWidth, computedHeight)
    }

    private fun computeDimension(dimension: Int, metrics: DisplayMetrics): Int =
        TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_PX, dimension.toFloat(), metrics).toInt()

    private fun showCameraPreview() {
        val containerView = FrameLayout(activity.applicationContext).apply { id = containerViewId }

        val containerLayoutParams = FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT
        )

        with (bridge.webView) {
            parent.addView(containerView, containerLayoutParams)
            setBackgroundColor(Color.TRANSPARENT)
            bringToFront()

            activity.supportFragmentManager
                    .beginTransaction()
                    .replace(containerViewId, fragment!!)
                    .commit()
        }
    }

    private fun hideCameraPreview() {
        with (bridge.webView) {
            parent.removeView(previewContainerView)
            setBackgroundColor(Color.WHITE)
            bringToFront()

            activity.supportFragmentManager
                    .beginTransaction()
                    .remove(fragment!!)
                    .commit()
        }
    }

    private fun ViewParent.addView(child: View?, params: ViewGroup.LayoutParams) {
        if (child != null) {
            (this as? ViewGroup)?.addView(child, params)
        }
    }

    private fun ViewParent.removeView(view: View?) {
        if (view != null) {
            (this as? ViewGroup)?.removeView(view)
        }
    }

    private object Param {
        const val X = "x"
        const val Y = "y"
        const val X_DEFAULT_VALUE = 0
        const val Y_DEFAULT_VALUE = 0

        const val WIDTH = "width"
        const val HEIGHT = "height"

        const val QUALITY = "quality"

        const val CAMERA = "camera"
        const val CAMERA_DEFAULT_VALUE = "back"

        const val DISABLE_EXIF_HEADER_STRIPPING = "disableExifHeaderStripping"
        const val DISABLE_EXIF_HEADER_STRIPPING_DEFAULT_VALUE = false
    }

    private object Key {
        const val VALUE = "value"
    }

    companion object {
        const val PERMISSION_ALIAS_CAMERA = "camera"
    }
}