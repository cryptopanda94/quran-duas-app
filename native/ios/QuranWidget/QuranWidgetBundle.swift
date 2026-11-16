import WidgetKit
import SwiftUI

// Shared with the app through the App Group (see WidgetBridgePlugin.swift).
private let appGroup = "group.com.cryptopanda94.quranduas"
private let brand = Color(red: 0.14, green: 0.47, blue: 0.75)          // #2378c0 (Sky)
private let deep  = Color(red: 0.06, green: 0.25, blue: 0.41)          // #0f3f68
private let cream = Color(red: 0.97, green: 0.98, blue: 1.0)           // #f7fbff
private let ink   = Color(red: 0.08, green: 0.19, blue: 0.29)          // #15314a
private let gold  = Color(red: 0.73, green: 0.51, blue: 0.15)          // #b98326
private let skyGrad = LinearGradient(colors: [brand, deep], startPoint: .topLeading, endPoint: .bottomTrailing)
private let paleGold = Color(red: 0.95, green: 0.81, blue: 0.54)      // #f2cf8a
private let nightGrad = LinearGradient(colors: [Color(red: 0.16, green: 0.50, blue: 0.78),
                                                Color(red: 0.08, green: 0.31, blue: 0.50),
                                                Color(red: 0.04, green: 0.18, blue: 0.31)],
                                       startPoint: .topLeading, endPoint: .bottomTrailing)
private let paleGrad = LinearGradient(colors: [Color.white, Color(red: 0.91, green: 0.95, blue: 0.98)], startPoint: .top, endPoint: .bottom)

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
    @ViewBuilder func widgetBackground<B: ShapeStyle>(_ color: B, accessory: Bool = false) -> some View {
        if #available(iOSApplicationExtension 17.0, *) {
            self.containerBackground(for: .widget) { if accessory { Color.clear } else { Rectangle().fill(color) } }
        } else if accessory {
            self
        } else {
            self.padding().background(color)
        }
    }
}

extension View {
    /// Same as widgetBackground, for a background that is a view (gradient plus a soft glow).
    @ViewBuilder func widgetBackgroundView<V: View>(@ViewBuilder _ bg: () -> V) -> some View {
        if #available(iOSApplicationExtension 17.0, *) {
            self.containerBackground(for: .widget) { bg() }
        } else {
            self.padding().background(bg())
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
    var list: [WPrayer] = []
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
                        loc: p.loc, hijri: p.hijri ?? "",
                        list: Array(ps.filter { $0.date > d.addingTimeInterval(1) }.prefix(5)))
        }
    }
}

struct PrayerWidgetView: View {
    @Environment(\.widgetFamily) var family
    let entry: PrayerEntry

    var body: some View {
        content.widgetBackground(skyGrad, accessory: isAccessory(family))
    }

    private func row(_ p: WPrayer, big: Bool) -> some View {
        let isNext = p.t == entry.next?.t
        return HStack {
            Text(p.n).font(.system(size: big ? 19 : 15, weight: isNext ? .bold : .medium))
            Spacer(minLength: 4)
            Text(timeFmt.string(from: p.date)).font(.system(size: big ? 19 : 15, weight: isNext ? .bold : .medium)).monospacedDigit()
        }
        .foregroundColor(isNext ? deep : .white)
        .padding(.horizontal, 10).padding(.vertical, big ? 7 : 4)
        .background(RoundedRectangle(cornerRadius: 9).fill(isNext ? Color.white : Color.white.opacity(0.12)))
    }

    private func nextBlock(_ n: WPrayer, nameSize: CGFloat, timeSize: CGFloat) -> some View {
        VStack(alignment: .leading, spacing: 2) {
            Text("NEXT PRAYER").font(.system(size: 11, weight: .bold)).foregroundColor(.white.opacity(0.8))
            Text(n.n).font(.system(size: nameSize, weight: .bold)).foregroundColor(.white).minimumScaleFactor(0.7).lineLimit(1)
            Text(timeFmt.string(from: n.date)).font(.system(size: timeSize, weight: .semibold)).foregroundColor(.white).monospacedDigit()
            HStack(spacing: 3) { Text("in"); Text(n.date, style: .relative) }
                .font(.system(size: 13)).foregroundColor(.white.opacity(0.9)).lineLimit(1)
        }
    }

    @ViewBuilder var content: some View {
        if let n = entry.next {
            switch family {
            case .accessoryInline:
                Text("\(n.n) \(timeFmt.string(from: n.date))")
            case .accessoryRectangular:
                VStack(alignment: .leading, spacing: 0) {
                    Text("\(n.n)  \(timeFmt.string(from: n.date))").font(.system(size: 17, weight: .bold))
                    Text(n.date, style: .relative).font(.system(size: 14))
                    Text(entry.loc).font(.system(size: 11)).opacity(0.75).lineLimit(1)
                }
            case .systemMedium:
                HStack(spacing: 12) {
                    VStack(alignment: .leading, spacing: 0) {
                        nextBlock(n, nameSize: 30, timeSize: 22)
                        Spacer(minLength: 0)
                        Text(entry.loc).font(.system(size: 11)).foregroundColor(.white.opacity(0.75)).lineLimit(1)
                    }.frame(maxWidth: .infinity, alignment: .leading)
                    VStack(spacing: 3) { ForEach(entry.list, id: \.t) { row($0, big: false) } }
                        .frame(maxWidth: .infinity)
                }
            case .systemLarge:
                VStack(alignment: .leading, spacing: 10) {
                    HStack {
                        Text(entry.loc).font(.system(size: 13, weight: .semibold)).lineLimit(1)
                        Spacer()
                        Text(entry.hijri).font(.system(size: 13)).lineLimit(1)
                    }.foregroundColor(.white.opacity(0.85))
                    nextBlock(n, nameSize: 40, timeSize: 26)
                    VStack(spacing: 6) { ForEach(entry.list, id: \.t) { row($0, big: true) } }
                    Spacer(minLength: 0)
                }
            default:
                VStack(alignment: .leading, spacing: 0) {
                    nextBlock(n, nameSize: 30, timeSize: 22)
                    Spacer(minLength: 0)
                    Text(n.u).font(.system(size: 18)).foregroundColor(.white.opacity(0.85))
                    Text(entry.loc).font(.system(size: 11)).foregroundColor(.white.opacity(0.75)).lineLimit(1)
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
            }
        } else {
            Text(isAccessory(family) ? "Open Quran & Duas" : "Open Quran & Duas and choose your city")
                .font(.system(size: 15, weight: .medium)).foregroundColor(isAccessory(family) ? .primary : .white).multilineTextAlignment(.center)
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
            return [.systemSmall, .systemMedium, .systemLarge, .accessoryRectangular, .accessoryInline]
        }
        return [.systemSmall, .systemMedium, .systemLarge]
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
        if family == .systemLarge {
            content.widgetBackgroundView {
                ZStack {
                    Rectangle().fill(nightGrad)
                    RadialGradient(colors: [Color.white.opacity(0.16), Color.white.opacity(0)],
                                   center: .topTrailing, startRadius: 0, endRadius: 190)
                }
            }
        } else {
            content.widgetBackground(paleGrad, accessory: isAccessory(family))
        }
    }

    /// Arabic over English at one pair of sizes. `fit` makes the texts report their full height,
    /// so ViewThatFits can tell whether this pair fits the widget.
    private func ayahTexts(_ a: WAyah, _ ar: CGFloat, _ en: CGFloat, fit: Bool) -> some View {
        VStack(spacing: 0) {
            Text(a.ar).font(.custom("QDAyah-Regular", fixedSize: ar))
                .multilineTextAlignment(.center)
                .environment(\.layoutDirection, .rightToLeft)
                .foregroundColor(.white)
                .frame(maxWidth: .infinity)
                .fixedSize(horizontal: false, vertical: fit)
            HStack(spacing: 8) {
                Rectangle().fill(paleGold.opacity(0.6)).frame(width: 54, height: 1)
                Rectangle().fill(paleGold).frame(width: 6, height: 6).rotationEffect(.degrees(45))
                Rectangle().fill(paleGold.opacity(0.6)).frame(width: 54, height: 1)
            }
            .padding(.vertical, 9)
            Text(a.en).font(.system(size: en, weight: .regular, design: .serif))
                .multilineTextAlignment(.center)
                .foregroundColor(.white.opacity(0.9))
                .frame(maxWidth: .infinity)
                .fixedSize(horizontal: false, vertical: fit)
        }
    }

    /// The large home-screen widget: the whole verse, as big as it can be shown in full.
    private func largeAyah(_ a: WAyah) -> some View {
        VStack(spacing: 0) {
            HStack {
                Text("✦  AYAH OF THE DAY").font(.system(size: 11, weight: .bold)).tracking(1.5)
                    .foregroundColor(paleGold).lineLimit(1)
                Spacer(minLength: 0)
            }
            ViewThatFits(in: .vertical) {
                ayahTexts(a, 27, 15.5, fit: true)
                ayahTexts(a, 24, 14.5, fit: true)
                ayahTexts(a, 21, 13.5, fit: true)
                ayahTexts(a, 18.5, 12.5, fit: true)
                ayahTexts(a, 16.5, 11.5, fit: true)
                ayahTexts(a, 14.5, 10.5, fit: true)
                ayahTexts(a, 13, 9.5, fit: false).minimumScaleFactor(0.6)
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .padding(.vertical, 6)
            .layoutPriority(1)
            HStack {
                Text(a.ref).font(.system(size: 12.5, weight: .semibold)).foregroundColor(.white).lineLimit(1)
                    .padding(.horizontal, 11).padding(.vertical, 5)
                    .background(Capsule().fill(Color.white.opacity(0.14)))
                Spacer(minLength: 6)
                Text("Quran & Duas").font(.system(size: 11.5, weight: .medium)).foregroundColor(.white.opacity(0.65)).lineLimit(1)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }

    @ViewBuilder var content: some View {
        if let a = entry.ayah {
            switch family {
            case .systemLarge:
                largeAyah(a)
            case .accessoryRectangular:
                VStack(alignment: .leading, spacing: 1) {
                    Text(a.ref).font(.system(size: 12, weight: .semibold)).opacity(0.8)
                    Text(a.en).font(.system(size: 14)).lineLimit(3)
                }
            default:
                let large = false
                VStack(alignment: .center, spacing: large ? 12 : 6) {
                    Text("AYAH OF THE DAY · \(a.ref.uppercased())").font(.system(size: 11, weight: .bold)).foregroundColor(gold).lineLimit(1)
                    Text(a.ar).font(.system(size: large ? 34 : 26, weight: .medium))
                        .multilineTextAlignment(.center)
                        .environment(\.layoutDirection, .rightToLeft)
                        .lineLimit(large ? 6 : 2).minimumScaleFactor(0.6)
                        .foregroundColor(ink)
                    Text(a.en).font(.system(size: large ? 18 : 15))
                        .multilineTextAlignment(.center)
                        .lineLimit(large ? 8 : 3).minimumScaleFactor(0.75)
                        .foregroundColor(ink.opacity(0.85))
                    Spacer(minLength: 0)
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .top)
            }
        } else {
            Text("Open Quran & Duas once to load today's ayah")
                .font(.system(size: 15)).multilineTextAlignment(.center)
                .foregroundColor(family == .systemLarge ? .white : ink)
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
        .description("A verse of the Quran every day, in Arabic and English. The large size shows the whole verse.")
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
