package com.myapp;

import android.util.Log;

import com.facebook.common.logging.LoggingDelegate;

import java.util.Arrays;
import java.util.List;

import io.sentry.Breadcrumb;
import io.sentry.Sentry;
import io.sentry.SentryLevel;

public class SentryLogDelegate implements LoggingDelegate {

    private final static List<String> tags = Arrays.asList("ViewManagerPropertyUpdater", "ReactNativeJS");

    private final static String TAG = "SentryLogDelegate";

    private final boolean debug;

    public SentryLogDelegate(boolean debug) {
        this.debug = debug;
    }

    private void addBreadcrumb(String tag, String message, int priority) {
        if (message == null) {
            return;
        }

        if (tags.contains(tag)) {
            return;
        }

        Sentry.configureScope(scope -> {
            Breadcrumb breadcrumb = new Breadcrumb();
            breadcrumb.setCategory("native");
            breadcrumb.setMessage("[" + tag + "] " + message);
            breadcrumb.setLevel(priority2Level(priority));
            scope.addBreadcrumb(breadcrumb);
        });
    }

    private SentryLevel priority2Level(int priority) {
        switch (priority) {
            case Log.INFO:
                return SentryLevel.INFO;
            case Log.WARN:
                return SentryLevel.WARNING;
            case Log.ERROR:
                return SentryLevel.ERROR;
            case Log.ASSERT:
                return SentryLevel.FATAL;
        }
        return SentryLevel.DEBUG;
    }

    private int mMinimumLoggingLevel = Log.INFO;

    @Override
    public void setMinimumLoggingLevel(int level) {
        mMinimumLoggingLevel = level;
    }

    @Override
    public int getMinimumLoggingLevel() {
        return mMinimumLoggingLevel;
    }

    @Override
    public boolean isLoggable(int level) {
        return mMinimumLoggingLevel <= level;
    }

    @Override
    public void v(String tag, String msg) {
        println(Log.VERBOSE, tag, msg);
    }

    @Override
    public void v(String tag, String msg, Throwable tr) {
        println(Log.VERBOSE, tag, msg, tr);
    }

    @Override
    public void d(String tag, String msg) {
        println(Log.DEBUG, tag, msg);
    }

    @Override
    public void d(String tag, String msg, Throwable tr) {
        println(Log.DEBUG, tag, msg, tr);
    }

    @Override
    public void i(String tag, String msg) {
        println(Log.INFO, tag, msg);
    }

    @Override
    public void i(String tag, String msg, Throwable tr) {
        println(Log.INFO, tag, msg, tr);
    }

    @Override
    public void w(String tag, String msg) {
        println(Log.WARN, tag, msg);
    }

    @Override
    public void w(String tag, String msg, Throwable tr) {
        println(Log.WARN, tag, msg, tr);
    }

    @Override
    public void e(String tag, String msg) {
        println(Log.ERROR, tag, msg);
    }

    @Override
    public void e(String tag, String msg, Throwable tr) {
        println(Log.ERROR, tag, msg, tr);
    }

    /**
     * <p> Note: this gets forwarded to {@code android.util.Log.e} as {@code android.util.Log.wtf}
     * might crash the app.
     */
    @Override
    public void wtf(String tag, String msg) {
        println(Log.ERROR, tag, msg);
    }

    /**
     * <p> Note: this gets forwarded to {@code android.util.Log.e} as {@code android.util.Log.wtf}
     * might crash the app.
     */
    @Override
    public void wtf(String tag, String msg, Throwable tr) {
        println(Log.ERROR, tag, msg, tr);
    }

    @Override
    public void log(int priority, String tag, String msg) {
        println(priority, tag, msg);
    }

    private void println(int priority, String tag, String msg) {
        if (debug) {
            if (!"ReactNativeJS".equals(tag)) {
                Log.println(priority, prefixTag(tag), msg);
            }
        } else {
            addBreadcrumb(tag, msg, priority);
        }
    }

    private void println(int priority, String tag, String msg, Throwable tr) {
        if (debug) {
            if (!"ReactNativeJS".equals(tag)) {
                Log.println(priority, prefixTag(tag), getMsg(msg, tr));
            }
        } else {
            addBreadcrumb(tag, getMsg(msg, tr), priority);
        }
    }

    private String prefixTag(String tag) {
        return tag;
    }

    private static String getMsg(String msg, Throwable tr) {
        return msg + '\n' + getStackTraceString(tr);
    }

    private static String getStackTraceString(Throwable tr) {
        return Log.getStackTraceString(tr);
    }
}
