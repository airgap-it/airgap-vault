package it.airgap.vault.plugin.securityutils.storage

import android.app.Activity
import android.content.Context
import android.os.Build
import android.security.KeyPairGeneratorSpec
import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import android.support.annotation.StringRes
import android.support.v7.app.AlertDialog
import android.text.Editable
import android.text.TextWatcher
import android.util.Base64
import android.util.Log
import android.view.LayoutInflater
import android.widget.EditText
import it.airgap.vault.R
import java.io.*
import java.math.BigInteger
import java.nio.ByteBuffer
import java.security.*
import java.util.*
import javax.crypto.*
import javax.crypto.spec.IvParameterSpec
import javax.crypto.spec.PBEKeySpec
import javax.crypto.spec.SecretKeySpec
import javax.security.auth.x500.X500Principal
import kotlin.math.abs

/**
 * Created by Dominik on 19.01.2018.
 */
class Storage(private val context: Context, private val storageAlias: String, private var isParanoia: Boolean = false) {

    private val keyStore = KeyStore.getInstance(Constants.ANDROID_KEY_STORE)

    private val keyStoreAlias: String
        get() = generateKeyStoreAlias(storageAlias)

    private val baseDir = File(context.getDir(Constants.BASE_FILE_PATH, Context.MODE_PRIVATE), storageAlias)
    private val paranoiaKeyFile by lazy { SecureFile(baseDir, Constants.PARANOIA_KEY_FILE_NAME) }
    private val recoveryKeyFile by lazy { SecureFile(baseDir, Constants.RECOVERY_KEY_FILE_NAME, immediatelySave = false) }

    private val salt = ByteArray(Constants.KEY_SIZE / 8)

    private val recoveryKeyCharacters: Array<Char> by lazy {
        ('a'..'z' union 'A'..'Z' union '0'..'9').toTypedArray()
    }

    init {
        baseDir.mkdirs()

        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M) {
            this.isParanoia = true
        }

        // loading default Android KeyStore for Secure Key Management
        keyStore.load(null)

        // check for salt
        val saltFile = File(baseDir, "salt")

        // check if we have a salt, else generate it
        if (!saltFile.exists()) {
            generateSalt(saltFile)
        }

        // now, read the generated salt from the fs
        FileInputStream(saltFile).use {
            it.read(salt)
        }
    }

    fun readString(fileKey: String, success: (String) -> Unit, error: (Exception) -> Unit, requestAuthentication: (() -> Unit) -> Unit) {
        when {
            keyStore.containsAlias(keyStoreAlias) -> {
                readFromSecureStorage(fileKey, success, error, requestAuthentication)
            }
            recoveryKeyFile.exists -> {
                recoverString(
                        fileKey = fileKey,
                        success = { readFromSecureStorage(fileKey, success, error, requestAuthentication) },
                        error = error,
                        requestAuthentication = requestAuthentication
                )
            }
            else -> {
                error(Exception(Errors.ITEM_CORRUPTED))
            }
        }
    }

    fun setupParanoiaPassword(success: () -> Unit, error: (Exception) -> Unit) {
        if (!paranoiaKeyFile.exists) {
            showParanoiaSetupAlert({
                generatePasswordKey(paranoiaKeyFile, it)
                success()
            }, error)
        } else {
            success()
        }
    }

    fun setupRecoveryPassword(): String {
        return generatePassword().also { generatePasswordKey(recoveryKeyFile, it) }
    }

    fun writeString(fileKey: String, fileData: String, success: () -> Unit, error: (Exception) -> Unit, requestAuthentication: (() -> Unit) -> Unit) {
        writeToSecureStorage(fileKey, fileData, success, error, requestAuthentication)
    }

    fun writeRecoverableString(fileKey: String, fileData: String, success: (String) -> Unit, error: (Exception) -> Unit, requestAuthentication: (() -> Unit) -> Unit) {
        val recoveryPassword = setupRecoveryPassword()
        val recoveryKey = retrieveRecoveryKey(recoveryPassword)
        val recoverySecureFileStorage = SecureFileStorage(recoveryKey, salt, baseDir)

        recoverySecureFileStorage.write(
                fileKey = "${fileKey}${Constants.RECOVERY_KEY_SUFFIX}",
                fileData = fileData,
                success = {
                    recoveryKeyFile.save()
                    success(recoveryPassword)
                },
                error = error,
                requestAuthentication = requestAuthentication
        )
    }

    fun removeString(fileKey: String, success: () -> Unit, error: (error: Exception) -> Unit) {
        val secureFileStorage = SecureFileStorage(getMasterKey(Cipher.DECRYPT_MODE), salt, baseDir)
        secureFileStorage.remove(fileKey = fileKey, success = success, error = error)
    }

    private fun readFromSecureStorage(fileKey: String, success: (String) -> Unit, error: (Exception) -> Unit, requestAuthentication: (() -> Unit) -> Unit) {
        val secureFileStorage = SecureFileStorage(getMasterKey(Cipher.DECRYPT_MODE), salt, baseDir)

        if (isParanoia) {
            setupParanoiaPassword(
                    success = {
                        showParanoiaAlert(
                                success = {
                                    try {
                                        val digest = retrieveParanoiaSecretDigest(it)
                                        secureFileStorage.read(
                                                fileKey = fileKey,
                                                secret = digest,
                                                success = success,
                                                error = error,
                                                requestAuthentication = requestAuthentication
                                        )
                                    } catch (e: Exception) {
                                        error(e)
                                    }
                                }, error = error)
                    }, error = error
            )
        } else {
            secureFileStorage.read(
                    fileKey = fileKey,
                    success = success,
                    error = error,
                    requestAuthentication = requestAuthentication
            )
        }
    }

    private fun recoverString(fileKey: String, success: () -> Unit, error: (Exception) -> Unit, requestAuthentication: (() -> Unit) -> Unit) {
        val error: (Exception) -> Unit = { exception ->
            if (exception is BadPaddingException) {
                error(Exception(Errors.ITEM_CORRUPTED))
            }
            error(exception)
        }

        showRecoveryAlert(
                success = { password ->
                    requestAuthentication {
                        try {
                            val recoveryKey = retrieveRecoveryKey(password)
                            val recoverySecureFileStorage = SecureFileStorage(recoveryKey, salt, baseDir)
                            recoverySecureFileStorage.read(
                                    fileKey = "${fileKey}${Constants.RECOVERY_KEY_SUFFIX}",
                                    success = {
                                        writeToSecureStorage(
                                                fileKey = fileKey,
                                                fileData = it,
                                                success = success,
                                                error = error,
                                                requestAuthentication = requestAuthentication
                                        )
                                    },
                                    error = error,
                                    requestAuthentication = requestAuthentication
                            )
                        } catch (e: Exception) {
                            error(e)
                        }
                    }
                }, error = error
        )
    }

    private fun writeToSecureStorage(fileKey: String, fileData: String, success: () -> Unit, error: (Exception) -> Unit, requestAuthentication: (() -> Unit) -> Unit) {
        // check if we have a master key, else generate it
        if (!keyStore.containsAlias(keyStoreAlias)) {
            Log.d("SecureStorage", "Alias unknown, generating key...")
            generateKey(keyStoreAlias)
            Log.d("SecureStorage", "Alias unknown, key generated!")
        }

        val secureFileStorage = SecureFileStorage(getMasterKey(Cipher.ENCRYPT_MODE), salt, baseDir)

        if (isParanoia) {
            setupParanoiaPassword(
                    success = {
                        showParanoiaAlert(
                                success = {
                                    try {
                                        val digest = retrieveParanoiaSecretDigest(it)
                                        secureFileStorage.write(
                                                fileKey = fileKey,
                                                fileData = fileData,
                                                secret = digest,
                                                success = success,
                                                error = error,
                                                requestAuthentication = requestAuthentication)
                                    } catch (e: Exception) {
                                        error(e)
                                    }
                                }, error = error)
                    }, error = error
            )
        } else {
            secureFileStorage.write(
                    fileKey = fileKey,
                    fileData = fileData,
                    success = success,
                    error = error,
                    requestAuthentication = requestAuthentication
            )
        }
    }

    private fun getMasterKey(mode: Int): Key? {
        // now, fetch the generated key
        var masterKey: Key? = null
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                masterKey = keyStore.getKey(keyStoreAlias, null) as? SecretKey
            } else {
                val keyEntry = keyStore.getEntry(keyStoreAlias, null) as? KeyStore.PrivateKeyEntry
                if (mode == Cipher.DECRYPT_MODE) {
                    masterKey = keyEntry?.privateKey
                } else if (mode == Cipher.ENCRYPT_MODE) {
                    masterKey = keyEntry?.certificate?.publicKey
                }
            }
        } catch (e: UnrecoverableKeyException) {
            generateKey(keyStoreAlias)
            Log.d("SecureStorage", "couldnt recover key, deleted it...")
        }
        return masterKey
    }

    private fun showParanoiaSetupAlert(success: (String) -> Unit, error: (Exception) -> Unit) {
        showPasswordSetupAlert(
                title = R.string.paranoia_input_alert_title,
                message = R.string.paranoia_input_alert_setup_message,
                positiveText = R.string.paranoia_input_alert_positive_button,
                success = success
        )
    }

    private fun showPasswordSetupAlert(
            @StringRes title: Int,
            @StringRes message: Int,
            @StringRes positiveText: Int,
            success: (String) -> Unit,
            cancel: () -> Unit = {}
    ) {
        (context as? Activity)?.runOnUiThread {
            val editView = LayoutInflater.from(context).inflate(R.layout.alert_setup_dialog, null)

            val passwordText = editView.findViewById<EditText>(R.id.password)
            val confirmText = editView.findViewById<EditText>(R.id.password_confirmation)

            val dialog = AlertDialog.Builder(context, R.style.AirgapAlertDialogStyle).apply {
                setTitle(title)
                setMessage(message)

                setView(editView)
                setPositiveButton(positiveText) { dialog, _ ->
                    dialog.dismiss()
                    if (passwordText.text.toString() == confirmText.text.toString()) {
                        success(passwordText.text.toString())
                    }
                }
            }.create()

            passwordText.afterTextChanged { dialog.isPositiveEnabled = it.assert(confirmText.text.toString(), minLength = 4) }
            confirmText.afterTextChanged { dialog.isPositiveEnabled = it.assert(passwordText.text.toString(), minLength = 4) }

            dialog.show()
        }
    }

    private fun showParanoiaAlert(success: (String) -> Unit, error: (Exception) -> Unit) {
        showPasswordAlert(
                title = R.string.paranoia_input_alert_title,
                positiveText = R.string.paranoia_input_alert_unlock_button,
                success = success
        )
    }

    private fun showRecoveryAlert(success: (String) -> Unit, error: (Exception) -> Unit) {
        showPasswordAlert(
                title = R.string.recovery_input_alert_title,
                message = R.string.recovery_input_alert_recover_message,
                positiveText = R.string.recovery_input_alert_recover_button,
                negativeText = R.string.recovery_input_alert_reimport_button,
                success = success,
                cancel = { error(Exception(Errors.ITEM_CORRUPTED)) }
        )
    }

    private fun showPasswordAlert(
            @StringRes title: Int,
            @StringRes message: Int? = null,
            @StringRes positiveText: Int,
            @StringRes negativeText: Int? = null,
            success: (String) -> Unit,
            cancel: () -> Unit = {}
    ) {
        (context as? Activity)?.runOnUiThread {
            val dialog = AlertDialog.Builder(context, R.style.AirgapAlertDialogStyle).apply {
                setTitle(title)

                val editView = LayoutInflater.from(context).inflate(R.layout.alert_input_dialog, null)
                val editText = editView.findViewById<EditText>(R.id.password)

                setView(editView)
                message?.let { setMessage(it) }

                setPositiveButton(positiveText) { dialog, _ ->
                    dialog.dismiss()
                    success(editText.text.toString())
                }

                negativeText?.let {
                    setNegativeButton(it) { dialog, _ ->
                        dialog.dismiss()
                        cancel()
                    }
                }
            }.create()

            dialog.show()
        }
    }

    private fun generateSalt(saltFile: File) {
        SecureRandom().nextBytes(salt)
        FileOutputStream(saltFile).use { it.write(salt) }
    }

    private fun generateKey(alias: String) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            val keyBuilder = KeyGenParameterSpec.Builder(alias,
                    KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT)
                    .setDigests(KeyProperties.DIGEST_SHA512)
                    .setUserAuthenticationRequired(true)
                    .setUserAuthenticationValidityDurationSeconds(15) // TODO: should this be a parameter for users to choose?
                    .setRandomizedEncryptionRequired(true)
                    .setBlockModes(KeyProperties.BLOCK_MODE_CBC)
                    .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_PKCS7)
            val keyGenerator = KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, Constants.ANDROID_KEY_STORE)
            keyGenerator.init(keyBuilder.build())
            keyGenerator.generateKey()
        } else {
            val spec = KeyPairGeneratorSpec.Builder(context).setAlias(alias).setSubject(
                    X500Principal(String.format("CN=%s, OU=%s", alias,
                            this.context.packageName)))
                    .setSerialNumber(BigInteger.ONE).setStartDate(Calendar.getInstance().time)
                    .setEndDate(Calendar.getInstance().time).build()
            val keyGenerator = KeyPairGenerator.getInstance("RSA", Constants.ANDROID_KEY_STORE)
            keyGenerator.initialize(spec)
            keyGenerator.generateKeyPair()
        }


    }

    private fun generatePassword(): String {
        val recoveryBytes = ByteArray(Constants.RECOVERY_PASSWORD_SIZE).also { SecureRandom().nextBytes(it) }
        val messageDigest = MessageDigest.getInstance(Constants.RECOVERY_PASSWORD_ALGORITHM)

        return messageDigest.digest(recoveryBytes)
                .joinToString("") { recoveryKeyCharacters[abs(it.toInt()) % recoveryKeyCharacters.size].toString() }
                .chunked(Constants.RECOVERY_PASSWORD_SEGMENT_SIZE)
                .take(Constants.RECOVERY_PASSWORD_SEGMENTS)
                .joinToString("-")
    }

    private fun generatePasswordKey(passwordFile: SecureFile, passphraseOrPin: String) {
        val salt = ByteArray(Constants.KEY_SIZE / 8).also { SecureRandom().nextBytes(it) }
        val inputSecretKey = generateSecretKey(passphraseOrPin, salt)

        val keyGen = KeyGenerator.getInstance("AES").apply {
            init(Constants.KEY_SIZE)
        }

        val masterSecretKey = keyGen.generateKey()
        val masterSecretKeyBytes = masterSecretKey.encoded

        val messageDigest = MessageDigest.getInstance(Constants.DIGEST_ALGORITHM)
        val masterSecretKeyDigest = messageDigest.digest(salt + masterSecretKeyBytes)

        val keyCipher = Cipher.getInstance(Constants.FILESYSTEM_CIPHER_ALGORITHM).apply {
            init(Cipher.ENCRYPT_MODE, inputSecretKey, IvParameterSpec(salt.sliceArray(IntRange(0, 15))))
        }
        try {
            passwordFile.output {
                it.write(ByteBuffer.allocate(4).putInt(Constants.PBKDF2_ITERATIONS).array()) //4 octets per int
                it.write(salt)
                it.write(keyCipher.doFinal(masterSecretKeyBytes + masterSecretKeyDigest))
            }

            Log.e("Storage", "Password key written.")
        } catch (e: Exception) {
            Log.e("Storage", e.toString())
        }
    }

    private fun generateSecretKey(password: String, salt: ByteArray): Key {
        val secretKeyFactory = SecretKeyFactory.getInstance(Constants.PBKDF2_ALGORITHM)
        val keySpec = PBEKeySpec(password.toCharArray(), salt, Constants.PBKDF2_ITERATIONS, Constants.PBKDF2_OUTPUT_KEY_LENGTH)

        return secretKeyFactory.generateSecret(keySpec)
    }

    private fun retrieveParanoiaSecretDigest(passphraseOrPin: String): ByteArray {
        try {
            val secretKeySpec = retrievePasswordSecretKeySpec(paranoiaKeyFile, passphraseOrPin)

            return MessageDigest.getInstance(Constants.DIGEST_ALGORITHM).apply {
                update(secretKeySpec.encoded)
            }.digest()
        } catch (e: BadPaddingException) {
            throw Exception(Errors.WRONG_PARANOIA)
        }
    }

    private fun retrieveRecoveryKey(passphraseOrPin: String): Key {
        return retrievePasswordSecretKeySpec(recoveryKeyFile, passphraseOrPin)
    }

    private fun retrievePasswordSecretKeySpec(passwordFile: SecureFile, passphraseOrPin: String): SecretKeySpec {
        val buffer = ByteArray(196)
        val readBytes = passwordFile.readToBuffer(buffer)

        val secretKeyFactory = SecretKeyFactory.getInstance(Constants.PBKDF2_ALGORITHM)
        val salt = buffer.sliceArray(IntRange(4, 35))
        val keySpec = PBEKeySpec(passphraseOrPin.toCharArray(), salt, ByteBuffer.wrap(buffer, 0, 4).int, Constants.KEY_SIZE)
        val secretKey = secretKeyFactory.generateSecret(keySpec)

        val decryptionCipher = Cipher.getInstance(Constants.FILESYSTEM_CIPHER_ALGORITHM).apply {
            init(Cipher.DECRYPT_MODE, secretKey, IvParameterSpec(salt.sliceArray(IntRange(0, 15))))
        }
        val decryptedContent = decryptionCipher.doFinal(buffer.sliceArray(IntRange(36, readBytes)))
        val masterSecretKeyBytes = decryptedContent.sliceArray(IntRange(0, 31))
        val masterSecretKey = SecretKeySpec(masterSecretKeyBytes, Constants.FILESYSTEM_CIPHER_ALGORITHM)

        val messageDigest = MessageDigest.getInstance(Constants.DIGEST_ALGORITHM)
        val secretKeyDigest = messageDigest.digest(salt + masterSecretKeyBytes)
        for (i in secretKeyDigest.indices) {
            if (secretKeyDigest[i] != decryptedContent[32 + i]) {
                throw Exception(Errors.DIGEST_NOT_MATCHING)
            }
        }

        return masterSecretKey
    }

    private fun EditText.afterTextChanged(afterTextChanged: (String) -> Unit) {
        addTextChangedListener(object : TextWatcher {
            override fun afterTextChanged(editable: Editable?) {
                afterTextChanged.invoke(editable.toString())
            }

            override fun beforeTextChanged(p0: CharSequence?, p1: Int, p2: Int, p3: Int) = Unit
            override fun onTextChanged(p0: CharSequence?, p1: Int, p2: Int, p3: Int) = Unit
        })
    }

    private var AlertDialog.isPositiveEnabled: Boolean
        get() = getButton(AlertDialog.BUTTON_POSITIVE).isEnabled
        set(value) { getButton(AlertDialog.BUTTON_POSITIVE).isEnabled = value }

    private fun String.assert(equals: String, minLength: Int): Boolean =
            this == equals && length >= minLength

    companion object {
        /**
         * Removes all stored items in a specific alias
         */
        fun removeAll(activity: Activity, alias: String): Boolean {
            val baseDir = File(activity.getDir(Constants.BASE_FILE_PATH, Context.MODE_PRIVATE), alias)

            if (!baseDir.exists()) {
                return true
            }

            for (file in baseDir.listFiles()) {
                file.delete()
                Log.d("SecureStorage", "deleted file " + file.path)
            }

            return true
        }

        /**
         * Destroys all storage and associated keys
         */
        fun destroy(activity: Activity): Boolean {
            val baseDir = activity.getDir(Constants.BASE_FILE_PATH, Context.MODE_PRIVATE)

            for (file in baseDir.listFiles()) {
                removeAll(activity, file.name)
            }

            val keyStore = KeyStore.getInstance(Constants.ANDROID_KEY_STORE).apply { load(null) }

            for (alias in keyStore.aliases()) {
                keyStore.deleteEntry(alias)
                Log.d("SecureStorage", "deleted alias $alias")
            }

            return true
        }

        fun generateKeyStoreAlias(alias: String): String {
            return Constants.SECURE_STORAGE_ALIAS + alias
        }
    }

}