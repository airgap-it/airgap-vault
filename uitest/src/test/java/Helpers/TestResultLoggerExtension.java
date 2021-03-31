package Helpers;

import Enums.TestResultStatus;
import org.junit.jupiter.api.extension.AfterAllCallback;
import org.junit.jupiter.api.extension.ExtensionContext;
import org.junit.jupiter.api.extension.TestWatcher;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public class TestResultLoggerExtension implements TestWatcher, AfterAllCallback {
    private List<TestResultStatus> testResultsStatus = new ArrayList<>();

    @Override
    public void afterAll(ExtensionContext extensionContext) {
    }

    @Override
    public void testDisabled(ExtensionContext extensionContext, Optional<String> optional) {
    }

    @Override
    public void testSuccessful(ExtensionContext extensionContext) {
    }

    @Override
    public void testAborted(ExtensionContext extensionContext, Throwable throwable) {
    }

    @Override
    public void testFailed(ExtensionContext extensionContext, Throwable throwable) {
    }
}