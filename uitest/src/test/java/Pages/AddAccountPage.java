package Pages;

import io.appium.java_client.AppiumDriver;
import io.appium.java_client.MobileElement;

public class AddAccountPage extends BasePage {
    public AddAccountPage(AppiumDriver<MobileElement> driver) {
        super(driver);
    }

    public AddAccountPage tapCreate() {
        sleep(3000);
        tapByClassAndText("android.widget.Button", "CREATE");

        return this;
    }

    public AddAccountPage tapBitcoin() {
        sleep(3000);
        tapByClassAndText("android.view.View", "Bitcoin BTC");

        return this;
    }

    public AddAccountPage tapAuthenticate() {
        sleep(5000);
        tapByClassAndText("android.widget.Button", "AUTHENTICATE");

        return this;
    }
}
