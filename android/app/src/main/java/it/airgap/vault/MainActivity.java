package it.airgap.vault;

import android.os.Bundle;

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
    registerPlugin(CameraPreview.class);
    registerPlugin(AppInfo.class);
    registerPlugin(SecurityUtils.class);
    registerPlugin(SaplingNative.class);

    super.onCreate(savedInstanceState);
  }
}
