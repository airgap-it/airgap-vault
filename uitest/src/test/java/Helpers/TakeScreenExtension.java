package Helpers;

import io.qameta.allure.Attachment;
import org.apache.commons.io.FileUtils;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.WebDriver;

import java.io.File;
import java.io.IOException;

public class TakeScreenExtension {
    private static int screenshotIndex;
    private static String testScreenPath;

    public void InitPath(String testName) {
        Log.info(testName + " - starting");

        screenshotIndex = 0;

        setTestScreenPath(testName);

        cleanScreenFolder();
    }

    // ToDo ref - add base artefacts path const
    private void setTestScreenPath(String testName) {
        String projectPath = System.getProperty("user.dir");
        testScreenPath = projectPath + "/test_artefacts/" + testName + "/screenshots";
    }

    private void cleanScreenFolder() {
        try {
            File file = new File(testScreenPath);
            if (file.exists())
                FileUtils.forceDelete(file);
        } catch (IOException e) {
            Log.error(e.toString());
        }
    }

    @Attachment("{screenshotName}")
    public byte[] takeScreenshot(WebDriver driver, String screenshotName) {
        try {
            File scrFile = ((TakesScreenshot) driver).getScreenshotAs(OutputType.FILE);

            FileUtils.copyFile(scrFile, new File(testScreenPath + "/"
                    + screenshotIndex + "-" + screenshotName + ".png"), true);
            screenshotIndex++;

            Log.info("TakeScreenshot" + screenshotName);
            return ((TakesScreenshot) driver).getScreenshotAs(OutputType.BYTES);
        } catch (Exception e) {
            Log.error("Fail TakeScreenshot - " + screenshotName);
            Log.error(e.toString());
        }

        return null;
    }
}
