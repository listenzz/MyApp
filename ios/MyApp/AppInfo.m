//
//  AppInfo.m
//  MyApp
//
//  Created by Listen on 2019/3/31.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "AppInfo.h"

@implementation AppInfo

RCT_EXPORT_MODULE(AppInfo)

+ (BOOL)requiresMainQueueSetup {
    return YES;
}

- (dispatch_queue_t)methodQueue {
    return dispatch_get_main_queue();
}

- (NSDictionary *)constantsToExport {
    NSDictionary *info = [[NSBundle mainBundle] infoDictionary];
    NSMutableDictionary *settings = [[info objectForKey:@"AppSettings"] mutableCopy];
    NSString *bundleId = [info objectForKey:@"CFBundleIdentifier"];
    [settings setObject:bundleId forKey:@"APPLICATION_ID"];
    return settings;
}

- (NSArray<NSString *> *)supportedEvents {
    return @[];
}

@end
