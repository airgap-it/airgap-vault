package it.airgap.vault.plugin.saplingnative

import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import it.airgap.sapling.Sapling
import it.airgap.vault.util.*
import kotlin.concurrent.thread

@CapacitorPlugin
class SaplingNative : Plugin() {
    private val sapling: Sapling by lazy { Sapling() }

    @PluginMethod
    fun isSupported(call: PluginCall) {
        call.resolveWithData(Key.IS_SUPPORTED to true)
    }

    @PluginMethod
    fun initParameters(call: PluginCall) {
        with(call) {
            thread {
                tryResolveCatchReject {
                    val spendParameters = readFromAssets("public/assets/sapling/sapling-spend.params")
                    val outputParameters = readFromAssets("public/assets/sapling/sapling-output.params")

                    sapling.initParameters(spendParameters, outputParameters)
                }
            }
        }
    }

    @PluginMethod
    fun initProvingContext(call: PluginCall) {
        call.resolveWithData(Key.CONTEXT to sapling.initProvingContext().toString())
    }

    @PluginMethod
    fun dropProvingContext(call: PluginCall) {
        with(call) {
            assertReceived(Param.CONTEXT)
            sapling.dropProvingContext(context)
            resolve()
        }
    }

    @PluginMethod
    fun prepareSpendDescription(call: PluginCall) {
        with(call) {
            assertReceived(
                    Param.CONTEXT,
                    Param.SPENDING_KEY,
                    Param.ADDRESS,
                    Param.RCM,
                    Param.AR,
                    Param.VALUE,
                    Param.ROOT,
                    Param.MERKLE_PATH
            )

            tryResolveWithDataCatchReject {
                val spendDescription = sapling.prepareSpendDescription(
                        context,
                        spendingKey,
                        address,
                        rcm,
                        ar,
                        value,
                        root,
                        merklePath
                )

                listOf(Key.SPEND_DESCRIPTION to spendDescription.asHexString())
            }
        }
    }

    @PluginMethod
    fun preparePartialOutputDescription(call: PluginCall) {
        with(call) {
            assertReceived(
                    Param.CONTEXT,
                    Param.ADDRESS,
                    Param.RCM,
                    Param.ESK,
                    Param.VALUE
            )

            tryResolveWithDataCatchReject {
                val outputDescription = sapling.preparePartialOutputDescription(
                        context,
                        address,
                        rcm,
                        esk,
                        value
                )

                listOf(Key.OUTPUT_DESCRIPTION to outputDescription.asHexString())
            }
        }
    }

    @PluginMethod
    fun createBindingSignature(call: PluginCall) {
        with(call) {
            assertReceived(Param.CONTEXT, Param.BALANCE, Param.SIGHASH)

            tryResolveWithDataCatchReject {
                val bindingSignature = sapling.createBindingSignature(context, balance, sighash)

                listOf(Key.BINDING_SIGNATURE to bindingSignature.asHexString())
            }
        }
    }

    private val PluginCall.context: Long
        get() = getString(Param.CONTEXT)!!.toLong()

    private val PluginCall.spendingKey: ByteArray
        get() = getString(Param.SPENDING_KEY)!!.asByteArray()

    private val PluginCall.address: ByteArray
        get() = getString(Param.ADDRESS)!!.asByteArray()

    private val PluginCall.rcm: ByteArray
        get() = getString(Param.RCM)!!.asByteArray()

    private val PluginCall.ar: ByteArray
        get() = getString(Param.AR)!!.asByteArray()

    private val PluginCall.esk: ByteArray
        get() = getString(Param.ESK)!!.asByteArray()

    private val PluginCall.value: Long
        get() = getString(Param.VALUE)!!.toLong()

    private val PluginCall.root: ByteArray
        get() = getString(Param.ROOT)!!.asByteArray()

    private val PluginCall.merklePath: ByteArray
        get() = getString(Param.MERKLE_PATH)!!.asByteArray()

    private val PluginCall.balance: Long
        get() = getString(Param.BALANCE)!!.toLong()

    private val PluginCall.sighash: ByteArray
        get() = getString(Param.SIGHASH)!!.asByteArray()

    private object Param {
        const val CONTEXT = "context"

        const val SPENDING_KEY = "spendingKey"
        const val ADDRESS = "address"
        const val RCM = "rcm"
        const val AR = "ar"
        const val ESK = "esk"
        const val VALUE = "value"
        const val ROOT = "root"
        const val MERKLE_PATH = "merklePath"

        const val BALANCE = "balance"
        const val SIGHASH = "sighash"
    }

    private object Key {
        const val IS_SUPPORTED = "isSupported"

        const val CONTEXT = "context"
        const val SPEND_DESCRIPTION = "spendDescription"
        const val OUTPUT_DESCRIPTION = "outputDescription"
        const val BINDING_SIGNATURE = "bindingSignature"
    }
}
