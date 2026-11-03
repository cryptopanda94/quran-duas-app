import Foundation
import Capacitor
import WidgetKit

/// JS: Capacitor.registerPlugin('WidgetBridge').update({ data: '<json>' })
/// Saves the next prayer times + ayah of the day where the widgets can read them,
/// then asks iOS to redraw the widgets.
@objc(WidgetBridgePlugin)
public class WidgetBridgePlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "WidgetBridgePlugin"
    public let jsName = "WidgetBridge"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "update", returnType: CAPPluginReturnPromise)
    ]

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
}
