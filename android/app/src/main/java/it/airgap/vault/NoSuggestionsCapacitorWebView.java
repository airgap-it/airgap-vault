package it.airgap.vault;

import android.content.Context;
import android.text.InputType;
import android.util.AttributeSet;
import android.view.inputmethod.EditorInfo;
import android.view.inputmethod.InputConnection;

import com.getcapacitor.CapacitorWebView;

public class NoSuggestionsCapacitorWebView extends CapacitorWebView {
  public NoSuggestionsCapacitorWebView(Context context, AttributeSet attrs) {
    super(context, attrs);
  }

  @Override
  public InputConnection onCreateInputConnection(EditorInfo outAttrs) {
    InputConnection inputConnection = super.onCreateInputConnection(outAttrs);

    if ((outAttrs.inputType & InputType.TYPE_TEXT_FLAG_NO_SUGGESTIONS) != 0) {
      outAttrs.inputType &= ~InputType.TYPE_TEXT_FLAG_AUTO_CORRECT;
      disableWritingTools(outAttrs);
    }

    return inputConnection;
  }

  private static void disableWritingTools(EditorInfo editorInfo) {
    try {
      EditorInfo.class.getMethod("setWritingToolsEnabled", boolean.class).invoke(editorInfo, false);
    } catch (ReflectiveOperationException | SecurityException ignored) {
      // Writing tools were added in API 36 and do not exist on older Android versions.
    }
  }
}
