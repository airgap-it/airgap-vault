package Pages;

import io.appium.java_client.AppiumDriver;
import io.appium.java_client.MobileElement;

public class MainPage extends BasePage {
    public MainPage(AppiumDriver<MobileElement> driver) {
        super(driver);
    }

    public MainPage tapSettings() {
        sleep(3000);
        tapByClassAndContainsText("android.view.View", "Settings");

        return this;
    }

    public MainPage tapAddAccount() {
        sleep(3000);
        tapByClassAndContainsText("android.widget.Button", "add add account");

        return this;
    }

    public MainPage tapAeternity() {
        sleep(3000);
        tapByClassAndContainsText("android.view.View", "æternity AE ");

        return this;
    }

    public String getAdress() {
        sleep(3000);
        MobileElement aeternityElement = getElementByClassAndContainsText("android.view.View", "ak_");
        String address = aeternityElement.getText();
        System.out.println(address);

        return address;
    }
}
