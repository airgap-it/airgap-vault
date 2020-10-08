import Cordova
//
//  SecureScreen.swift
//  AGUtilities
//
//  Created by Mike Godenzi on 07.06.19.
//  Copyright © 2019 Mike Godenzi. All rights reserved.
//

import Foundation
import UIKit

public final class SecureScreen {

    private static let storyboardNameKey = "UILaunchStoryboardName"

    private var outterController: UIViewController? {
        guard let root = UIApplication.shared.keyWindow?.rootViewController else {
            return nil
        }
        var result = root
        while let presented = result.presentedViewController, !presented.isBeingDismissed {
            result = presented
        }
        return result
    }

    private weak var presentedViewController: UIViewController?
    private var willResignActiveObserver: Observer?
    private var didBecomeActiveObserver: Observer?
    
    private var overlayDismissObservers: [() -> ()] = []

    let screen: UIScreen

    var isCaptured: Bool {
        return screen.isCaptured
    }

    public init(screen: UIScreen = .main) {
        self.screen = screen
    }

    public func startOverlayProtection() {
        guard willResignActiveObserver == nil, didBecomeActiveObserver == nil else {
            return
        }
        willResignActiveObserver = Observer(name: UIApplication.willResignActiveNotification, object: UIApplication.shared) { [unowned self] notification in
            self.showOverlay()
        }
        didBecomeActiveObserver = Observer(name: UIApplication.didBecomeActiveNotification, object: UIApplication.shared) { [unowned self] notification in
            self.hideOverlay()
        }
    }

    public func stopOverlayProtection() {
        willResignActiveObserver = nil
        didBecomeActiveObserver = nil
    }
    
    public func waitForOverlayDismiss(completion: @escaping () -> ()) {
        guard let _ = presentedViewController else {
            completion()
            return
        }
        overlayDismissObservers.append(completion)
    }
    
    private func notifyOverlayDismiss() {
        for observer in overlayDismissObservers {
            observer()
        }
        overlayDismissObservers = []
    }

    public func addScreenCaptureObserver(using block: @escaping (Bool) -> ()) -> Observer {
        return Observer(name: UIScreen.capturedDidChangeNotification, object: screen) { [weak self] (notification) in
            guard let selfStrong = self else {
                return
            }
            block(selfStrong.screen.isCaptured)
        }
    }

    public func addScreenshotObserver(using block: @escaping () -> ()) -> Observer {
        return Observer(name: UIApplication.userDidTakeScreenshotNotification, object: UIApplication.shared) { (notification) in
            block()
        }
    }

    private func showOverlay() {
        guard
            presentedViewController == nil,
            let outterController = self.outterController,
            let controller = controllerToPresent() else {
                return
        }
        controller.modalPresentationStyle = .fullScreen
        outterController.present(controller, animated: false)
        presentedViewController = controller
    }

    private func hideOverlay() {
        guard let presented = presentedViewController, let presenting = presented.presentingViewController else {
            return
        }
        let controllers = presentedControllers(from: presented)
        presenting.dismiss(animated: false) {
            self.present(controllers, from: presenting) {
                self.presentedViewController = nil
                self.notifyOverlayDismiss()
            }
        }
    }

    private func controllerToPresent() -> UIViewController? {
        guard let storyboardName = Bundle.main.object(forInfoDictionaryKey: SecureScreen.storyboardNameKey) as? String else {
            return nil
        }
        let storyboard = UIStoryboard(name: storyboardName, bundle: nil)
        return storyboard.instantiateInitialViewController()
    }

    private func present(_ controllers: [UIViewController], from presenting: UIViewController, completion: (() -> ())? = nil) {
        guard let toPresent = controllers.first else {
            completion?()
            return
        }
        presenting.present(toPresent, animated: false) {
            let remaining = Array(controllers.dropFirst())
            guard !remaining.isEmpty else {
                completion?()
                return
            }
            self.present(remaining, from: toPresent, completion: completion)
        }
    }

    private func presentedControllers(from presenting: UIViewController) -> [UIViewController] {
        var result = [UIViewController]()
        var current = presenting
        while let controller = current.presentedViewController {
            result.append(controller)
            current = controller
        }
        return result
    }
}

public class Observer {

    private var center: NotificationCenter
    private var observer: NSObjectProtocol

    init(name: Notification.Name, object: Any? = nil, center: NotificationCenter = .default, queue: OperationQueue = .main, handler: @escaping (Notification) -> ()) {
        self.center = center
        self.observer = center.addObserver(forName: name, object: object, queue: queue, using: handler)
    }

    deinit {
        center.removeObserver(observer)
    }
}
