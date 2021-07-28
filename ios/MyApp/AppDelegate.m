/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#import "AppDelegate.h"

#import <React/RCTBridge.h>
#import <React/RCTLog.h>
#import <React/RCTBundleURLProvider.h>
#import <HybridNavigation/HybridNavigation.h>
#import <CodePush/CodePush.h>
#import <Sentry/Sentry.h>

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  [self hookLog];
  RCTSetLogThreshold(RCTLogLevelInfo);
  
  NSURL *jsCodeLocation;
#ifdef DEBUG
  jsCodeLocation = [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index" fallbackResource:nil];
#else
  jsCodeLocation = [CodePush bundleURL];
#endif
  
  [[HBDReactBridgeManager get] installWithBundleURL:jsCodeLocation launchOptions:launchOptions];
  
  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  if (@available(iOS 13.0, *)) {
      self.window.backgroundColor = [UIColor systemBackgroundColor];
  } else {
      self.window.backgroundColor = UIColor.whiteColor;
  }
  UIViewController *rootViewController = [UIViewController new];
  self.window.rootViewController = rootViewController;
  [self.window makeKeyAndVisible];
  return YES;
}

- (void)hookLog {
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        RCTLogFunction fun = RCTGetLogFunction();
        RCTSetLogFunction(^(RCTLogLevel level, RCTLogSource source, NSString *fileName, NSNumber *lineNumber, NSString *message) {
#if DEBUG
          fun(level, source, fileName, lineNumber, message);
#endif
          if (source == RCTLogSourceNative) {
              SentryBreadcrumb *crumb =
                  [[SentryBreadcrumb alloc] initWithLevel:[self sentryLevelForLogLevel:level]
                                                 category:@"native"];
              if (fileName) {
                    crumb.data = @{ @"filename": [fileName lastPathComponent] };
              }
              crumb.message = message;
              [SentrySDK addBreadcrumb:crumb];
          }
        });
    });
}
                  
- (SentryLevel)sentryLevelForLogLevel:(RCTLogLevel)loglevel {
    if (loglevel == RCTLogLevelFatal) {
        return kSentryLevelFatal;
    } else if (loglevel == RCTLogLevelWarning) {
        return kSentryLevelWarning;
    } else if (loglevel == RCTLogLevelInfo) {
        return kSentryLevelInfo;
    } else {
        return kSentryLevelDebug;
    }
}


@end
