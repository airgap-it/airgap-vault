package Pages.Settings;

import Pages.BasePage;
import io.appium.java_client.AppiumDriver;
import io.appium.java_client.MobileElement;

public class SocialRevoveryPage extends BasePage {
    public SocialRevoveryPage(AppiumDriver<MobileElement> driver) {
        super(driver);
    }


    public SocialRevoveryPage tapStart() {
        sleep(3000);
        tapByClassAndContainsText("android.widget.Button", "START");

        return this;
    }

    public SocialRevoveryPage tapNext() {
        sleep(3000);
        tapByClassAndContainsText("android.widget.Button", "NEXT");

        return this;
    }

    public SocialRevoveryPage tapContinue() {
        sleep(3000);
        tapByClassAndContainsText("android.widget.Button", "CONTINUE");

        return this;
    }

    public SocialRevoveryPage tapNumberOfShare(String number) {
        sleep(3000);
        tapByClassAndContainsText("android.widget.Button", number);

        return this;
    }
}
