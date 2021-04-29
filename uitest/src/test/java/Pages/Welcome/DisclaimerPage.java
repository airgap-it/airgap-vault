package Pages.Welcome;

import Pages.BasePage;
import io.appium.java_client.AppiumDriver;
import io.appium.java_client.MobileElement;

public class DisclaimerPage extends BasePage {
    public DisclaimerPage(AppiumDriver<MobileElement> driver) {
        super(driver);
    }

    public DisclaimerPage tapUnderstand() {
        sleep(10000);
        tapByClassAndContainsText("android.widget.Button", "I UNDERSTAND AND ACCEPT");

        return this;
    }
}
