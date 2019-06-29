package com.myapp;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;

import java.util.HashMap;
import java.util.Map;

import javax.annotation.Nonnull;
import javax.annotation.Nullable;

public class AppInfo extends ReactContextBaseJavaModule {

    public AppInfo(@Nonnull ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Nonnull
    @Override
    public String getName() {
        return "AppInfo";
    }

    @Nullable
    @Override
    public Map<String, Object> getConstants() {
        HashMap<String, Object> constants = new HashMap<>();
        constants.put("ENVIRONMENT", BuildConfig.FLAVOR);
        constants.put("VERSION_NAME", BuildConfig.VERSION_NAME);
        constants.put("VERSION_CODE", BuildConfig.VERSION_CODE);
        constants.put("APPLICATION_ID", BuildConfig.APPLICATION_ID);
        constants.put("BUILD_TYPE", BuildConfig.BUILD_TYPE);
        return constants;
    }
}
