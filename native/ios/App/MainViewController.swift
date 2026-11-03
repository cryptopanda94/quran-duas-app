import UIKit
import WebKit
import AVFoundation
import Capacitor

/// Replaces Capacitor's default view controller (set in Main.storyboard by `npm run native:setup`).
/// - registers the WidgetBridge plugin (app -> widgets data)
/// - lets the Quran recitation keep playing with the screen locked or the app in the background
class MainViewController: CAPBridgeViewController {

    override func capacitorDidLoad() {
        bridge?.registerPluginInstance(WidgetBridgePlugin())
        let session = AVAudioSession.sharedInstance()
        try? session.setCategory(.playback, mode: .spokenAudio, options: [])
        try? session.setActive(true)
        Self.installAzanSound()
    }

    /// Notification sounds must live in Library/Sounds (or the bundle root).
    /// The azan clip ships inside the web folder, so copy it there once.
    static func installAzanSound() {
        let fm = FileManager.default
        guard let src = Bundle.main.url(forResource: "azan_short", withExtension: "wav", subdirectory: "public"),
              let lib = fm.urls(for: .libraryDirectory, in: .userDomainMask).first else { return }
        let dir = lib.appendingPathComponent("Sounds", isDirectory: true)
        let dst = dir.appendingPathComponent("azan_short.wav")
        if fm.fileExists(atPath: dst.path) { return }
        try? fm.createDirectory(at: dir, withIntermediateDirectories: true)
        try? fm.copyItem(at: src, to: dst)
    }

    override func webViewConfiguration(for instanceConfiguration: InstanceConfiguration) -> WKWebViewConfiguration {
        let config = super.webViewConfiguration(for: instanceConfiguration)
        config.allowsInlineMediaPlayback = true
        // allow the player to move on to the next verse / surah without a new tap
        config.mediaTypesRequiringUserActionForPlayback = []
        return config
    }
}
