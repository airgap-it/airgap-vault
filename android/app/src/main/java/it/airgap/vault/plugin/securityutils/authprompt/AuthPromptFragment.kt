package it.airgap.vault.plugin.securityutils.authprompt

import android.os.Bundle
import android.view.View
import androidx.biometric.BiometricManager
import androidx.biometric.BiometricPrompt
import androidx.core.content.ContextCompat
import androidx.fragment.app.Fragment
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import it.airgap.vault.R

class AuthPromptFragment : Fragment(R.layout.fragment_authenticator) {

    private val _resultLiveData: MutableLiveData<Boolean> = MutableLiveData()
    val resultLiveData: LiveData<Boolean>
        get() = _resultLiveData

    private var _biometricPromptInfo: BiometricPrompt.PromptInfo? = null
    private val biometricPromptInfo: BiometricPrompt.PromptInfo
        get() = _biometricPromptInfo ?: BiometricPrompt.PromptInfo.Builder().apply {
            setTitle(getString(R.string.biometric_prompt_title))
            setSubtitle(getString(R.string.biometric_prompt_subtitle))
            setDescription(getString(R.string.biometric_prompt_description))
            setAllowedAuthenticators(BiometricManager.Authenticators.DEVICE_CREDENTIAL or BiometricManager.Authenticators.BIOMETRIC_WEAK)
        }.build().also { _biometricPromptInfo = it }

    private var _biometricPrompt: BiometricPrompt? = null
    private val biometricPrompt: BiometricPrompt
        get() = _biometricPrompt ?: run {
            val executor = ContextCompat.getMainExecutor(context)

            BiometricPrompt(this, executor, object : BiometricPrompt.AuthenticationCallback() {
                override fun onAuthenticationError(errorCode: Int, errString: CharSequence) {
                    super.onAuthenticationError(errorCode, errString)
                    _resultLiveData.postValue(false)
                }

                override fun onAuthenticationSucceeded(result: BiometricPrompt.AuthenticationResult) {
                    super.onAuthenticationSucceeded(result)
                    _resultLiveData.postValue(true)
                }

                override fun onAuthenticationFailed() {
                    super.onAuthenticationFailed()
                    _resultLiveData.postValue(false)
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