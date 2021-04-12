package it.airgap.vault;

import android.os.Bundle;

import com.dutchconcepts.capacitor.barcodescanner.BarcodeScanner;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Plugin;

import java.util.ArrayList;

import it.airgap.vault.plugin.appinfo.AppInfo;
import it.airgap.vault.plugin.camerapreview.CameraPreview;
import it.airgap.vault.plugin.saplingnative.SaplingNative;
import it.airgap.vault.plugin.securityutils.SecurityUtils;

public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    // Initializes the Bridge
    this.init(savedInstanceState, new ArrayList<Class<? extends Plugin>>() {{
      // Additional plugins you've installed go here
      // Ex: add(TotallyAwesomePlugin.class);
      add(CameraPreview.class);
      add(AppInfo.class);
      add(SecurityUtils.class);
      add(SaplingNative.class);
      add(BarcodeScanner.class);
    }});
  }
}
