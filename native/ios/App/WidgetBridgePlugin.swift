import Foundation
import Capacitor
import WidgetKit
import CoreLocation

/// JS: Capacitor.registerPlugin('WidgetBridge').update({ data: '<json>' })
/// Saves the next prayer times + ayah of the day where the widgets can read them,
/// then asks iOS to redraw the widgets.
@objc(WidgetBridgePlugin)
public class WidgetBridgePlugin: CAPPlugin, CAPBridgedPlugin, CLLocationManagerDelegate {
    public let identifier = "WidgetBridgePlugin"
    public let jsName = "WidgetBridge"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "update", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "startHeading", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "stopHeading", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getLocation", returnType: CAPPluginReturnPromise)
    ]
    private var locCalls: [CAPPluginCall] = []
    private var lm: CLLocationManager?
    private var headingOn = false

    /// Must match the App Group you add to BOTH the App and the QuranWidget targets in Xcode.
    static let appGroup = "group.com.cryptopanda94.quranduas"

    @objc func update(_ call: CAPPluginCall) {
        guard let data = call.getString("data") else {
            call.reject("missing data")
            return
        }
        guard let defaults = UserDefaults(suiteName: WidgetBridgePlugin.appGroup) else {
            call.reject("App Group not set up: add \(WidgetBridgePlugin.appGroup) to the App target")
            return
        }
        defaults.set(data, forKey: "widgetData")
        if #available(iOS 14.0, *) {
            WidgetCenter.shared.reloadAllTimelines()
        }
        call.resolve()
    }

    // MARK: - Qibla compass (native heading; the web view's motion events are unreliable on iOS)

    @objc func startHeading(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            guard CLLocationManager.headingAvailable() else {
                call.reject("This device has no compass")
                return
            }
            let m = self.lm ?? CLLocationManager()
            self.lm = m
            m.delegate = self
            m.headingFilter = 0.5
            m.headingOrientation = .portrait
            m.desiredAccuracy = kCLLocationAccuracyKilometer
            self.headingOn = true
            switch m.authorizationStatus {
            case .notDetermined: m.requestWhenInUseAuthorization()   // for true north; heading works either way
            case .authorizedWhenInUse, .authorizedAlways: m.startUpdatingLocation()
            default: break
            }
            m.startUpdatingHeading()
            call.resolve()
        }
    }

    @objc func stopHeading(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            self.headingOn = false
            self.lm?.stopUpdatingHeading()
            self.lm?.stopUpdatingLocation()
            call.resolve()
        }
    }

    public func locationManagerDidChangeAuthorization(_ m: CLLocationManager) {
        let ok = m.authorizationStatus == .authorizedWhenInUse || m.authorizationStatus == .authorizedAlways
        if ok {
            if headingOn { m.startUpdatingLocation() }
            if !locCalls.isEmpty { m.requestLocation() }
        } else if m.authorizationStatus == .denied || m.authorizationStatus == .restricted {
            finishLocation(error: "Location permission is off")
        }
    }

    // MARK: - One-off location (to pick the prayer-times city automatically)

    @objc func getLocation(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            let m = self.lm ?? CLLocationManager()
            self.lm = m
            m.delegate = self
            m.desiredAccuracy = kCLLocationAccuracyKilometer
            self.locCalls.append(call)
            switch m.authorizationStatus {
            case .notDetermined: m.requestWhenInUseAuthorization()
            case .authorizedWhenInUse, .authorizedAlways: m.requestLocation()
            default: self.finishLocation(error: "Location permission is off")
            }
        }
    }

    private func finishLocation(error: String? = nil, location: CLLocation? = nil) {
        let calls = locCalls
        locCalls.removeAll()
        for c in calls {
            if let l = location {
                c.resolve(["lat": l.coordinate.latitude, "lng": l.coordinate.longitude, "acc": l.horizontalAccuracy])
            } else {
                c.reject(error ?? "Location unavailable")
            }
        }
    }

    public func locationManager(_ m: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        if let l = locations.last, !locCalls.isEmpty { finishLocation(location: l) }
    }

    public func locationManager(_ m: CLLocationManager, didUpdateHeading h: CLHeading) {
        let isTrue = h.trueHeading >= 0
        notifyListeners("heading", data: ["h": isTrue ? h.trueHeading : h.magneticHeading,
                                          "acc": h.headingAccuracy, "true": isTrue])
    }

    public func locationManager(_ m: CLLocationManager, didFailWithError error: Error) {
        if let e = error as? CLError, e.code == .locationUnknown { return }   // transient; keep waiting
        if !locCalls.isEmpty { finishLocation(error: error.localizedDescription) }
    }

    public func locationManagerShouldDisplayHeadingCalibration(_ m: CLLocationManager) -> Bool { true }
}
