import { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: "it.airgap.vault",
  appName: "AirGap Vault",
  bundledWebRuntime: false,
  webDir: "www",
  plugins: {
    SplashScreen: {
      launchAutoHide: false,
      androidSplashResourceName: "screen"
    }
  }
}

export default config
