package it.airgap.vault.plugin.securityutils.authprompt

import android.os.Bundle
import android.view.View
import androidx.biometric.BiometricManager
import androidx.biometric.BiometricPrompt
import androidx.core.content.ContextCompat
import androidx.fragment.app.Fragment
import it.airgap.vault.R
import kotlinx.coroutines.CompletableDeferred
import kotlinx.coroutines.Deferred

class AuthPromptFragment : Fragment(R.layout.fragment_authenticator) {

    private val _resultDeferred: CompletableDeferred<Boolean> = CompletableDeferred()
    val resultDeferred: Deferred<Boolean>
        get() = _resultDeferred

    private var _biometricPromptInfo: BiometricPrompt.PromptInfo? = null
    private val biometricPromptInfo: BiometricPrompt.PromptInfo
        get() = _biometricPromptInfo ?: BiometricPrompt.PromptInfo.Builder().apply {
            setTitle(getString(R.string.biometric_prompt_title))
            setSubtitle(getString(R.string.biometric_prompt_subtitle))
            setDescription(getString(R.string.biometric_prompt_description))
            setAllowedAuthenticators(BiometricManager.Authenticators.DEVICE_CREDENTIAL or BiometricManager.Authenticators.BIOMETRIC_STRONG)
        }.build().also { _biometricPromptInfo = it }

    private var _biometricPrompt: BiometricPrompt? = null
    private val biometricPrompt: BiometricPrompt
        get() = _biometricPrompt ?: run {
            val executor = ContextCompat.getMainExecutor(requireContext())

            BiometricPrompt(this, executor, object : BiometricPrompt.AuthenticationCallback() {
                override fun onAuthenticationError(errorCode: Int, errString: CharSequence) {
                    super.onAuthenticationError(errorCode, errString)
                    _resultDeferred.complete(false)
                }

                override fun onAuthenticationSucceeded(result: BiometricPrompt.AuthenticationResult) {
                    super.onAuthenticationSucceeded(result)
                    _resultDeferred.complete(true)
                }

                override fun onAuthenticationFailed() {
                    super.onAuthenticationFailed()
                    _resultDeferred.complete(false)
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
}