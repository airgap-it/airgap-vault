package it.airgap.vault

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.text.method.ScrollingMovementMethod
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import java.io.PrintWriter
import java.io.StringWriter

class ErrorHandler(private val context: Context) : Thread.UncaughtExceptionHandler {
    override fun uncaughtException(t: Thread, e: Throwable) {
        val intent = Intent(context, ErrorActivity::class.java).apply {
            putExtra("exception", e)
        }

        context.startActivity(intent)
    }
}

class ErrorActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_error)

        val textView = findViewById<TextView>(R.id.stack_trace_text_view)
        val exception = intent.getSerializableExtra("exception") as? Throwable

        val stackTrace = exception?.let {
            StringWriter().apply {
                it.printStackTrace(this)
            }.toString()
        }

        textView.text = stackTrace ?: "<empty stack trace>"
        textView.movementMethod = ScrollingMovementMethod()
    }

    private fun Throwable.printStackTrace(writer: StringWriter) {
        printStackTrace(PrintWriter(writer))
        cause?.printStackTrace(writer)
    }
}

@CapacitorPlugin
class ErrorPlugin : Plugin() {

    @PluginMethod
    fun show(call: PluginCall) {
        val error = call.getObject("error")

        val intent = Intent(activity, ErrorActivity::class.java).apply {
            putExtra("exception", RuntimeException(error?.toString() ?: "<empty JS error>"))
        }

        activity.startActivity(intent)
    }
}