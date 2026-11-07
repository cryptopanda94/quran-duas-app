import Foundation
import UIKit
import Capacitor
import WidgetKit
import CoreLocation
import SwiftUI
#if canImport(AlarmKit)
import AlarmKit
import ActivityKit

@available(iOS 26.0, *)
struct AzanAlarmMeta: AlarmMetadata {}
#endif

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
        CAPPluginMethod(name: "getLocation", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "setIcon", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "alarmStatus", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "alarmRequest", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "alarmSchedule", returnType: CAPPluginReturnPromise)
    ]
    private var locCalls: [CAPPluginCall] = []
    private var lm: CLLocationManager?
    private var headingOn = false

    /// Must match the App Group you add to BOTH the App and the QuranWidget targets in Xcode.
    static let appGroup = "group.com.cryptopanda94.quranduas"

    public override func load() { NSLog("QD: WidgetBridgePlugin loaded") }

    // MARK: Azan alarms (AlarmKit, iOS 26+): ring even when the phone is on silent or in Focus

    @objc func alarmStatus(_ call: CAPPluginCall) {
        #if canImport(AlarmKit)
        if #available(iOS 26.0, *) {
            let s = AlarmManager.shared.authorizationState
            call.resolve(["supported": true, "state": s == .authorized ? "granted" : (s == .denied ? "denied" : "prompt")])
            return
        }
        #endif
        call.resolve(["supported": false, "state": "unsupported"])
    }

    @objc func alarmRequest(_ call: CAPPluginCall) {
        #if canImport(AlarmKit)
        if #available(iOS 26.0, *) {
            Task {
                do {
                    let s = try await AlarmManager.shared.requestAuthorization()
                    call.resolve(["state": s == .authorized ? "granted" : "denied"])
                } catch { call.reject(error.localizedDescription) }
            }
            return
        }
        #endif
        call.resolve(["state": "unsupported"])
    }

    /// items: [{ at: epoch ms, title: String, sound: "azan_short.wav" }] — replaces all alarms this app scheduled
    @objc func alarmSchedule(_ call: CAPPluginCall) {
        #if canImport(AlarmKit)
        if #available(iOS 26.0, *) {
            let items = call.getArray("items", JSObject.self) ?? []
            Task {
                let mgr = AlarmManager.shared
                for a in ((try? mgr.alarms) ?? []) { try? mgr.cancel(id: a.id) }
                var n = 0
                for it in items {
                    guard let ms = it["at"] as? Double, let title = it["title"] as? String else { continue }
                    let alert = AlarmPresentation.Alert(
                        title: LocalizedStringResource(stringLiteral: title),
                        stopButton: AlarmButton(text: "Stop", textColor: .white, systemImageName: "stop.circle"))
                    let attrs = AlarmAttributes<AzanAlarmMeta>(presentation: AlarmPresentation(alert: alert), metadata: AzanAlarmMeta(), tintColor: Color(red: 0.89, green: 0.71, blue: 0.37))
                    let snd: AlertConfiguration.AlertSound
                    if let f = it["sound"] as? String, !f.isEmpty { snd = .named(f) } else { snd = .default }
                    let cfg = AlarmManager.AlarmConfiguration<AzanAlarmMeta>(
                        schedule: .fixed(Date(timeIntervalSince1970: ms / 1000)), attributes: attrs, sound: snd)
                    do { _ = try await mgr.schedule(id: UUID(), configuration: cfg); n += 1 }
                    catch { NSLog("QD: alarm schedule failed \(error)") }
                }
                NSLog("QD: scheduled \(n) azan alarms")
                call.resolve(["scheduled": n])
            }
            return
        }
        #endif
        call.resolve(["scheduled": 0])
    }

    /// Switch the home-screen icon to match the theme. name nil/"" = the main icon.
    @objc func setIcon(_ call: CAPPluginCall) {
        let raw = call.getString("name") ?? ""
        let name: String? = raw.isEmpty ? nil : raw
        DispatchQueue.main.async {
            guard UIApplication.shared.supportsAlternateIcons else { call.reject("alternate icons not supported"); return }
            if UIApplication.shared.alternateIconName == name { call.resolve(); return }
            UIApplication.shared.setAlternateIconName(name) { err in
                if let err = err { NSLog("QD: setIcon failed \(err)"); call.reject(err.localizedDescription) } else { call.resolve() }
            }
        }
    }

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
