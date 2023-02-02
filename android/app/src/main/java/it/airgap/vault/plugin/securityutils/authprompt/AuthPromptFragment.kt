package it.airgap.vault.plugin.securityutils.authprompt

import android.os.Build
import android.os.Bundle
import android.view.View
import androidx.biometric.BiometricManager
import androidx.biometric.BiometricPrompt
import androidx.biometric.auth.AuthPrompt
import androidx.core.content.ContextCompat
import androidx.fragment.app.Fragment
import it.airgap.vault.R
import kotlinx.coroutines.CompletableDeferred
import kotlinx.coroutines.Deferred
import java.util.concurrent.atomic.AtomicInteger

class AuthPromptFragment : Fragment(R.layout.fragment_authenticator) {

    private val _resultDeferred: CompletableDeferred<Boolean> = CompletableDeferred()
    val resultDeferred: Deferred<Boolean>
        get() = _resultDeferred

    private val attempts: AtomicInteger = AtomicInteger(0)

    private var _biometricPromptInfo: BiometricPrompt.PromptInfo? = null
    private val biometricPromptInfo: BiometricPrompt.PromptInfo
        get() = _biometricPromptInfo ?: BiometricPrompt.PromptInfo.Builder().apply {
            setTitle(getString(R.string.biometric_prompt_title))
            setSubtitle(getString(R.string.biometric_prompt_subtitle))
            setDescription(getString(R.string.biometric_prompt_description))
            setAllowedAuthenticators(
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) BiometricManager.Authenticators.DEVICE_CREDENTIAL or BiometricManager.Authenticators.BIOMETRIC_STRONG
                else BiometricManager.Authenticators.DEVICE_CREDENTIAL or BiometricManager.Authenticators.BIOMETRIC_WEAK
            )
        }.build().also { _biometricPromptInfo = it }

    private var _biometricPrompt: BiometricPrompt? = null
    private val biometricPrompt: BiometricPrompt
        get() = _biometricPrompt ?: run {
            val executor = ContextCompat.getMainExecutor(requireContext())

            BiometricPrompt(this, executor, object : BiometricPrompt.AuthenticationCallback() {
                override fun onAuthenticationError(errorCode: Int, errString: CharSequence) {
                    super.onAuthenticationError(errorCode, errString)
                    attempts.set(0)
                    _resultDeferred.complete(false)
                }

                override fun onAuthenticationSucceeded(result: BiometricPrompt.AuthenticationResult) {
                    super.onAuthenticationSucceeded(result)
                    attempts.set(0)
                    _resultDeferred.complete(true)
                }

                override fun onAuthenticationFailed() {
                    super.onAuthenticationFailed()
                    if (attempts.incrementAndGet() >= MAX_AUTH_TRIES) {
                        _resultDeferred.complete(false)
                    }
                }
            })
        }.also { _biometricPrompt = it }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        biometricPrompt.authenticate(biometricPromptInfo)
    }

    override fun onDestroyView() {
        _biometricPrompt?.cancelAuthentication()
        _biometricPrompt = null
        _biometricPromptInfo = null

        super.onDestroyView()
    }

    companion object {
        private const val MAX_AUTH_TRIES = 3
    }
}