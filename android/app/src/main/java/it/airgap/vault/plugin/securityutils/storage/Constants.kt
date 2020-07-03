package it.airgap.vault.plugin.securityutils.storage

import android.os.Build

/**
 * Created by Dominik on 19.01.2018.
 */

object Constants {
    const val ANDROID_KEY_STORE = "AndroidKeyStore"
    const val SECURE_STORAGE_ALIAS = "secure_storage_"
    const val BASE_FILE_PATH = "secure_storage"
    const val KEY_SIZE = 256
    const val DIGEST_ALGORITHM = "SHA-256"

    var FILESYSTEM_CIPHER_ALGORITHM = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) "AES/CBC/PKCS7Padding" else "AES/CBC/PKCS5Padding"

    const val FILESYSTEM_FALLBACK_CIPHER_ALGORITHM = "RSA/ECB/PKCS1Padding" // used for pre android 23
    const val PARANOIA_PASSPHRASE_CIPHER_ALGORITHM = "AES/CBC/PKCS7Padding"

    const val PBKDF2_ITERATIONS = 10000
    const val PBKDF2_OUTPUT_KEY_LENGTH = 256
    const val PBKDF2_ALGORITHM = "PBKDF2WithHmacSHA1"

    const val PARANOIA_KEY_FILE_NAME = "paranoia_key"

    const val RECOVERY_PASSWORD_SIZE = 32
    const val RECOVERY_PASSWORD_SEGMENT_SIZE = 4
    const val RECOVERY_PASSWORD_SEGMENTS = 8
    const val RECOVERY_PASSWORD_ALGORITHM = "SHA-256"

    const val RECOVERY_KEY_FILE_NAME = "recovery_key"
    const val RECOVERY_KEY_SUFFIX = "-recovery"
}