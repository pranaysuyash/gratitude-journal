//
//  GratitudeWidget.swift
//  GratitudeJournalWidget
//
//  Home screen widget for quick access
//  © 2024 Gratitude Journal. All Rights Reserved.
//

import WidgetKit
import SwiftUI
import SwiftData

struct Provider: TimelineProvider {
    func placeholder(in context: Context) -> SimpleEntry {
        SimpleEntry(date: Date(), entry: nil, streak: 0, quote: GratitudeQuote.random())
    }

    func getSnapshot(in context: Context, completion: @escaping (SimpleEntry) -> ()) {
        let entry = SimpleEntry(date: Date(), entry: nil, streak: 0, quote: GratitudeQuote.random())
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<Entry>) -> ()) {
        Task {
            let entries = await generateEntries()
            let timeline = Timeline(entries: entries, policy: .atEnd)
            completion(timeline)
        }
    }

    @MainActor
    private func generateEntries() async -> [SimpleEntry] {
        var entries: [SimpleEntry] = []
        let currentDate = Date()

        // Fetch latest entry and streak
        let modelContainer = try? ModelContainer(for: JournalEntry.self)
        let context = modelContainer?.mainContext

        var latestEntry: JournalEntry?
        var streak = 0

        if let context = context {
            let descriptor = FetchDescriptor<JournalEntry>(sortBy: [SortDescriptor(\.date, order: .reverse)])
            let allEntries = try? context.fetch(descriptor)
            latestEntry = allEntries?.first
            streak = StreakManager.calculateStreak(from: allEntries ?? [])
        }

        // Create entries for next 4 hours
        for hourOffset in 0..<4 {
            let entryDate = Calendar.current.date(byAdding: .hour, value: hourOffset, to: currentDate)!
            let entry = SimpleEntry(
                date: entryDate,
                entry: latestEntry,
                streak: streak,
                quote: GratitudeQuote.random()
            )
            entries.append(entry)
        }

        return entries
    }
}

struct SimpleEntry: TimelineEntry {
    let date: Date
    let entry: JournalEntry?
    let streak: Int
    let quote: GratitudeQuote
}

struct GratitudeWidgetEntryView : View {
    @Environment(\.widgetFamily) var family
    var entry: Provider.Entry

    var body: some View {
        switch family {
        case .systemSmall:
            SmallWidgetView(entry: entry)
        case .systemMedium:
            MediumWidgetView(entry: entry)
        case .systemLarge:
            LargeWidgetView(entry: entry)
        case .accessoryCircular:
            CircularWidgetView(entry: entry)
        case .accessoryRectangular:
            RectangularWidgetView(entry: entry)
        case .accessoryInline:
            InlineWidgetView(entry: entry)
        default:
            SmallWidgetView(entry: entry)
        }
    }
}

// MARK: - Small Widget

struct SmallWidgetView: View {
    let entry: SimpleEntry

    var body: some View {
        ZStack {
            LinearGradient(
                colors: [Color.blue.opacity(0.3), Color.purple.opacity(0.3)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )

            VStack(spacing: 8) {
                Image(systemName: "heart.fill")
                    .font(.title)
                    .foregroundColor(.white)

                Text("\(entry.streak)")
                    .font(.system(size: 36, weight: .bold))
                    .foregroundColor(.white)

                Text("Day Streak")
                    .font(.caption)
                    .foregroundColor(.white.opacity(0.8))

                if let lastEntry = entry.entry {
                    Text(lastEntry.mood.emoji)
                        .font(.title3)
                }
            }
            .padding()
        }
    }
}

// MARK: - Medium Widget

struct MediumWidgetView: View {
    let entry: SimpleEntry

    var body: some View {
        ZStack {
            LinearGradient(
                colors: [Color.blue.opacity(0.3), Color.purple.opacity(0.3)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )

            HStack {
                VStack(alignment: .leading, spacing: 8) {
                    HStack {
                        Image(systemName: "flame.fill")
                            .foregroundColor(.orange)
                        Text("\(entry.streak) day streak")
                            .font(.headline)
                            .foregroundColor(.white)
                    }

                    if let lastEntry = entry.entry {
                        Text(lastEntry.content)
                            .font(.caption)
                            .foregroundColor(.white.opacity(0.9))
                            .lineLimit(3)

                        Text(lastEntry.date.formatted(date: .abbreviated, time: .omitted))
                            .font(.caption2)
                            .foregroundColor(.white.opacity(0.7))
                    } else {
                        Text("Start your gratitude journey")
                            .font(.caption)
                            .foregroundColor(.white.opacity(0.9))
                    }
                }
                .padding()

                Spacer()
            }
        }
    }
}

// MARK: - Large Widget

struct LargeWidgetView: View {
    let entry: SimpleEntry

    var body: some View {
        ZStack {
            LinearGradient(
                colors: [Color.blue.opacity(0.3), Color.purple.opacity(0.3)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )

            VStack(alignment: .leading, spacing: 12) {
                HStack {
                    Image(systemName: "heart.fill")
                        .font(.title2)
                        .foregroundColor(.pink)

                    Text("Gratitude Journal")
                        .font(.title3)
                        .fontWeight(.bold)
                        .foregroundColor(.white)

                    Spacer()

                    HStack {
                        Image(systemName: "flame.fill")
                            .foregroundColor(.orange)
                        Text("\(entry.streak)")
                            .font(.headline)
                            .foregroundColor(.white)
                    }
                }

                Divider()
                    .background(Color.white.opacity(0.3))

                VStack(alignment: .leading, spacing: 8) {
                    Text("Today's Inspiration")
                        .font(.subheadline)
                        .foregroundColor(.white.opacity(0.8))

                    Text(entry.quote.text)
                        .font(.body)
                        .foregroundColor(.white)
                        .lineLimit(4)

                    Text("- \(entry.quote.author)")
                        .font(.caption)
                        .foregroundColor(.white.opacity(0.7))
                        .italic()
                }

                Spacer()

                if let lastEntry = entry.entry {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Latest Entry")
                            .font(.caption)
                            .foregroundColor(.white.opacity(0.8))

                        HStack {
                            Text(lastEntry.mood.emoji)
                                .font(.title3)

                            Text(lastEntry.content)
                                .font(.caption)
                                .foregroundColor(.white)
                                .lineLimit(2)
                        }
                    }
                }
            }
            .padding()
        }
    }
}

// MARK: - Lock Screen Widgets (iOS 16+)

struct CircularWidgetView: View {
    let entry: SimpleEntry

    var body: some View {
        ZStack {
            AccessoryWidgetBackground()

            VStack(spacing: 2) {
                Image(systemName: "heart.fill")
                    .font(.caption)

                Text("\(entry.streak)")
                    .font(.headline)
                    .fontWeight(.bold)
            }
        }
    }
}

struct RectangularWidgetView: View {
    let entry: SimpleEntry

    var body: some View {
        HStack {
            Image(systemName: "flame.fill")
                .foregroundColor(.orange)

            VStack(alignment: .leading) {
                Text("Gratitude Streak")
                    .font(.caption2)

                Text("\(entry.streak) days")
                    .font(.headline)
                    .fontWeight(.bold)
            }

            Spacer()
        }
        .padding(.horizontal, 8)
    }
}

struct InlineWidgetView: View {
    let entry: SimpleEntry

    var body: some View {
        HStack {
            Image(systemName: "heart.fill")
            Text("\(entry.streak) day gratitude streak")
        }
    }
}

// MARK: - Widget Configuration

@main
struct GratitudeWidget: Widget {
    let kind: String = "GratitudeWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            GratitudeWidgetEntryView(entry: entry)
                .containerBackground(.fill.tertiary, for: .widget)
        }
        .configurationDisplayName("Gratitude Tracker")
        .description("Track your gratitude streak and see your latest entry.")
        .supportedFamilies([
            .systemSmall,
            .systemMedium,
            .systemLarge,
            .accessoryCircular,
            .accessoryRectangular,
            .accessoryInline
        ])
    }
}

// MARK: - Widget Bundle

@main
struct GratitudeWidgetBundle: WidgetBundle {
    var body: some Widget {
        GratitudeWidget()
        QuoteWidget()
        StatWidget()
    }
}

// MARK: - Quote Widget

struct QuoteWidget: Widget {
    let kind: String = "QuoteWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            QuoteWidgetView(entry: entry)
                .containerBackground(.fill.tertiary, for: .widget)
        }
        .configurationDisplayName("Daily Quote")
        .description("Get inspired with daily gratitude quotes.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}

struct QuoteWidgetView: View {
    let entry: SimpleEntry

    var body: some View {
        ZStack {
            LinearGradient(
                colors: [Color.purple.opacity(0.4), Color.pink.opacity(0.4)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )

            VStack(spacing: 12) {
                Image(systemName: "quote.opening")
                    .font(.title2)
                    .foregroundColor(.white.opacity(0.8))

                Text(entry.quote.text)
                    .font(.body)
                    .foregroundColor(.white)
                    .multilineTextAlignment(.center)
                    .lineLimit(5)

                Text("- \(entry.quote.author)")
                    .font(.caption)
                    .foregroundColor(.white.opacity(0.8))
                    .italic()
            }
            .padding()
        }
    }
}

// MARK: - Stats Widget

struct StatWidget: Widget {
    let kind: String = "StatWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            StatWidgetView(entry: entry)
                .containerBackground(.fill.tertiary, for: .widget)
        }
        .configurationDisplayName("Gratitude Stats")
        .description("View your gratitude statistics at a glance.")
        .supportedFamilies([.systemSmall])
    }
}

struct StatWidgetView: View {
    let entry: SimpleEntry

    var body: some View {
        ZStack {
            LinearGradient(
                colors: [Color.green.opacity(0.4), Color.teal.opacity(0.4)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )

            VStack(spacing: 8) {
                Image(systemName: "chart.bar.fill")
                    .font(.title2)
                    .foregroundColor(.white)

                VStack(spacing: 4) {
                    Text("\(entry.streak)")
                        .font(.system(size: 32, weight: .bold))
                        .foregroundColor(.white)

                    Text("Current Streak")
                        .font(.caption2)
                        .foregroundColor(.white.opacity(0.8))
                }

                if let lastEntry = entry.entry {
                    HStack {
                        Text(lastEntry.mood.emoji)
                        Text("Today")
                            .font(.caption2)
                            .foregroundColor(.white.opacity(0.8))
                    }
                }
            }
            .padding()
        }
    }
}

#Preview(as: .systemSmall) {
    GratitudeWidget()
} timeline: {
    SimpleEntry(date: .now, entry: nil, streak: 15, quote: GratitudeQuote.random())
}
