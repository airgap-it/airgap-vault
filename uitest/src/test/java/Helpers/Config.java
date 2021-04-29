package Helpers;

public class Config {
    private String noReset;
    private String platform;
    private String deviceName;
    private String appiumServer;

    // android
    public String androidVersion;
    public String apkPath;

    // iOS
    private String iOSversion;
    private String appPath;
    private String udid;
    private String bundleid;
    private String xcodeOrgId;
    private String updatedWDABundleId;

    public String getAndroidVersion() {
        return androidVersion;
    }

    public void setAndroidVersion(String androidVersion) {
        this.androidVersion = androidVersion;
    }

    public String getApkPath() {
        return apkPath;
    }

    public void setApkPath(String apkPath) {
        this.apkPath = apkPath;
    }

    public String getUdid() {
        return udid;
    }

    public void setUdid(String udid) {
        this.udid = udid;
    }

    public String getBundleid() {
        return bundleid;
    }

    public void setBundleid(String bundleid) {
        this.bundleid = bundleid;
    }

    public String getXcodeOrgId() {
        return xcodeOrgId;
    }

    public void setXcodeOrgId(String xcodeOrgId) {
        this.xcodeOrgId = xcodeOrgId;
    }

    public String getUpdatedWDABundleId() {
        return updatedWDABundleId;
    }

    public void setUpdatedWDABundleId(String updatedWDABundleId) {
        this.updatedWDABundleId = updatedWDABundleId;
    }


    public String getiOSversion() {
        return iOSversion;
    }

    public void setiOSversion(String iOSversion) {
        this.iOSversion = iOSversion;
    }

    public String getAppPath() {
        return appPath;
    }

    public void setAppPath(String appPath) {
        this.appPath = appPath;
    }

    public String getNoReset() {
        return noReset;
    }

    public void setNoReset(String noReset) {
        this.noReset = noReset;
    }

    public String getPlatform() {
        return platform;
    }

    public void setPlatform(String platform) {
        this.platform = platform;
    }

    public String getAppiumServer() {
        return appiumServer;
    }

    public void setAppiumServer(String appiumServer) {
        this.appiumServer = appiumServer;
    }

    public String getDeviceName() {
        return deviceName;
    }

    public void setDeviceName(String deviceName) {
        this.deviceName = deviceName;
    }
}
