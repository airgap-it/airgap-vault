package Helpers;

public class SleepExtension {
    public static void sleep(int time) { // ToDo check static
        try {
            Thread.sleep(time);
        } catch (InterruptedException e) {
            Log.error(e.toString());
        }
        Log.info("Wait - " + time);
    }
}
