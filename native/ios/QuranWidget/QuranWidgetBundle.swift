import WidgetKit
import SwiftUI

// Shared with the app through the App Group (see WidgetBridgePlugin.swift).
private let appGroup = "group.com.cryptopanda94.quranduas"
private let brand = Color(red: 0.12, green: 0.44, blue: 0.36)          // #1f6f5c
private let cream = Color(red: 0.97, green: 0.95, blue: 0.92)          // #f7f3ea
private let gold  = Color(red: 0.69, green: 0.54, blue: 0.24)          // #b08a3e

// MARK: - Data written by the app

struct WPrayer: Codable { let k: String; let n: String; let u: String; let t: Double
    var date: Date { Date(timeIntervalSince1970: t / 1000) } }
struct WAyah: Codable { let d: String; let ref: String; let ar: String; let en: String }
struct WPayload: Codable { let loc: String; let prayers: [WPrayer]; let ayahs: [WAyah]; let hijri: String? }

private func loadPayload() -> WPayload? {
    guard let s = UserDefaults(suiteName: appGroup)?.string(forKey: "widgetData"),
          let d = s.data(using: .utf8) else { return nil }
    return try? JSONDecoder().decode(WPayload.self, from: d)
}

private func dayKey(_ date: Date) -> String {
    let c = Calendar.current.dateComponents([.year, .month, .day], from: date)
    return String(format: "%04d-%02d-%02d", c.year ?? 0, c.month ?? 0, c.day ?? 0)
}

private let timeFmt: DateFormatter = { let f = DateFormatter(); f.timeStyle = .short; f.dateStyle = .none; return f }()

extension View {
    /// iOS 17+ requires every widget (lock screen ones too) to declare its background.
    @ViewBuilder func widgetBackground(_ color: Color, accessory: Bool = false) -> some View {
        if #available(iOSApplicationExtension 17.0, *) {
            self.containerBackground(for: .widget) { accessory ? Color.clear : color }
        } else if accessory {
            self
        } else {
            self.padding().background(color)
        }
    }
}

private func isAccessory(_ f: WidgetFamily) -> Bool {
    if #available(iOSApplicationExtension 16.0, *) {
        return f == .accessoryInline || f == .accessoryRectangular || f == .accessoryCircular
    }
    return false
}

// MARK: - Next prayer widget

struct PrayerEntry: TimelineEntry {
    let date: Date
    let next: WPrayer?
    let loc: String
    let hijri: String
}

struct PrayerProvider: TimelineProvider {
    func placeholder(in context: Context) -> PrayerEntry {
        PrayerEntry(date: Date(),
                    next: WPrayer(k: "asr", n: "Asr", u: "عصر", t: Date().addingTimeInterval(83 * 60).timeIntervalSince1970 * 1000),
                    loc: "Your city", hijri: "")
    }
    func getSnapshot(in context: Context, completion: @escaping (PrayerEntry) -> Void) {
        completion(entries(from: Date()).first ?? placeholder(in: context))
    }
    func getTimeline(in context: Context, completion: @escaping (Timeline<PrayerEntry>) -> Void) {
        let es = entries(from: Date())
        if es.isEmpty {
            let e = PrayerEntry(date: Date(), next: nil, loc: "", hijri: "")
            completion(Timeline(entries: [e], policy: .after(Date().addingTimeInterval(3600))))
        } else {
            completion(Timeline(entries: es, policy: .atEnd))
        }
    }
    /// One entry now, then a new one at every upcoming prayer time so the widget moves on by itself.
    private func entries(from now: Date) -> [PrayerEntry] {
        guard let p = loadPayload() else { return [] }
        let ps = p.prayers.sorted { $0.t < $1.t }
        let times = [now] + ps.map { $0.date }.filter { $0 > now }
        return times.prefix(15).map { d in
            PrayerEntry(date: d, next: ps.first { $0.date > d.addingTimeInterval(1) },
                        loc: p.loc, hijri: p.hijri ?? "")
        }
    }
}

struct PrayerWidgetView: View {
    @Environment(\.widgetFamily) var family
    let entry: PrayerEntry

    var body: some View {
        content.widgetBackground(entry.next == nil ? cream : brand, accessory: isAccessory(family))
    }

    @ViewBuilder var content: some View {
        if let n = entry.next {
            switch family {
            case .accessoryInline:
                Text("\(n.n) \(timeFmt.string(from: n.date))")
            case .accessoryRectangular:
                VStack(alignment: .leading, spacing: 1) {
                    Text("NEXT PRAYER").font(.caption2).opacity(0.8)
                    Text("\(n.n)  \(timeFmt.string(from: n.date))").font(.headline)
                    Text(n.date, style: .relative).font(.caption)
                }
            default:
                VStack(alignment: .leading, spacing: 3) {
                    Text("NEXT PRAYER").font(.caption2).bold().foregroundColor(.white.opacity(0.8))
                    Text(n.n).font(.title2).bold().foregroundColor(.white)
                    Text(n.u).font(.subheadline).foregroundColor(.white.opacity(0.85))
                    Text(timeFmt.string(from: n.date)).font(.headline).foregroundColor(.white)
                    HStack(spacing: 3) {
                        Text("in").font(.caption)
                        Text(n.date, style: .relative).font(.caption)
                    }.foregroundColor(.white.opacity(0.9))
                    Spacer(minLength: 0)
                    Text(entry.loc).font(.caption2).foregroundColor(.white.opacity(0.75)).lineLimit(1)
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
            }
        } else {
            Text(isAccessory(family) ? "Open Quran & Duas" : "Open Quran & Duas and choose your city")
                .font(.caption).multilineTextAlignment(.center)
        }
    }
}

struct PrayerWidget: Widget {
    let kind = "PrayerWidget"
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: PrayerProvider()) { entry in
            PrayerWidgetView(entry: entry)
        }
        .configurationDisplayName("Next Prayer")
        .description("Your next prayer time and a countdown (Shia Ithna Ashari times).")
        .supportedFamilies(prayerFamilies)
    }
    private var prayerFamilies: [WidgetFamily] {
        if #available(iOSApplicationExtension 16.0, *) {
            return [.systemSmall, .accessoryRectangular, .accessoryInline]
        }
        return [.systemSmall]
    }
}

// MARK: - Ayah of the day widget

struct AyahEntry: TimelineEntry {
    let date: Date
    let ayah: WAyah?
}

struct AyahProvider: TimelineProvider {
    func placeholder(in context: Context) -> AyahEntry {
        AyahEntry(date: Date(), ayah: WAyah(d: "", ref: "Ash-Sharh 94:5–6",
                                            ar: "فَإِنَّ مَعَ ٱلْعُسْرِ يُسْرًا",
                                            en: "For indeed, with hardship [will be] ease."))
    }
    func getSnapshot(in context: Context, completion: @escaping (AyahEntry) -> Void) {
        completion(entry(for: Date()) ?? placeholder(in: context))
    }
    func getTimeline(in context: Context, completion: @escaping (Timeline<AyahEntry>) -> Void) {
        let cal = Calendar.current
        var es: [AyahEntry] = []
        for i in 0..<8 {
            let day = i == 0 ? Date() : cal.startOfDay(for: cal.date(byAdding: .day, value: i, to: Date())!)
            if let e = entry(for: day) { es.append(e) }
        }
        if es.isEmpty { es = [placeholder(in: context)] }
        completion(Timeline(entries: es, policy: .atEnd))
    }
    private func entry(for date: Date) -> AyahEntry? {
        guard let p = loadPayload() else { return nil }
        let key = dayKey(date)
        return AyahEntry(date: date, ayah: p.ayahs.first { $0.d == key } ?? p.ayahs.last)
    }
}

struct AyahWidgetView: View {
    @Environment(\.widgetFamily) var family
    let entry: AyahEntry

    var body: some View {
        content.widgetBackground(cream, accessory: isAccessory(family))
    }

    @ViewBuilder var content: some View {
        if let a = entry.ayah {
            switch family {
            case .accessoryRectangular:
                VStack(alignment: .leading, spacing: 1) {
                    Text(a.ref).font(.caption2).opacity(0.8)
                    Text(a.en).font(.caption).lineLimit(3)
                }
            default:
                VStack(alignment: .leading, spacing: 6) {
                    Text("AYAH OF THE DAY · \(a.ref.uppercased())").font(.caption2).bold().foregroundColor(gold).lineLimit(1)
                    Text(a.ar).font(.system(size: family == .systemLarge ? 24 : 19))
                        .multilineTextAlignment(.trailing)
                        .frame(maxWidth: .infinity, alignment: .trailing)
                        .environment(\.layoutDirection, .rightToLeft)
                        .lineLimit(family == .systemLarge ? 5 : 2)
                        .foregroundColor(Color(red: 0.16, green: 0.15, blue: 0.13))
                    Text(a.en).font(.footnote)
                        .lineLimit(family == .systemLarge ? 8 : 3)
                        .foregroundColor(Color(red: 0.25, green: 0.23, blue: 0.2))
                    Spacer(minLength: 0)
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
            }
        } else {
            Text("Open Quran & Duas once to load today's ayah")
                .font(.caption).multilineTextAlignment(.center)
        }
    }
}

struct AyahWidget: Widget {
    let kind = "AyahWidget"
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: AyahProvider()) { entry in
            AyahWidgetView(entry: entry)
        }
        .configurationDisplayName("Ayah of the Day")
        .description("A verse of the Quran every day, in Arabic and English.")
        .supportedFamilies(ayahFamilies)
    }
    private var ayahFamilies: [WidgetFamily] {
        if #available(iOSApplicationExtension 16.0, *) {
            return [.systemMedium, .systemLarge, .accessoryRectangular]
        }
        return [.systemMedium, .systemLarge]
    }
}

// MARK: - Bundle

@main
struct QuranWidgetBundle: WidgetBundle {
    var body: some Widget {
        PrayerWidget()
        AyahWidget()
    }
}
