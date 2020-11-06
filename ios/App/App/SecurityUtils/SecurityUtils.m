//
//  SecurityUtils.m
//  App
//
//  Created by Julia Samol on 20.01.20.
//

#import <Foundation/Foundation.h>
#import <Capacitor/Capacitor.h>

CAP_PLUGIN(SecurityUtils, "SecurityUtils",
           CAP_PLUGIN_METHOD(waitForOverlayDismiss, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(assessDeviceIntegrity, CAPPluginReturnPromise);
           
           CAP_PLUGIN_METHOD(authenticate, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(setInvalidationTimeout, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(invalidate, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(toggleAutomaticAuthentication, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(setAuthenticationReason, CAPPluginReturnPromise);
           
           CAP_PLUGIN_METHOD(initStorage, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(isDeviceSecure, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(secureDevice, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(removeAll, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(removeItem, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(setItem, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(getItem, CAPPluginReturnPromise);
)
