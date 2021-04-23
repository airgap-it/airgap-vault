package Pages.Welcome;

import Pages.BasePage;
import io.appium.java_client.AppiumDriver;
import io.appium.java_client.MobileElement;

public class SelectSecurityPage extends BasePage {
    public SelectSecurityPage(AppiumDriver<MobileElement> driver) {
        super(driver);
    }

    public SelectSecurityPage tapLetsGo() {
        sleep(3000);
        tapByClassAndText("android.widget.Button", "LET'S GO");

        return this;
    }
}
