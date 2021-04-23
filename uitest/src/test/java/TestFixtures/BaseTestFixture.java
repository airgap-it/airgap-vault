package TestFixtures;

import Helpers.Config;
import Helpers.Log;
import Helpers.SleepExtension;
import Helpers.TakeScreenExtension;
import Pages.*;
import Pages.Welcome.DisclaimerPage;
import Pages.Welcome.GenerateSecretPage;
import Pages.Welcome.SelectSecurityPage;
import Pages.Welcome.SetUpPage;
import com.google.common.collect.Lists;
import io.appium.java_client.AppiumDriver;
import io.appium.java_client.MobileElement;
import io.appium.java_client.android.AndroidDriver;
import io.appium.java_client.ios.IOSDriver;
import io.appium.java_client.remote.MobileCapabilityType;
import org.apache.http.ParseException;
import org.json.JSONObject;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.TestInfo;
import org.openqa.selenium.remote.DesiredCapabilities;

import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;


public abstract class BaseTestFixture {
    protected AppiumDriver<MobileElement> driver;

    public static boolean isNullOrEmpty(String str) {
        return str == null || str.isEmpty();
    }

    @BeforeEach
    public void setUp(TestInfo testInfo) {
        Log.startLog("setUp");

        new TakeScreenExtension().InitPath(testInfo.getDisplayName());

        Config config = setProjectConfig("config");
        assert config != null;
        initMobileDriver(config);
    }

    @AfterEach
    public void cleanUp() {
        try {
            String pageSource = driver.getPageSource();
           // driver.quit();
        } catch (Exception e) {
            Log.error(e.toString());
        }

        Log.endLog("cleanUp");
    }

    protected String generateSecret(String secretName, boolean enablePasscode) {
        new DisclaimerPage(driver)
                .tapUnderstand();
        new SelectSecurityPage(driver)
                .tapLetsGo();

        new SetUpPage(driver)
                .tapGenerate()
                .tapGrantPermission();
        enterPIN();
        SleepExtension.sleep(5000);
        new GenerateSecretPage(driver)
                .drawAround()
                .tapContinue()
                .tapUnderstood();
        SleepExtension.sleep(30000);
        String recoveryPhrase = new GenerateSecretPage(driver).getRecoveryPhrase();
        System.out.println(recoveryPhrase);
        new GenerateSecretPage(driver)
                .tapNextStep()
                .verifyRecoveryPhrase(recoveryPhrase)
                .tapContinue();
        new SaveSecretPage(driver)
                .enterLabel(secretName);
        String password = "1q2w3e";
        if(enablePasscode) {
            new SaveSecretPage(driver)
                    .enablePasscode();
        }
        new SaveSecretPage(driver)
                .tapConfirm();
        if(enablePasscode) {

            new SaveSecretPage(driver)
                    .enterPasswordAndConfirm(password)
                    .enterPassword(password);
        }

        enterPIN();

        new AddAccountPage(driver)
                .tapCreate();

        new AddAccountPage(driver)
                .tapAuthenticate();

        if(enablePasscode) {
            new SaveSecretPage(driver)
                    .enterPassword(password);
        }
        enterPIN();

        return recoveryPhrase;
    }


    protected void enterPIN() {
        SleepExtension.sleep(5000);
        Map<String, Object> input_text = new HashMap<>();
        input_text.put("command", "input");
        input_text.put("args", Lists.newArrayList("text", "1235"));
        driver.executeScript("mobile: shell", input_text);
        SleepExtension.sleep(2000);
        Map<String, Object> input_enter = new HashMap<>();
        input_enter.put("command", "input");
        input_enter.put("args", Lists.newArrayList("keyevent", "KEYCODE_ENTER"));
        driver.executeScript("mobile: shell", input_enter);
        SleepExtension.sleep(5000);
    }

    private Config setProjectConfig(String configName) {
        try {
            String projectPath = System.getProperty("user.dir");
            String content = new String(Files.readAllBytes(Paths.get(projectPath + "//" + configName + ".json")));

            JSONObject jsonFile = new JSONObject(content);

            Config currentConfig = new Config();
            currentConfig.setPlatform(jsonFile.getString("platform"));
            currentConfig.setNoReset(jsonFile.getString("noReset"));
            currentConfig.setAppiumServer(jsonFile.getString("appiumServer"));

            // android
            currentConfig.setAndroidVersion(jsonFile.getString("androidVersion"));
            currentConfig.setApkPath(jsonFile.getString("apkPath"));

            // ios
            currentConfig.setiOSversion(jsonFile.getString("iOSversion"));
            currentConfig.setAppPath(jsonFile.getString("appPath"));
            currentConfig.setDeviceName(jsonFile.getString("deviceName"));

            return currentConfig;

        } catch (IOException | ParseException e) {
            Log.error(e.toString());
        }

        return null;
    }

    private void initMobileDriver(Config config) {
        DesiredCapabilities capabilities = new DesiredCapabilities();
        URL driverUrl;

        try {
            driverUrl = new URL(config.getAppiumServer());
        } catch (MalformedURLException e) {
            Log.error(e.toString());
            throw new RuntimeException(e);
        }

        // important
        capabilities.setCapability(MobileCapabilityType.PLATFORM_NAME, config.getPlatform());
        if(config.getPlatform().equals("iOS")) {
            capabilities.setCapability(MobileCapabilityType.APP, config.getAppPath());
            capabilities.setCapability(MobileCapabilityType.PLATFORM_VERSION, config.getiOSversion());
            capabilities.setCapability(MobileCapabilityType.DEVICE_NAME, config.getDeviceName());
            capabilities.setCapability(MobileCapabilityType.AUTOMATION_NAME, "XCUITest");
        } else if(config.getPlatform().equals("android")) {
            capabilities.setCapability(MobileCapabilityType.APP, config.getApkPath());
            capabilities.setCapability(MobileCapabilityType.PLATFORM_VERSION, config.getAndroidVersion());
//            capabilities.setCapability("appPackage", "it.airgap.vault");
//            capabilities.setCapability("appActivity", "it.airgap.vault.MainActivity");
            capabilities.setCapability(MobileCapabilityType.DEVICE_NAME, "default");
            capabilities.setCapability(MobileCapabilityType.PLATFORM_NAME, "android");
//            capabilities.setCapability("ignoreUnimportantViews", true);
//            capabilities.setCapability("disableAndroidWatchers", true);
            capabilities.setCapability("newCommandTimeout", 10000);
//            capabilities.setCapability("androidInstallTimeout", 150000);
            capabilities.setCapability(MobileCapabilityType.AUTOMATION_NAME, "UiAutomator2");
            capabilities.setCapability("skipUnlock", "true");
        }

        // important for run on real device
        if(config.getPlatform().equals("iOS")) {
            capabilities.setCapability("udid", "auto");
            capabilities.setCapability("xcodeSigningId", "iPhone Developer");
            if (isNullOrEmpty(config.getBundleid()))
                capabilities.setCapability("bundleId", config.getBundleid());
            if (isNullOrEmpty(config.getXcodeOrgId()))
                capabilities.setCapability("xcodeOrgId", config.getXcodeOrgId());
            if (isNullOrEmpty(config.getUpdatedWDABundleId()))
                capabilities.setCapability("updatedWDABundleId", config.getUpdatedWDABundleId());
        }
        // optional
//        capabilities.setCapability("autoGrantPermissions", true);
//        capabilities.setCapability("autoAcceptAlerts", true);
        capabilities.setCapability("unicodeKeyboard", true);
        capabilities.setCapability("resetKeyboard", true);
        capabilities.setCapability(MobileCapabilityType.NO_RESET, config.getNoReset());

        if(config.getPlatform().equals("iOS")) {
            driver = new IOSDriver<>(driverUrl, capabilities);
        } else {
            driver = new AndroidDriver<>(driverUrl, capabilities);
        }
    }
}
