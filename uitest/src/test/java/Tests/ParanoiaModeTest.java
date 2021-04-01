package Tests;

import Pages.MainPage;
import Pages.Settings.SettingPage;
import TestFixtures.BaseTestFixture;
import org.junit.jupiter.api.Test;

public class ParanoiaModeTest extends BaseTestFixture {
    @Test
    public void ParanoiaMode() {
        String secretName = "s tt 112";
        generateSecret(secretName, true);
        new MainPage(driver)
                .tapSettings();
        new SettingPage(driver)
                .tapSecret(secretName);
    }
}
