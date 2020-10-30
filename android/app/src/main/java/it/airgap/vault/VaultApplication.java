package it.airgap.vault;

import android.app.Application;
import android.content.Context;

import org.acra.*;
import org.acra.annotation.*;
import org.acra.config.CoreConfigurationBuilder;
import org.acra.data.StringFormat;

@AcraCore(buildConfigClass = BuildConfig.class)
@AcraMailSender(mailTo = "m.godenzi@papers.ch", resSubject = R.string.crash_title, resBody = R.string.crash_text)
@AcraDialog(resTitle = R.string.crash_title, resEmailPrompt = R.string.crash_comments, resText = R.string.crash_dialog_text)
public class VaultApplication extends Application {
    @Override
    protected void attachBaseContext(Context base) {
        super.attachBaseContext(base);

        CoreConfigurationBuilder builder = new CoreConfigurationBuilder(this);
        builder.setBuildConfigClass(BuildConfig.class).setReportFormat(StringFormat.JSON);
        ACRA.init(this, builder);
    }
}
