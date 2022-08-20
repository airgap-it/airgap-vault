package it.airgap.vault.plugin.securityutils

import android.app.KeyguardManager
import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.content.pm.ApplicationInfo
import android.provider.Settings
import android.view.WindowManager
import android.widget.FrameLayout
import androidx.biometric.BiometricManager
import androidx.biometric.BiometricPrompt
import androidx.fragment.app.FragmentContainerView
import androidx.fragment.app.commit
import androidx.lifecycle.lifecycleScope
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import com.scottyab.rootbeer.RootBeer
import it.airgap.vault.BuildConfig
import it.airgap.vault.R
import it.airgap.vault.plugin.PluginError
import it.airgap.vault.plugin.securityutils.authprompt.AuthPromptFragment
import it.airgap.vault.plugin.securityutils.storage.Storage
import it.airgap.vault.util.*
import kotlinx.coroutines.Deferred
import kotlinx.coroutines.launch
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import java.util.*
import kotlin.coroutines.resume
import kotlin.coroutines.suspendCoroutine

@CapacitorPlugin(requestCodes = [SecurityUtils.REQUEST_CODE_CONFIRM_DEVICE_CREDENTIALS])
class SecurityUtils : Plugin() {
    private var lastCallbackId: String? = null
    private var lastCall: PluginCall?
        get() = lastCallbackId?.let { bridge.getSavedCall(it) }
        set(value) {
            value?.let {
                bridge.saveCall(it)
                lastCallbackId = it.callbackId
            }
        }

    private val keyguardManager: KeyguardManager? by lazy {
        activity.getSystemService(Context.KEYGUARD_SERVICE) as? KeyguardManager
    }

    private val sharedPreferences: SharedPreferences by lazy {
        context.getSharedPreferences("ch.airgap.securityutils", Context.MODE_PRIVATE)
    }

    private var isAuthenticated: Boolean = false
    private var lastBackgroundDate: Date? = null
    private val authenticationMutex: Mutex = Mutex()

    private var automaticLocalAuthentication: Boolean
        get() = sharedPreferences.getBoolean(PREFERENCES_KEY_AUTOMATIC_AUTHENTICATION, false)
        set(value) { sharedPreferences.edit().putBoolean(PREFERENCES_KEY_AUTOMATIC_AUTHENTICATION, value).apply() }

    private var invalidateAfterSeconds: Int = 10

    private val needsAuthentication: Boolean
        get() {
            lastBackgroundDate?.let { isAuthenticated = !it.exceededTimeout }
            return !isAuthenticated
        }

    private var authTries: Int = 0
        @Synchronized get
        @Synchronized set

    private val isDebuggable: Boolean
        get() {
            return BuildConfig.DEBUG || (context.applicationContext.applicationInfo.flags and ApplicationInfo.FLAG_DEBUGGABLE) != 0
        }

    private val integrityAssessment: Boolean
        get() {
            return !RootBeer(context).isRootedWithoutBusyBoxCheck || isDebuggable || BuildConfig.APPIUM
        }

    private val biometricPromptInfo: BiometricPrompt.PromptInfo by lazy {
        BiometricPrompt.PromptInfo.Builder().apply {
            setTitle(context.getString(R.string.biometric_prompt_title))
            setSubtitle(context.getString(R.string.biometric_prompt_subtitle))
            setDescription(context.getString(R.string.biometric_prompt_description))
            setAllowedAuthenticators(BiometricManager.Authenticators.DEVICE_CREDENTIAL or BiometricManager.Authenticators.BIOMETRIC_WEAK)
        }.build()
    }

    /*
     * SecureStorage
     */

    @PluginMethod
    fun initStorage(call: PluginCall) {
        lastCall = call
        with (call) {
            try {
                assertReceived(Param.ALIAS, Param.IS_PARANOIA)
                if (isParanoia) {
                    setupParanoiaPassword(call)
                } else {
                    releaseCallIfKept(callbackId)
                    resolve()
                }
            } catch (e: Exception) {
                releaseCallIfKept(callbackId)
                reject(e.toString())
            }
        }
    }

    @PluginMethod
    fun isDeviceSecure(call: PluginCall) {
        val isDeviceSecure = (if (keyguardManager?.isKeyguardSecure == true) 1 else 0)
        call.resolveWithData(Key.VALUE to isDeviceSecure)
    }

    @PluginMethod
    fun secureDevice(call: PluginCall) {
        val intent = Intent(Settings.ACTION_SECURITY_SETTINGS)
        activity.startActivity(intent)

        call.resolve()
    }

    @PluginMethod
    fun getItem(call: PluginCall) {
        lastCall = call
        with (call) {
            try {
                assessIntegrity()
                assertReceived(Param.ALIAS, Param.IS_PARANOIA, Param.FILE_KEY)

                Storage(context, alias, isParanoia).readString(key, {
                    logDebug("getItem: success")
                    releaseCallIfKept(callbackId)
                    resolveWithData(Key.VALUE to it)
                }, {
                    logDebug("getItem: failure")
                    releaseCallIfKept(callbackId)
                    reject(it.toString())
                }, createAuthenticationRequestedHandler(call))
            } catch (e: Exception) {
                releaseCallIfKept(callbackId)
                reject(e.toString())
            }
        }
    }

    @PluginMethod
    fun setItem(call: PluginCall) {
        lastCall = call
        with (call) {
            try {
                assessIntegrity()
                assertReceived(Param.ALIAS, Param.IS_PARANOIA, Param.FILE_KEY, Param.VALUE)

                Storage(context, alias, isParanoia).writeString(key, value, {
                    logDebug("setItem: success")
                    releaseCallIfKept(callbackId)
                    resolve()
                }, {
                    logDebug("setItem: failure")
                    releaseCallIfKept(callbackId)
                    reject(it.toString())
                }, createAuthenticationRequestedHandler(call))
            } catch (e: Exception) {
                releaseCallIfKept(callbackId)
                reject(e.toString())
            }
        }
    }

    @PluginMethod
    fun removeAll(call: PluginCall) {
        lastCall = call
        with (call) {
            try {
                assertReceived(Param.ALIAS)

                val result = Storage.removeAll(activity, alias)
                if (result) {
                    releaseCallIfKept(callbackId)
                    resolve()
                } else {
                    releaseCallIfKept(callbackId)
                    reject("removeAll: failure")
                }
            } catch (e: Exception) {
                releaseCallIfKept(callbackId)
                reject(e.toString())
            }
        }
    }

    @PluginMethod
    fun removeItem(call: PluginCall) {
        lastCall = call
        with (call) {
            try {
                assertReceived(Param.ALIAS, Param.IS_PARANOIA, Param.FILE_KEY)

                Storage(context, alias, isParanoia).removeString(key, {
                    logDebug("delete: success")
                    releaseCallIfKept(callbackId)
                    resolve()
                }, {
                    logDebug("delete: failure")
                    releaseCallIfKept(callbackId)
                    reject(it.toString())
                })
            } catch (e: Exception) {
                releaseCallIfKept(callbackId)
                reject(e.toString())
            }
        }
    }

    @PluginMethod
    fun destroy(call: PluginCall) {
        lastCall = call
        with (call) {
            try {
                val result = Storage.destroy(activity)
                if (result) {
                    releaseCallIfKept(callbackId)
                    resolve()
                } else {
                    releaseCallIfKept(callbackId)
                    reject("destroy: failure")
                }
            } catch (e: Exception) {
                releaseCallIfKept(callbackId)
                reject(e.toString())
            }
        }
    }

    @PluginMethod
    fun setupParanoiaPassword(call: PluginCall) {
        lastCall = call
        with (call) {
            try {
                assertReceived(Param.ALIAS, Param.IS_PARANOIA)

                Storage(context, alias, isParanoia).setupParanoiaPassword({
                    logDebug("paranoia setup: success")
                    releaseCallIfKept(callbackId)
                    resolve()
                }, {
                    logDebug("paranoia setup: failure")
                    releaseCallIfKept(callbackId)
                    reject(it.toString())
                })
            } catch (e: Exception) {
                releaseCallIfKept(callbackId)
                reject(e.toString())
            }
        }
    }

    @PluginMethod
    fun setupRecoveryPassword(call: PluginCall) {
        lastCall = call
        with (call) {
            try {
                assertReceived(Param.ALIAS, Param.IS_PARANOIA, Param.FILE_KEY, Param.VALUE)

                Storage(context, alias, isParanoia).writeRecoverableString(key, value, {
                    logDebug("written recoverable: success")
                    releaseCallIfKept(callbackId)
                    resolveWithData("recoveryKey" to it)
                }, {
                    logDebug("written recoverable: failure")
                    releaseCallIfKept(callbackId)
                    reject(it.toString())
                }, createAuthenticationRequestedHandler(call))
            } catch (e: Exception) {
                releaseCallIfKept(callbackId)
                reject(e.toString())
            }
        }
    }

    /*
     * LocalAuthentication
     */

    @PluginMethod
    fun authenticate(call: PluginCall) {
        authenticateOrContinue(AuthOrigin.VAULT, call, { call.resolve() }, { call.reject("Authentication failed"); true })
    }

    @PluginMethod
    fun setInvalidationTimeout(call: PluginCall) {
        with (call) {
            assertReceived(Param.TIMEOUT)
            invalidateAfterSeconds = timeout
            resolve()
        }
    }

    @PluginMethod
    fun invalidate(call: PluginCall) {
        isAuthenticated = false
        lastBackgroundDate = null
        call.resolve()
    }

    @PluginMethod
    fun toggleAutomaticAuthentication(call: PluginCall) {
        with (call) {
            assertReceived(Param.AUTOMATIC_AUTHENTICATION)
            automaticLocalAuthentication = automaticAuthentication
            resolve()
        }
    }

    @PluginMethod
    fun setAuthenticationReason(call: PluginCall) {
        call.resolve()
    }

    /*
     * DeviceIntegrity
     */

    @PluginMethod
    fun assessDeviceIntegrity(call: PluginCall) {
        call.resolveWithData(Key.VALUE to integrityAssessment)
    }

    /*
     * Secure Screen
     */

    @PluginMethod
    fun waitForOverlayDismiss(call: PluginCall) {
        call.resolve()
    }

    @PluginMethod
    fun setWindowSecureFlag(call: PluginCall) {
        if(!BuildConfig.APPIUM){
            with (activity) {
                runOnUiThread { window.setFlags(WindowManager.LayoutParams.FLAG_SECURE, WindowManager.LayoutParams.FLAG_SECURE) }
            }
        }
        call.resolve()
    }

    @PluginMethod
    fun clearWindowSecureFlag(call: PluginCall) {
        if(!BuildConfig.APPIUM){
            with (activity) {
                runOnUiThread { window.clearFlags(WindowManager.LayoutParams.FLAG_SECURE) }
            }
        }
        call.resolve()
    }

    override fun handleOnResume() {
        super.handleOnResume()
        if (automaticLocalAuthentication) {
            authenticateOrContinueOnResume()
        }
    }

    override fun handleOnPause() {
        lastBackgroundDate = Date()
        super.handleOnPause()
    }

    private fun authenticateOrContinueOnResume() {
        val lastCallbackId = lastCall?.callbackId
        authenticateOrContinue(AuthOrigin.VAULT, lastCall, { lastCallbackId?.let { releaseCallIfKept(it) } }, { authenticateOrContinueOnResume(); false })
    }

    private suspend fun showAuthenticationScreen(onAuthenticated: (() -> Unit)? = null, onFailure: (() -> Boolean)? = null) = suspendCoroutine<Unit> { continuation ->
        val containerView = FragmentContainerView(context).apply { id = R.id.authPromptFragmentContainerView }
        val layoutParams = FrameLayout.LayoutParams(
            FrameLayout.LayoutParams.MATCH_PARENT,
            FrameLayout.LayoutParams.MATCH_PARENT,
        )

        activity.runOnUiThread {
            bridge.webView.parent.addView(containerView, layoutParams)

            val fragment = AuthPromptFragment()

            activity.supportFragmentManager.commit {
                setReorderingAllowed(true)
                replace(containerView.id, fragment)
                addToBackStack(null)
            }

            fragment.resultLiveData.observe(activity) {
                isAuthenticated = it
                lastBackgroundDate = null

                val handled = if (it) {
                    onAuthenticated?.invoke()
                    true
                } else {
                    onFailure?.invoke() ?: true
                }

                if (handled) {
                    activity.runOnUiThread {
                        activity.supportFragmentManager.commit {
                            remove(fragment)
                        }
                        bridge.webView.parent.removeView(activity.findViewById(containerView.id))
                    }
                }

                continuation.resume(Unit)
            }
        }
    }

    private fun createAuthenticationRequestedHandler(call: PluginCall): (Int, () -> Unit, () -> Unit) -> Unit =
        { attemptNo, onAuthenticated, onFailure ->
            activity.lifecycleScope.launch {
                authenticate(
                    AuthOrigin.SYSTEM,
                    attemptNo,
                    call,
                    onAuthenticated,
                    { onFailure(); true },
                )
            }
        }

    private fun authenticateOrContinue(origin: AuthOrigin, call: PluginCall? = null, onAuthenticated: (() -> Unit)? = null, onFailure: (() -> Boolean)? = null) {
        activity.lifecycleScope.launch {
            authenticationMutex.withLock {
                if (!needsAuthentication) {
                    onAuthenticated?.invoke()
                } else {
                    authenticate(
                        origin,
                        ++authTries,
                        call,
                        {
                            onAuthenticated?.invoke()
                            authTries = 0
                        },
                        onFailure
                    )
                }
            }
        }
    }

    private suspend fun authenticate(
            origin: AuthOrigin,
            attemptNo: Int,
            call: PluginCall? = null,
            onAuthenticated: (() -> Unit)? = null,
            onFailure: (() -> Boolean)? = null
    ) {
        if (call != null && attemptNo > MAX_AUTH_TRIES) {
            val error = when (origin) {
                AuthOrigin.VAULT -> PluginError.maxAuthenticationRetriesVault
                AuthOrigin.SYSTEM -> PluginError.maxAuthenticationRetriesSystem
            }
            call.reject(error.toString())
            return
        }

        showAuthenticationScreen(onAuthenticated, onFailure)
    }

    private val PluginCall.alias: String
        get() = getString(Param.ALIAS)!!

    private val PluginCall.isParanoia: Boolean
        get() = getBoolean(Param.IS_PARANOIA)!!

    private val PluginCall.key: String
        get() = getString(Param.FILE_KEY)!!

    private val PluginCall.value: String
        get() = getString(Param.VALUE)!!

    private val PluginCall.timeout: Int
        get() = getInt(Param.TIMEOUT)!!

    private val PluginCall.automaticAuthentication: Boolean
        get() = getBoolean(Param.AUTOMATIC_AUTHENTICATION)!!

    private fun PluginCall.assessIntegrity() {
        if (!integrityAssessment) {
            reject("Invalid state")
        }
    }

    private val Date.exceededTimeout: Boolean
        get() = time + (invalidateAfterSeconds * 1000L) <= Date().time

    private object Param {
        const val ALIAS = "alias"
        const val IS_PARANOIA = "isParanoia"
        const val FILE_KEY = "key"
        const val VALUE = "value"

        const val TIMEOUT = "timeout"
        const val AUTOMATIC_AUTHENTICATION = "automatic"
    }

    private object Key {
        const val VALUE = "value"
    }

    companion object {
        const val REQUEST_CODE_CONFIRM_DEVICE_CREDENTIALS = 1

        private const val PREFERENCES_KEY_AUTOMATIC_AUTHENTICATION = "autoauth"
        private const val MAX_AUTH_TRIES = 3
    }
}
