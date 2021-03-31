package Pages.Welcome;

import Pages.BasePage;
import io.appium.java_client.AppiumDriver;
import io.appium.java_client.MobileElement;
import org.openqa.selenium.By;

public class SetUpPage extends BasePage {
    public SetUpPage(AppiumDriver<MobileElement> driver) {
        super(driver);
    }

    public SetUpPage tapGenerate() {
        sleep(5000);
//        tapByClassAndText("android.widget.Button", "GENERATE ");
//        driver.findElement(By.name("GENERATE "));
        tapByClassAndText("android.widget.Button", "GENERATE");

        return this;
    }

    public SetUpPage tapImport() {
        sleep(3000);
        tapByClassAndText("android.widget.Button", "IMPORT");

        return this;
    }

    public SetUpPage tapGrantPermission() {
        sleep(2000);
        tapByClassAndText("android.widget.Button", "GRANT PERMISSION");
        sleep(5000);
        tapByClassAndText("android.widget.Button", "Deny");
        sleep(5000);
        tapByClassAndText("android.widget.Button", "Deny");

        return this;
    }

    public SetUpPage generateSecret() {
        sleep(3000);
        By drawing_frame = By.className("android.widget.Image");

        tapByClassAndText("android.widget.Button", "CONTINUE");

        return this;
    }
}
