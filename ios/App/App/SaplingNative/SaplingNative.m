//
//  SaplingNative.m
//  App
//
//  Created by Julia Samol on 02.03.21.
//

#import <Foundation/Foundation.h>
#import <Capacitor/Capacitor.h>

CAP_PLUGIN(SaplingNative, "SaplingNative",
           CAP_PLUGIN_METHOD(isSupported, CAPPluginReturnPromise);
           
           CAP_PLUGIN_METHOD(initParameters, CAPPluginReturnPromise);
           
           CAP_PLUGIN_METHOD(initProvingContext, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(dropProvingContext, CAPPluginReturnPromise);
           
           CAP_PLUGIN_METHOD(prepareSpendDescription, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(preparePartialOutputDescription, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(createBindingSignature, CAPPluginReturnPromise);
)
