# Overall Status

- [ ] **FAILED**
- [ ] **PASSED**

# Tests

### Install & secret generation

| **Success** | **Number** | **Test Procedure**                                                                 | **Expected Result**                                                                                                                                        | **Actual Result** |
| ----------- | ---------- | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| [ ]         | OQ-AV-001  | Install AirGap Vault from APK                                                      | AirGap Vault APK can be installed                                                                                                                          |                   |
| [ ]         | OQ-AV-002  | Open AirGap Vault                                                                  | AirGap Vault is opened, Discalimer is shown, the terms are in the language of the device and readable.                                                     |                   |
| [ ]         | OQ-AV-003  | Accept disclaimer terms                                                            | Disclaimer terms are accepted, Onboarding page "The New Crypto Wallet Standard" is shown                                                                   |                   |
| [ ]         | OQ-AV-004  | Select "Let's Go" on the Onboarding page                                           | "Let's setup AirGap!" page is displayed                                                                                                                    |                   |
| [ ]         | OQ-AV-005  | Select "Generate"                                                                  | Camera & microphone permission onboarding ist displayed.                                                                                                   |                   |
| [ ]         | OQ-AV-006  | Select "Grant Permission", accept video & audio permissions                        | Native permission requests for video & audio is shown, goes to the "Generate" page & starts generating                                                     |                   |
| [ ]         | OQ-AV-007  | Generate Secret and select "Continue"                                              | After the entropy has been collected the "Continue" button can be selected, after selecting "Continue" the "Rules" page is displayed                       |                   |
| [ ]         | OQ-AV-007  | Select "Understood" on the rules page                                              | After selecting "Understood" the recovery phrase is displayed                                                                                              |                   |
| [ ]         | OQ-AV-007  | Write down the secret & select "Next"                                              | After backing up the secret & selecting "Next" the verification page appears                                                                               |                   |
| [ ]         | OQ-AV-007  | Select the first word from your recovery phrase                                    | The selected word is shown in the first slot                                                                                                               |                   |
| [ ]         | OQ-AV-007  | Enter the whole mnemonic phrase, select the wrong word for slot 8                  | Error message "secret does not match the generated one.."                                                                                                  |                   |
| [ ]         | OQ-AV-007  | Select slot 8 & select the correct word from the recovery phrase                   | "Continue" is now possible                                                                                                                                 |                   |
| [ ]         | OQ-AV-007  | Select "Continue"                                                                  | The "Save Your Secret" page is displayed                                                                                                                   |                   |
| [ ]         | OQ-AV-007  | Enter a secret name                                                                | A name can be entered, the "Confirm" button is shown                                                                                                       |                   |
| [ ]         | OQ-AV-007  | Select "Confirm" and enter your fingerprint, pin code or faceID                    | The native dialog is prompted, you can enter your fingerprint, code or faceID - The "Add Account" page is shown                                            |                   |
| [ ]         | OQ-AV-007  | Select "Ethereum" and then "Create" and enter your fingerprint, pin code or faceID | "Ethereum" can be selected in the list, the fingerprint, code or faceID is shown, account is being derived and a new entry for "Ethereum ETH" is displayed |                   |
