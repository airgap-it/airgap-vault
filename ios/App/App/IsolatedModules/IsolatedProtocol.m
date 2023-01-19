//
//  IsolatedProtocol.m
//  App
//
//  Created by Julia Samol on 08.09.22.
//

#import <Foundation/Foundation.h>
#import <Capacitor/Capacitor.h>

CAP_PLUGIN(IsolatedProtocol, "IsolatedProtocol",
           CAP_PLUGIN_METHOD(getField, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(callMethod, CAPPluginReturnPromise);
)
