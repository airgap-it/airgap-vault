package Tests;

import Pages.*;
import Pages.Settings.SettingPage;
import Pages.Welcome.ImportPage;
import Pages.Welcome.SetUpPage;
import TestFixtures.BaseTestFixture;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class ImportSecretTest extends BaseTestFixture {
    @Test
    public void ImportSecret() {
        enterPIN();

        String recoveryPhrase = generateSecret("test s2", false);

        String adress = new MainPage(driver).getAdress();
        new MainPage(driver)
                .tapAeternity();

        new AccountAdressPage(driver)
                .deleteAccount();

        new MainPage(driver)
                .tapSettings();
        new SettingPage(driver)
                .tapAddSecret();
        new SetUpPage(driver)
                .tapImport();
        new ImportPage(driver)
                .enterSecretPhrase(recoveryPhrase)
                .tapImport();
        new SaveSecretPage(driver)
                .enterLabel("test import secret label 1")
                .tapConfirm();
        enterPIN();
        new AddAccountPage(driver)
                .tapCreate()
                .tapAuthenticate();

        enterPIN();

        assertEquals(adress, new MainPage(driver).getAdress());
    }
}
