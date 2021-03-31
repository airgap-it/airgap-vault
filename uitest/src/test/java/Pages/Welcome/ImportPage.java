package Pages.Welcome;

import Pages.BasePage;
import io.appium.java_client.AppiumDriver;
import io.appium.java_client.MobileElement;
import org.openqa.selenium.By;

public class ImportPage extends BasePage {
    public ImportPage(AppiumDriver<MobileElement> driver) {
        super(driver);
    }

    public ImportPage enterSecretPhrase(String phrase) {
        sleep(3000);
        By phraseEntry = By.className("android.widget.EditText");
        enter(phraseEntry, phrase);

        return this;
    }

    public ImportPage tapImport() {
        sleep(3000);
        tapByClassAndText("android.widget.Button", "IMPORT");

        return this;
    }
}
