//
//  Zip.m
//  App
//
//  Created by Julia Samol on 19.01.23.
//

#import <Foundation/Foundation.h>
#import <Capacitor/Capacitor.h>

CAP_PLUGIN(Zip, "Zip",
           CAP_PLUGIN_METHOD(unzip, CAPPluginReturnPromise);
)
