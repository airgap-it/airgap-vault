package Pages.Settings;

import Pages.BasePage;
import io.appium.java_client.AppiumDriver;
import io.appium.java_client.MobileElement;

public class SettingPage extends BasePage {
    public SettingPage(AppiumDriver<MobileElement> driver) {
        super(driver);
    }



    public SettingPage tapAddSecret() {
        sleep(3000);
        tapByClassAndText("android.widget.Button", "add ADD SECRET");

        return this;
    }

    public SettingPage tapSecret(String secret) {
        sleep(3000);
        tapByClassAndText("android.view.View", secret);

        return this;
    }
}
