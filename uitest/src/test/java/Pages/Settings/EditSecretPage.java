package Pages.Settings;

import Pages.BasePage;
import io.appium.java_client.AppiumDriver;
import io.appium.java_client.MobileElement;

public class EditSecretPage extends BasePage {
    public EditSecretPage(AppiumDriver<MobileElement> driver) {
        super(driver);
    }

    public EditSecretPage tapSocialRecovery() {
        sleep(3000);
        tapByClassAndContainsText("android.view.View", "Social Recovery");

        return this;
    }
}
