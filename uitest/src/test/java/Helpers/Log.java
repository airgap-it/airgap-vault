package Helpers;

import org.apache.log4j.Logger;

public class Log {
    private static Logger Log = Logger.getLogger(Log.class.getName());

    public static void startLog(String testClassName) {
        Log.info("Test is Starting...");
    }

    public static void endLog(String testClassName) {
        Log.info("Test is Ending...");
    }

    public static void info(String message) {
        System.out.println();
        System.out.println(message);
        System.out.println();
        Log.info(message);
    }

    public static void warn(String message) {
        Log.warn(message);
    }

    public static void error(String message) {
        System.out.println();
        System.err.println(message);
        System.out.println();
        Log.error(message);
    }

    public static void fatal(String message) {
        Log.fatal(message);
    }

    public static void debug(String message) {
        System.out.println();
        System.err.println(message);
        System.out.println();
        Log.debug(message);
    }
}
