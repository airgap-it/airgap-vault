package ch.papers.securestorage

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

    var FILESYSTEM_CIPHER_ALGORITHM = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
        "AES/CBC/PKCS7Padding"
    } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN_MR2){
        "AES/CBC/PKCS5Padding"
    } else {
        "AES"
    }
    const val FILESYSTEM_FALLBACK_CIPHER_ALGORITHM = "RSA/ECB/PKCS1Padding" // used for pre android 23
    const val PARANOIA_PASSPHRASE_CIPHER_ALGORITHM = "AES/CBC/PKCS7Padding"

    const val PBKDF2_ITERATIONS = 10000
    const val PBKDF2_OUTPUT_KEY_LENGTH = 256
    const val PBKDF2_ALGORITHM = "PBKDF2WithHmacSHA1"
    const val PARANOIA_KEY_FILE_NAME = "paranoia_key"
}