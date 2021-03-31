package Pages;

import Helpers.Log;
import Helpers.TakeScreenExtension;
import io.appium.java_client.AppiumDriver;
import io.appium.java_client.MobileBy;
import io.appium.java_client.MobileElement;
import io.appium.java_client.TouchAction;
import io.appium.java_client.touch.offset.PointOption;
import org.openqa.selenium.By;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;

import static io.appium.java_client.touch.TapOptions.tapOptions;
import static io.appium.java_client.touch.WaitOptions.waitOptions;
import static io.appium.java_client.touch.offset.ElementOption.element;
import static io.appium.java_client.touch.offset.PointOption.point;
import static java.time.Duration.ofMillis;

public abstract class BasePage {
    protected AppiumDriver<MobileElement> driver;
    protected WebDriverWait wait;
    protected TakeScreenExtension ts;

    public BasePage(AppiumDriver<MobileElement> driver) {
        this.driver = driver;
        wait = new WebDriverWait(driver, 30);
        ts = new TakeScreenExtension();
        Log.info("(Page loaded) Object of Page " + this.getClass().getSimpleName() + " created");
    }

    protected MobileElement waitClickable(By element) {
        return (MobileElement) wait.until(ExpectedConditions.elementToBeClickable(element));
    }

    protected MobileElement waitPresence(By element) {
        return (MobileElement) wait.until(ExpectedConditions.presenceOfElementLocated(element));
    }

    protected void tap(By element) {
        waitClickable(element).click();
    }

    protected void tapOnCenterOfElement(MobileElement element) {
        new TouchAction(driver).tap(point(element.getLocation())).perform();
    }

    protected void tapByClassAndText(String className, String text) {
        By el = MobileBy.className(className);
        wait.until(ExpectedConditions.presenceOfElementLocated(el));
	Log.debug(this.driver.getPageSource());
        List<MobileElement> elList = driver.findElements(el);
        for (int i = 0; i <= elList.size() - 1; i++) {
            try {
                //System.out.println(elList.get(i).getText().toLowerCase().equals(text.toLowerCase()));
                Log.debug(elList.get(i).getText().toLowerCase());

                if (elList.get(i).getText().toLowerCase().equals(text.toLowerCase())) {
                    elList.get(i).click();
                    Log.debug("MATCH");
                    return;
                } else {
		    Log.debug("'"+elList.get(i).getText().toLowerCase()+"' NO MATCH '"+text.toLowerCase()+"'");
		}
            } catch (Exception e) {
                Log.error(e.toString());
            }
        }
    }
    protected void tapByClassAndTextRemovedSpaces(String className, String text) {
        By el = MobileBy.className(className);
        wait.until(ExpectedConditions.presenceOfElementLocated(el));

        List<MobileElement> elList = driver.findElements(el);
        for (int i = 0; i <= elList.size() - 1; i++) {
            try {
                if (elList.get(i).getText()
                        .toLowerCase()
                        .replaceAll(" ", "")
                        .equals(text
                                .toLowerCase()
                                .replaceAll(" ", ""))) {
                    elList.get(i).click();

                    return;
                }
            } catch (Exception e) {
                Log.error(e.toString());
            }
        }
    }

    protected void tapByClassAndContainsText(String className, String text) {
        By el = MobileBy.className(className);
        wait.until(ExpectedConditions.presenceOfElementLocated(el));
	
        List<MobileElement> elList = driver.findElements(el);
        for (int i = 0; i <= elList.size() - 1; i++) {
            try {
                if (elList.get(i).getText().toLowerCase().contains(text.toLowerCase())) {
                    elList.get(i).click();
                    return;
                }
            } catch (Exception e) {
                Log.error(e.toString());
            }
        }
    }

    protected void noWaitTapByClassAndText(String className, String text) {
        By el = MobileBy.className(className);

        List<MobileElement> elList = driver.findElements(el);
        for (int i = 0; i <= elList.size() - 1; i++) {
            try {
                if (elList.get(i).getText().toLowerCase().equals(text.toLowerCase())) {
                    elList.get(i).click();
                    return;
                }
            } catch (Exception e) {
                Log.error(e.toString());
            }
        }
    }

    protected MobileElement getElementByClassAndText(String className, String text) {
        By el = MobileBy.className(className);
        wait.until(ExpectedConditions.presenceOfElementLocated(el));

        List<MobileElement> elList = driver.findElements(el);
        for (int i = 0; i <= elList.size() - 1; i++) {
            try {
                if (elList.get(i).getText().toLowerCase().equals(text.toLowerCase())) {
                    return elList.get(i);
                }
            } catch (Exception e) {
                Log.error("getElementByClassAndText - null");
                Log.error(e.toString());
            }
        }

        return null;
    }

    protected MobileElement getElementByClassAndContainsText(String className, String text) {
        By el = MobileBy.className(className);
        wait.until(ExpectedConditions.presenceOfElementLocated(el));
        Log.debug(this.driver.getPageSource());
        List<MobileElement> elList = driver.findElements(el);
        for (int i = 0; i <= elList.size() - 1; i++) {
            try {
                if (elList.get(i).getText().toLowerCase().contains(text.toLowerCase())) {
                    return elList.get(i);
                }
            } catch (Exception e) {
                Log.error("getElementByClassAndText - null");
                Log.error(e.toString());
            }
        }

        return null;
    }

    protected List<MobileElement> getElementsByClassAndText(String className, String text) {
        By el = MobileBy.className(className);
        wait.until(ExpectedConditions.presenceOfElementLocated(el));

        List<MobileElement> elList = driver.findElements(el);
        List<MobileElement> resultList = new ArrayList<MobileElement>();
        for (int i = 0; i <= elList.size() - 1; i++) {
            try {
                if (elList.get(i).getText().toLowerCase().equals(text.toLowerCase())) {
                    resultList.add(elList.get(i));
                }
            } catch (Exception e) {
                Log.error(e.toString());
            }
        }

        return resultList;
    }

    protected void enterByClassAndText(String className, String text, String inputText) {
        By el = MobileBy.className(className);
        wait.until(ExpectedConditions.presenceOfElementLocated(el));

        List<MobileElement> elList = driver.findElements(el);
        for (int i = 0; i <= elList.size() - 1; i++) {
            try {
                if (elList.get(i).getText().toLowerCase().equals(text.toLowerCase())) {
                    elList.get(i).setValue(inputText);
                    return;
                }
            } catch (Exception e) {
                Log.error(e.toString());
            }
        }
    }

    protected void enter(By element, String text) {
        MobileElement el = waitClickable(element);
        el.click();
        el.clear();
        el.sendKeys(text);
    }

    protected void sleep(int time) {
        try {
            Thread.sleep(time);
        } catch (InterruptedException e) {
            Log.error(e.toString());
            e.printStackTrace();
        }
        Log.info("Wait - " + time);
    }

    protected void scrollDown() {
        Dimension size = driver.manage().window().getSize();
        int starty = (int) (size.height * 0.80);
        int endy = (int) (size.height * 0.20);
        int startx = size.width / 2;
        System.out.println("starty = " + starty + " ,endy = " + endy + " , startx = " + startx);


        TouchAction actions = new TouchAction(driver);
        actions.press(new PointOption().withCoordinates(startx, starty))
                .waitAction(waitOptions(Duration.ofSeconds(2)))
                .moveTo(new PointOption().withCoordinates(startx, endy))
                .release()
                .perform();
    }

    public void scrollUsingTouchActionsByElements(MobileElement startElement, MobileElement endElement) {
        TouchAction actions = new TouchAction(driver);
        actions.press(new PointOption().withCoordinates(startElement.getLocation()))
                .waitAction(waitOptions(Duration.ofSeconds(2)))
                .moveTo(new PointOption().withCoordinates(endElement.getLocation()))
                .release()
                .perform();
    }

    protected MobileElement scrollToElement(By by, int miliseconds) {
        MobileElement element = null;
        int numberOfTimes = 10;
        Dimension size = driver.manage().window().getSize();
        int anchor = size.width / 2;
        //Swipe up to scroll down
        int startPoint = size.height - 200;
        int endPoint = 50;

        for (int i = 0; i < numberOfTimes; i++) {
            try {
                new TouchAction(driver)
                        .longPress(point(anchor, startPoint))
                        .press(point(anchor, startPoint)) //if used press need proper waiting time
                        .waitAction(waitOptions(ofMillis(miliseconds)))
                        .moveTo(point(anchor, endPoint))
                        .release()
                        .perform();
                element = driver.findElement(by);
                i = numberOfTimes;
            } catch (NoSuchElementException ex) {
                Log.warn(String.format("Element not available. Scrolling (%s) times…", i + 1));
            }
        }

        return element;
    }
}
