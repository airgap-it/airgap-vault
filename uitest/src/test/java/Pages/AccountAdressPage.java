package Pages;

import io.appium.java_client.AppiumDriver;
import io.appium.java_client.MobileElement;

public class AccountAdressPage extends BasePage {
    public AccountAdressPage(AppiumDriver<MobileElement> driver) {
        super(driver);
    }

    public AccountAdressPage deleteAccount() {
        sleep(3000);
        tapByClassAndText("android.widget.Button", "ellipsis vertical");
        sleep(3000);
        tapByClassAndText("android.widget.Button", "Delete trash");
        sleep(3000);
        tapByClassAndText("android.widget.Button", "DELETE");

        return this;
    }

}
