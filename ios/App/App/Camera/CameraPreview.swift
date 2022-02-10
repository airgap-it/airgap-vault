//
//  CameraPreview.swift
//  App
//
//  Created by Julia Samol on 16.01.20.
//
//  Forked from https://github.com/arielhernandezmusa/capacitor-camera-preview

import Foundation
import Capacitor
import AVFoundation

@objc(CameraPreview)
public class CameraPreview: CAPPlugin {

    var previewView: UIView!
    let cameraController = CameraController()

    @objc func start(_ call: CAPPluginCall) {
        let cameraPosition = call.getString(Param.CAMERA) ?? Param.CAMERA_DEFAULT_VALUE

        DispatchQueue.main.async {
            if (self.cameraController.captureSession?.isRunning ?? false) {
                call.reject("camera already started")
            } else {
                self.cameraController.prepare(forCamera: cameraPosition) { error in
                    if let error = error {
                        print(error)
                        call.reject(error.localizedDescription)
                        return
                    }

                    let x = call.getInt(Param.X) ?? Param.X_DEFAULT_VALUE
                    let y = call.getInt(Param.Y) ?? Param.Y_DEFAULT_VALUE

                    let width = call.getInt(Param.WIDTH) ?? Int(UIScreen.main.bounds.size.width)
                    let height = call.getInt(Param.HEIGHT) ?? Int(UIScreen.main.bounds.size.height)

                    self.previewView = UIView(frame: CGRect(x: x, y: y, width: width, height: height))

                    if let webView = self.webView {
                        webView.isOpaque = false
                        webView.backgroundColor = UIColor.clear

                        webView.superview?.addSubview(self.previewView)
                        webView.superview?.bringSubviewToFront(webView)
                    }

                    try? self.cameraController.displayPreview(on: self.previewView)
                    call.resolve()

                }
            }
        }
    }

    @objc func flip(_ call: CAPPluginCall) {
        try? self.cameraController.switchCameras()
        call.resolve()

    }

    @objc func stop(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            self.cameraController.captureSession?.stopRunning()
            self.previewView.removeFromSuperview()
            if let webView = self.webView {
                webView.isOpaque = true
            }
            call.resolve()
        }
    }

    @objc func capture(_ call: CAPPluginCall) {
        // TODO: custom capture size
        let width = call.getInt(Param.WIDTH) ?? 0
        let height = call.getInt(Param.HEIGHT) ?? 0
        let quality = (call.getInt(Param.QUALITY) ?? 85) / 100
        
        self.cameraController.captureImage { (image, error) in
            guard let image = image else {
                print(error ?? "Image capture error")
                guard let error = error else {
                    call.reject("Image capture error")
                    return
                }
                call.reject(error.localizedDescription)
                return
            }

            guard let imageData = image.jpegData(compressionQuality: CGFloat(quality)) else {
                call.reject("Image capture error")
                return
            }
            
            let imageBase64 = imageData.base64EncodedString()

            call.resolve(["value": imageBase64])
        }
    }
    
    private struct Param {
        static let X = "x"
        static let Y = "y"
        static let X_DEFAULT_VALUE = 0
        static let Y_DEFAULT_VALUE = 0
        
        static let WIDTH = "width"
        static let HEIGHT = "height"
        
        static let QUALITY = "quality"
        
        static let CAMERA = "camera"
        static let CAMERA_DEFAULT_VALUE = "back"
    }
    
}
