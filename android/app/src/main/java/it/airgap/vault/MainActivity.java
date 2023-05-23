package it.airgap.vault;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

import it.airgap.vault.plugin.appinfo.AppInfo;
import it.airgap.vault.plugin.camerapreview.CameraPreview;
import it.airgap.vault.plugin.isolatedmodules.IsolatedModules;
import it.airgap.vault.plugin.saplingnative.SaplingNative;
import it.airgap.vault.plugin.securityutils.SecurityUtils;
import it.airgap.vault.plugin.zip.Zip;

public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(Bundle savedInstanceState) {
    registerPlugin(CameraPreview.class);
    registerPlugin(AppInfo.class);
    registerPlugin(SecurityUtils.class);
    registerPlugin(SaplingNative.class);
    registerPlugin(Zip.class);

    registerPlugin(IsolatedModules.class);

    super.onCreate(savedInstanceState);
  }
}
