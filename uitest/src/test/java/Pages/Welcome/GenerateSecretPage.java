package Pages.Welcome;

import Helpers.Log;
import Pages.BasePage;
import io.appium.java_client.AppiumDriver;
import io.appium.java_client.MobileBy;
import io.appium.java_client.MobileElement;
import io.appium.java_client.TouchAction;
import io.appium.java_client.touch.offset.PointOption;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.ExpectedConditions;

import java.util.List;

import static io.appium.java_client.touch.WaitOptions.waitOptions;
import static java.time.Duration.ofSeconds;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.fail;

public class GenerateSecretPage extends BasePage {
    public GenerateSecretPage(AppiumDriver<MobileElement> driver) {
        super(driver);
    }

    public GenerateSecretPage drawAround() {
        sleep(5000);
        MobileElement drawLabel = getElementByClassAndText("android.view.View", "Draw around with your finger.");
        int startX = drawLabel.getCenter().x;
        int startY = drawLabel.getCenter().y;

        for (int i = 0; i <= 35; i++) {
            new TouchAction<>(driver).press(PointOption.point(startX, startY))
                    .waitAction(waitOptions(ofSeconds(2)))
                    .moveTo(PointOption.point(startX + 100, startY + 5))
                    .release()
                    .perform();
            i++;
        }

        return this;
    }

    public GenerateSecretPage tapContinue() {
        sleep(3000);
        tapByClassAndText("android.widget.Button", "CONTINUE");

        return this;
    }

    public GenerateSecretPage tapUnderstood() {
        sleep(3000);
        tapByClassAndText("android.widget.Button", "UNDERSTOOD");

        return this;
    }

    public GenerateSecretPage tapNextStep() {
        sleep(3000);
        tapByClassAndText("android.widget.Button", "NEXT STEP");

        return this;
    }

    public String getRecoveryPhrase() {
        sleep(3000);

        List<MobileElement> allView = driver.findElements(By.className("android.view.View"));
        String recoveryPhrase = null;
	
        for(int i = 0; i <= allView.size() - 1; i++) {
            if(allView.get(i).getText().contains("Write down each word on a piece of paper")) {
                recoveryPhrase= allView.get(i + 1).getText(); // get next view with phrase
            }
        }

	if(recoveryPhrase == null){
	   fail();
	}

	return recoveryPhrase;
    }

    public GenerateSecretPage verifyRecoveryPhrase(String phrase) {
        sleep(5000);
	Log.debug(phrase);
        String[] phraseList = phrase.split(" ");
        for (int i = 0; i <= phraseList.length - 1; i++) {

            By el = MobileBy.className("android.widget.Button");
            wait.until(ExpectedConditions.presenceOfElementLocated(el));

            List<MobileElement> elList = driver.findElements(el);
            for (int j = elList.size() - 1; j >= 0; j--) {
                try {
                    Log.debug(elList.get(j).getText().toLowerCase());

                    if (elList.get(j).getText().toLowerCase().equals(phraseList[i].toLowerCase())) {
                        elList.get(j).click();
                        break;
                    }
                } catch (Exception e) {
                    Log.error(e.toString());
                }
            }
            sleep(2000);
        }

        return this;
    }
}
