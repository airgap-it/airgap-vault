# Airgap-autotests

## Requirements

* [Java 8 JDK](http://www.oracle.com/technetwork/java/javase/downloads/index.html)

* [Maven](https://maven.apache.org/download.cgi)

* [Appium server](http://appium.io/)

* [Android emulator or real device]

* [Path variable JAVA_HOME, maven]

## Quickstart run test
1) Run emulator or connect you device
2) start appium server
```
appium --port 4723 --relaxed-security
```
3) edit config.json file set android version and other property like "androidVersion": "10.0"
4) run tests
```
mvn test
```
5) optional create report
```
mvn allure:serve
```

