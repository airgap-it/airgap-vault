package it.airgap.vault.plugin.securityutils.storage

import android.app.Activity
import android.content.Context
import android.content.DialogInterface
import android.os.Build
import android.security.KeyPairGeneratorSpec
import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import android.support.v7.app.AlertDialog
import android.text.Editable
import android.text.TextWatcher
import android.util.Log
import android.view.LayoutInflater
import android.widget.EditText
import it.airgap.vault.R
import java.io.*
import java.math.BigInteger
import java.nio.ByteBuffer
import java.nio.charset.Charset
import java.security.*
import java.util.*
import javax.crypto.*
import javax.crypto.spec.IvParameterSpec
import javax.crypto.spec.PBEKeySpec
import javax.crypto.spec.SecretKeySpec
import javax.security.auth.x500.X500Principal

/**
 * Created by Dominik on 19.01.2018.
 */
class Storage(private val context: Context, private val storageAlias: String, private var isParanoia: Boolean = false) {

    private val keyStore = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN_MR2) {
        KeyStore.getInstance(Constants.ANDROID_KEY_STORE)
    } else {
        KeyStore.getInstance(KeyStore.getDefaultType())
    }

    private val baseDir = File(context.getDir(Constants.BASE_FILE_PATH, Context.MODE_PRIVATE), storageAlias)
    private val salt = ByteArray(Constants.KEY_SIZE / 8)

    init {
        baseDir.mkdirs()
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M) {
            this.isParanoia = true
        }

        val keyStoreAlias = generateKeyStoreAlias(storageAlias)

        Log.d("SecureStorage", "Creating Alias " + storageAlias)

        // loading default Android KeyStore for Secure Key Management
        keyStore.load(null)

        // check if we have a master key, else generate it
        if (!keyStore.containsAlias(keyStoreAlias)) {
            Log.d("SecureStorage", "Alias unknown, generating key...")
            generateKey(keyStoreAlias)
            Log.d("SecureStorage", "Alias unknown, key generated!")
        }

        baseDir.mkdirs()

        // check for salt
        val saltFile = File(baseDir, "salt")

        // check if we have a salt, else generate it
        if (!saltFile.exists()) {
            generateSalt(saltFile)
        }

        // now, read the generated salt from the fs
        val inputStream = FileInputStream(saltFile)
        inputStream.read(salt)
        inputStream.close()

    }

    fun readString(fileKey: String, success: (String) -> Unit, error: (error: Exception) -> Unit, requestAuthentication: (() -> Unit) -> Unit) {
        val secureFileStorage = SecureFileStorage(this.getMasterKey(Cipher.DECRYPT_MODE), salt, baseDir)

        val successCb: (InputStream) -> Unit = { inputStream ->
            val fileValue = inputStream.readTextAndClose()
            success(fileValue)
        }

        if (isParanoia) {
            this.setupParanoiaPassword(success = {
                showParanoiaAlert(success = { secret ->
                    try {
                        val digest = retrieveParanoiaSecret(secret)
                        secureFileStorage.read(fileKey = fileKey, secret = digest, success = successCb, error = error, requestAuthentication = requestAuthentication)
                    } catch (e: BadPaddingException) {
                        error(Exception("wrong secret"))
                    }
                }, error = error)
            }, error = error)
        } else {
            secureFileStorage.read(fileKey = fileKey, success = successCb, error = error, requestAuthentication = requestAuthentication)
        }

    }

    private fun showParanoiaAlert(success: (String) -> Unit, error: (error: Exception) -> Unit) {
        val builder = AlertDialog.Builder(context, R.style.AirgapAlertDialogStyle)

        builder.setTitle(R.string.paranoia_input_alert_title)

        val editView = (context.getSystemService(Context.LAYOUT_INFLATER_SERVICE) as LayoutInflater).inflate(R.layout.alert_input_dialog, null)
        val editText = editView.findViewById<EditText>(R.id.password)

        builder.setView(editView)
        builder.setPositiveButton(R.string.paranoia_input_alert_unlock_button, DialogInterface.OnClickListener { dialog, id ->
            success(editText.text.toString())
            dialog.dismiss()
        })

        val dialog = builder.create()

        dialog.show()
    }

    private fun getMasterKey(mode: Int): Key? {
        // now, fetch the generated key
        var masterKey: Key? = null
        val keyStoreAlias = generateKeyStoreAlias(storageAlias)
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                masterKey = keyStore.getKey(keyStoreAlias, null) as SecretKey
            } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN_MR2) {
                val keyEntry = keyStore.getEntry(keyStoreAlias, null) as KeyStore.PrivateKeyEntry
                if (mode == Cipher.DECRYPT_MODE) {
                    masterKey = keyEntry.privateKey
                } else if (mode == Cipher.ENCRYPT_MODE) {
                    masterKey = keyEntry.certificate.publicKey
                }
            }
        } catch (e: UnrecoverableKeyException) {
            generateKey(keyStoreAlias)
            Log.d("SecureStorage", "couldnt recover key, deleted it...")
        }
        return masterKey
    }

    private fun showParanoiaSetupAlert(success: (String) -> Unit, error: (error: Exception) -> Unit) {
        val builder = AlertDialog.Builder(context, R.style.AirgapAlertDialogStyle)

        builder.setTitle(R.string.paranoia_input_alert_title).setMessage(R.string.paranoia_input_alert_setup_message)

        val editView = (context.getSystemService(Context.LAYOUT_INFLATER_SERVICE) as LayoutInflater).inflate(R.layout.alert_setup_dialog, null)

        val passwordText = editView.findViewById<EditText>(R.id.password)
        val confirmText = editView.findViewById<EditText>(R.id.password_confirmation)

        builder.setView(editView)
        builder.setPositiveButton(R.string.paranoia_input_alert_positive_button, DialogInterface.OnClickListener { dialog, id ->
            dialog.cancel()
            if (passwordText.text.toString() == confirmText.text.toString()) {
                success(passwordText.text.toString())
            }
        })

        val dialog = builder.create()

        confirmText.afterTextChanged({ text: String ->
            dialog.getButton(AlertDialog.BUTTON_POSITIVE).setEnabled(
                    text == passwordText.text.toString() && text.length >= 4
            )
        })

        passwordText.afterTextChanged({ text: String ->
            dialog.getButton(AlertDialog.BUTTON_POSITIVE).setEnabled(
                    text == confirmText.text.toString() && text.length >= 4
            )
        })

        dialog.show()
    }

    fun setupParanoiaPassword(success: () -> Unit, error: (error: Exception) -> Unit) {
        val paranoiaFile = File(baseDir, Constants.PARANOIA_KEY_FILE_NAME)
        if (!paranoiaFile.exists()) {
            showParanoiaSetupAlert({ password ->
                generateParanoiaKey(password)
                success()
            }, { error ->
                Log.d("Storage", "paranoia setup failed." + error.message)
                error(error)
            })
        } else {
            success()
        }
    }

    fun writeString(fileKey: String, fileData: String, success: () -> Unit, error: (error: Exception) -> Unit, requestAuthentication: (() -> Unit) -> Unit) {
        val secureFileStorage = SecureFileStorage(this.getMasterKey(Cipher.ENCRYPT_MODE), salt, baseDir)

        val successCb: (OutputStream) -> Unit = { outputStream ->
            outputStream.write(fileData.toByteArray())
            outputStream.flush()
            outputStream.close()
            success()
        }

        if (isParanoia) {
            this.setupParanoiaPassword(success = {
                showParanoiaAlert(success = { secret ->
                    try {
                        val digest = retrieveParanoiaSecret(secret)
                        secureFileStorage.write(fileKey = fileKey, secret = digest, success = successCb, error = error, requestAuthentication = requestAuthentication)
                    } catch (e: BadPaddingException) {
                        error(Exception("wrong secret"))
                    }
                }, error = error)
            }, error = error)
        } else {
            secureFileStorage.write(fileKey = fileKey, success = successCb, error = error, requestAuthentication = requestAuthentication)
        }
    }

    fun removeString(fileKey: String, success: () -> Unit, error: (error: Exception) -> Unit) {
        val secureFileStorage = SecureFileStorage(this.getMasterKey(Cipher.DECRYPT_MODE), salt, baseDir)
        secureFileStorage.remove(fileKey = fileKey, success = success, error = error)
    }

    private fun InputStream.readTextAndClose(charset: Charset = Charsets.UTF_8): String {
        return this.bufferedReader(charset).use { it.readText() }
    }

    private fun generateSalt(saltFile: File) {
        SecureRandom().nextBytes(salt)
        val outputStream = FileOutputStream(saltFile)
        outputStream.write(salt)
        outputStream.close()
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
        } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN_MR2) {
            val spec = KeyPairGeneratorSpec.Builder(context).setAlias(alias).setSubject(
                    X500Principal(String.format("CN=%s, OU=%s", alias,
                            this.context.getPackageName())))
                    .setSerialNumber(BigInteger.ONE).setStartDate(Calendar.getInstance().getTime())
                    .setEndDate(Calendar.getInstance().getTime()).build()
            val keyGenerator = KeyPairGenerator.getInstance(KeyProperties.KEY_ALGORITHM_RSA, Constants.ANDROID_KEY_STORE)
            keyGenerator.initialize(spec)
            keyGenerator.generateKeyPair()
        }


    }

    private fun generateParanoiaKey(passphraseOrPin: String) {
        val salt = ByteArray(Constants.KEY_SIZE / 8)
        SecureRandom().nextBytes(salt)

        val secretKeyFactory = SecretKeyFactory.getInstance(Constants.PBKDF2_ALGORITHM)
        val keySpec = PBEKeySpec(passphraseOrPin.toCharArray(), salt, Constants.PBKDF2_ITERATIONS, Constants.PBKDF2_OUTPUT_KEY_LENGTH)
        val inputSecretKey = secretKeyFactory.generateSecret(keySpec)

        val keyGen = KeyGenerator.getInstance("AES")
        keyGen.init(Constants.KEY_SIZE)

        val masterSecretKey = keyGen.generateKey()
        val masterSecretKeyBytes = masterSecretKey!!.encoded

        val messageDigest = MessageDigest.getInstance(Constants.DIGEST_ALGORITHM)
        val masterSecretKeyDigest = messageDigest.digest(salt + masterSecretKeyBytes)

        val keyCipher = Cipher.getInstance(Constants.FILESYSTEM_CIPHER_ALGORITHM)
        keyCipher.init(Cipher.ENCRYPT_MODE, inputSecretKey, IvParameterSpec(salt.sliceArray(IntRange(0, 15))))

        try {
            val secretFile = File(baseDir, Constants.PARANOIA_KEY_FILE_NAME)

            val outputStream = FileOutputStream(secretFile)
            outputStream.write(ByteBuffer.allocate(4).putInt(Constants.PBKDF2_ITERATIONS).array()) //4 octets per int
            outputStream.write(salt)
            outputStream.write(keyCipher.doFinal(masterSecretKeyBytes + masterSecretKeyDigest))
            outputStream.close()

            Log.e("Storage", "Paranoia Key written.")
        } catch (e: Exception) {
            Log.e("Storage", e.toString())
        }
    }

    private fun retrieveParanoiaSecret(passphraseOrPin: String): ByteArray {
        val secretFile = File(baseDir, Constants.PARANOIA_KEY_FILE_NAME)
        val inputStream = FileInputStream(secretFile)

        val buffer = ByteArray(196)
        val readBytes = readStreamToBuffer(inputStream, buffer)
        inputStream.close()

        val secretKeyFactory = SecretKeyFactory.getInstance(Constants.PBKDF2_ALGORITHM)
        val salt = buffer.sliceArray(IntRange(4, 35))
        val keySpec = PBEKeySpec(passphraseOrPin.toCharArray(), salt, ByteBuffer.wrap(buffer, 0, 4).int, Constants.KEY_SIZE)
        val secretKey = secretKeyFactory.generateSecret(keySpec)

        val decryptionCipher = Cipher.getInstance(Constants.FILESYSTEM_CIPHER_ALGORITHM)
        decryptionCipher.init(Cipher.DECRYPT_MODE, secretKey, IvParameterSpec(salt.sliceArray(IntRange(0, 15))))
        val decryptedContent = decryptionCipher.doFinal(buffer.sliceArray(IntRange(36, readBytes)))
        val masterSecretKeyBytes = decryptedContent.sliceArray(IntRange(0, 31))
        val masterSecretKey = SecretKeySpec(masterSecretKeyBytes, Constants.FILESYSTEM_CIPHER_ALGORITHM)

        val messageDigest = MessageDigest.getInstance(Constants.DIGEST_ALGORITHM)
        val secretKeyDigest = messageDigest.digest(salt + masterSecretKeyBytes)
        for (i in secretKeyDigest.indices) {
            if (secretKeyDigest[i] != decryptedContent[32 + i]) {
                throw Exception("digest did not match, wrong secret?")
            }
        }

        val derivationDigest = MessageDigest.getInstance(Constants.DIGEST_ALGORITHM)
        derivationDigest.update(masterSecretKey!!.encoded)

        return derivationDigest.digest()
    }

    fun readStreamToBuffer(inputStream: InputStream, buffer: ByteArray): Int {
        var readByteCount = 0
        var totalByteCount = 0
        while (readByteCount != -1 && buffer.size > totalByteCount) {
            readByteCount = inputStream.read(buffer, totalByteCount, buffer.size - totalByteCount)
            totalByteCount += readByteCount
        }
        return totalByteCount
    }

    private fun EditText.afterTextChanged(afterTextChanged: (String) -> Unit) {
        this.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(p0: CharSequence?, p1: Int, p2: Int, p3: Int) {
            }

            override fun onTextChanged(p0: CharSequence?, p1: Int, p2: Int, p3: Int) {
            }

            override fun afterTextChanged(editable: Editable?) {
                afterTextChanged.invoke(editable.toString())
            }
        })
    }

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

            val keyStore = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN_MR2) {
                KeyStore.getInstance(Constants.ANDROID_KEY_STORE)
            } else {
                KeyStore.getInstance(KeyStore.getDefaultType())
            }
            keyStore.load(null)

            for (alias in keyStore.aliases()) {
                keyStore.deleteEntry(alias)
                Log.d("SecureStorage", "deleted alias " + alias)
            }

            return true
        }

        fun generateKeyStoreAlias(alias: String): String {
            return Constants.SECURE_STORAGE_ALIAS + alias
        }
    }

}