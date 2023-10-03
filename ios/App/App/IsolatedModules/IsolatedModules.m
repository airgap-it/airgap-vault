//
//  IsolatedProtocol.m
//  App
//
//  Created by Julia Samol on 08.09.22.
//

#import <Foundation/Foundation.h>
#import <Capacitor/Capacitor.h>

CAP_PLUGIN(IsolatedModules, "IsolatedModules",
           CAP_PLUGIN_METHOD(previewDynamicModule, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(verifyDynamicModule, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(registerDynamicModule, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(readDynamicModule, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(removeDynamicModules, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(readAssetModule, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(loadAllModules, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(callMethod, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(batchCallMethod, CAPPluginReturnPromise);
)
