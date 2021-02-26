package it.airgap.vault.plugin.securityutils.storage

import android.os.Build
import android.security.keystore.UserNotAuthenticatedException
import java.io.File
import java.io.InputStream
import java.nio.ByteBuffer
import java.nio.charset.CharacterCodingException
import java.nio.charset.Charset
import java.nio.charset.CharsetDecoder
import java.nio.charset.CodingErrorAction
import java.security.Key
import java.security.MessageDigest
import javax.crypto.Cipher
import javax.crypto.CipherInputStream
import javax.crypto.CipherOutputStream
import javax.crypto.spec.IvParameterSpec
import javax.crypto.spec.SecretKeySpec
import kotlin.concurrent.thread

/**
 * Created by Dominik on 19.01.2018.
 */
class SecureFileStorage(private val masterSecret: Key?, private val salt: ByteArray, private val baseDir: File) {
    private var authAttemptNo: Int = 0

    fun read(fileKey: String, secret: ByteArray = "".toByteArray(), success: (String) -> Unit, error: (Exception) -> Unit, requestAuthentication: (Int, () -> Unit) -> Unit) {
        thread {
            try {
                SecureFile(baseDir, hashForKey(fileKey)).input { fileInputStream ->
                    val fsCipher =
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                            val iv = ByteArray(16)
                            fileInputStream.read(iv)

                            val fsCipher = Cipher.getInstance(Constants.FILESYSTEM_CIPHER_ALGORITHM)
                            fsCipher.init(Cipher.DECRYPT_MODE, masterSecret, IvParameterSpec(iv))
                            fsCipher
                        } else {
                            val fsCipher = Cipher.getInstance(Constants.FILESYSTEM_FALLBACK_CIPHER_ALGORITHM)
                            fsCipher.init(Cipher.DECRYPT_MODE, masterSecret)
                            fsCipher
                        }

                    val fsCipherInputStream = CipherInputStream(fileInputStream, fsCipher)

                    val encryptionSecret = encryptionSecret(secret, hashForKey(fileKey))

                    val specificSecretKey = SecretKeySpec(encryptionSecret, 0, encryptionSecret.size, "AES")
                    val specificSecretCipher = Cipher.getInstance(Constants.FILESYSTEM_CIPHER_ALGORITHM)

                    specificSecretCipher.init(Cipher.DECRYPT_MODE, specificSecretKey, IvParameterSpec(ivForKey(fileKey)))

                    val secretCipherInputStream = CipherInputStream(fsCipherInputStream, specificSecretCipher)
                    val fileValue = secretCipherInputStream.readTextAndClose()

                    authAttemptNo = 0
                    success(fileValue)
                }
            } catch (e: Exception) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    if (e is UserNotAuthenticatedException) {
                        requestAuthentication(++authAttemptNo) { read(fileKey, secret, success, error, requestAuthentication) }
                    } else {
                        error(e)
                    }
                } else {
                    error(e)
                }
            }
        }
    }

    fun write(fileKey: String, fileData: String, secret: ByteArray = "".toByteArray(), success: () -> Unit, error: (Exception) -> Unit, requestAuthentication: (Int, () -> Unit) -> Unit) {
        thread {
            try {
                SecureFile(baseDir, hashForKey(fileKey)).output { fileOutputStream ->
                    val fsCipher =
                            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                                Cipher.getInstance(Constants.FILESYSTEM_CIPHER_ALGORITHM)
                            } else {
                                Cipher.getInstance(Constants.FILESYSTEM_FALLBACK_CIPHER_ALGORITHM)
                            }
                    fsCipher.init(Cipher.ENCRYPT_MODE, masterSecret)
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                        fileOutputStream.write(fsCipher.iv)
                    }
                    val fsCipherOutputStream = CipherOutputStream(fileOutputStream, fsCipher)

                    val encryptionSecret = encryptionSecret(secret, hashForKey(fileKey))

                    val specificSecretKey = SecretKeySpec(encryptionSecret, 0, encryptionSecret.size, "AES")
                    val specificSecretCipher = Cipher.getInstance(Constants.FILESYSTEM_CIPHER_ALGORITHM)

                    specificSecretCipher.init(Cipher.ENCRYPT_MODE, specificSecretKey, IvParameterSpec(ivForKey(fileKey)))

                    CipherOutputStream(fsCipherOutputStream, specificSecretCipher).use {
                        it.write(fileData.toByteArray())
                        it.flush()
                    }

                    authAttemptNo = 0
                    success()
                }
            } catch (e: Exception) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    if (e is UserNotAuthenticatedException) {
                        requestAuthentication(++authAttemptNo) { write(fileKey, fileData, secret, success, error, requestAuthentication) }
                    } else {
                        error(e)
                    }
                } else {
                    error(e)
                }
            }
        }
    }

    fun remove(fileKey: String, success: () -> Unit, error: (error: Exception) -> Unit) {
        thread {
            try {
                val file = SecureFile(baseDir, hashForKey(fileKey))
                val result = file.delete()
                if (result) {
                    success()
                } else {
                    throw Exception(Errors.CANNOT_DELETE_FILE)
                }
            } catch (e: Exception) {
                error(e)
            }
        }
    }

    private fun encryptionSecret(secret: ByteArray, key: ByteArray): ByteArray {
        return MessageDigest.getInstance(Constants.DIGEST_ALGORITHM).digest(secret + key)
    }

    private fun ivForKey(key: String): ByteArray {
        return hashForKey(key).sliceArray(IntRange(0, 15))
    }

    private fun hashForKey(key: String): ByteArray {
        return MessageDigest.getInstance(Constants.DIGEST_ALGORITHM).digest(salt + key.toByteArray())
    }

    @Throws(Exception::class)
    private fun InputStream.readTextAndClose(charset: Charset = Charsets.UTF_8): String {
        val bytes = use { it.readBytes() }

        try {
            val decoder = charset.newDecoder().apply {
                onMalformedInput(CodingErrorAction.REPORT)
                onUnmappableCharacter(CodingErrorAction.REPORT)
            }

            return decoder.decode(bytes)
        } catch (e: CharacterCodingException) {
            throw Exception(Errors.ITEM_CORRUPTED)
        }
    }

    private fun CharsetDecoder.decode(bytes: ByteArray): String {
        val byteBuffer = ByteBuffer.wrap(bytes)
        val stringBuffer = StringBuffer(decode(byteBuffer))

        return stringBuffer.toString()
    }
}