package Tests;

import Pages.AddAccountPage;
import Pages.MainPage;
import Pages.Settings.SettingPage;
import TestFixtures.BaseTestFixture;
import org.junit.jupiter.api.Test;

public class MultiAccountsTest extends BaseTestFixture {
    @Test
    public void MultiAccountsTest() {
        String secretName = "ma tt 112";
        generateSecret(secretName, false);
        new MainPage(driver)
                .tapAddAccount();
        new AddAccountPage(driver)
                .tapBitcoin()
                .tapCreate();
        enterPIN();
        new SettingPage(driver)
                .tapSecret(secretName);
    }
}
