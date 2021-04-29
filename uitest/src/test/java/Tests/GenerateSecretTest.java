package Tests;

import TestFixtures.BaseTestFixture;
import org.junit.jupiter.api.Test;

public class GenerateSecretTest extends BaseTestFixture {
    @Test
    public void GenerateSecret() {
        generateSecret("test s3", false);
    }


}
