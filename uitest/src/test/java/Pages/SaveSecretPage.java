package Pages;

import io.appium.java_client.AppiumDriver;
import io.appium.java_client.MobileElement;
import org.openqa.selenium.By;

public class SaveSecretPage extends BasePage {
    public SaveSecretPage(AppiumDriver<MobileElement> driver) {
        super(driver);
    }

    public SaveSecretPage enterLabel(String label) {
        sleep(3000);
        By labelEntry = By.className("android.widget.EditText");
        tap(labelEntry);
        enter(labelEntry, label);

        return this;
    }

    public SaveSecretPage tapConfirm() {
        sleep(3000);
        tapByClassAndText("android.widget.Button", "CONFIRM");

        return this;
    }

    public SaveSecretPage enablePasscode() {
        sleep(3000);
        tapByClassAndContainsText("android.widget.CheckBox", "passcode");

        return this;
    }

    public SaveSecretPage enterPasswordAndConfirm(String password) {
        sleep(3000);
        By passwordEntry = By.id("it.airgap.vault:id/password");
        enter(passwordEntry, password);
        By passwordConfirmEntry = By.id("it.airgap.vault:id/password_confirmation");
        enter(passwordConfirmEntry, password);
        sleep(3000);
        tapByClassAndText("android.widget.Button", "SET PASSWORD");


        return this;
    }

    public SaveSecretPage enterPassword(String password) {
        sleep(3000);
        By passwordEntry = By.id("it.airgap.vault:id/password");
        enter(passwordEntry, password);
        sleep(3000);
        tapByClassAndText("android.widget.Button", "UNLOCK");

        return this;
    }
}
