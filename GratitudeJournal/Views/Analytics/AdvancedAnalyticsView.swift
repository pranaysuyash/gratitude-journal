//
//  AdvancedAnalyticsView.swift
//  GratitudeJournal
//
//  Advanced analytics with word frequency, relationships, and life events
//

import SwiftUI
import SwiftData

struct AdvancedAnalyticsView: View {
    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject var themeManager: ThemeManager

    @Query(sort: \JournalEntry.date, order: .reverse) private var entries: [JournalEntry]

    @State private var selectedTab = 0

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                // Tab selector
                Picker("Analytics", selection: $selectedTab) {
                    Text("Words").tag(0)
                    Text("People").tag(1)
                    Text("Timeline").tag(2)
                    Text("On This Day").tag(3)
                }
                .pickerStyle(.segmented)
                .padding()

                // Content based on selected tab
                TabView(selection: $selectedTab) {
                    WordFrequencyView(entries: entries)
                        .tag(0)

                    RelationshipNetworkView(entries: entries)
                        .tag(1)

                    LifeEventsTimelineView(entries: entries)
                        .tag(2)

                    OnThisDayView(entries: entries)
                        .tag(3)
                }
                .tabViewStyle(.page(indexDisplayMode: .never))
            }
            .background(themeManager.currentTheme.backgroundColor.ignoresSafeArea())
            .navigationTitle("Advanced Analytics")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") { dismiss() }
                }
            }
        }
    }
}

// MARK: - Word Frequency View

struct WordFrequencyView: View {
    @EnvironmentObject var themeManager: ThemeManager
    let entries: [JournalEntry]

    private var wordFrequency: [(String, Int)] {
        let allText = entries.map { $0.content }.joined(separator: " ")
        let words = allText.lowercased()
            .components(separatedBy: .whitespacesAndNewlines)
            .filter { $0.count > 3 } // Only words longer than 3 characters

        // Common words to exclude
        let stopWords = Set(["that", "this", "with", "from", "have", "been", "were", "will", "your", "would", "there", "their", "what", "about", "which", "when", "make", "like", "just", "know", "take", "into", "them", "than", "then", "some"])

        let filtered = words.filter { !stopWords.contains($0) }
        let frequency = Dictionary(grouping: filtered, by: { $0 })
            .mapValues { $0.count }
            .sorted { $0.value > $1.value }
            .prefix(30)

        return Array(frequency)
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                Text("Most Used Words")
                    .font(.title2)
                    .fontWeight(.bold)
                    .padding()

                // Word cloud style display
                FlowLayout(spacing: 12) {
                    ForEach(wordFrequency, id: \.0) { word, count in
                        WordBubble(word: word, count: count, maxCount: wordFrequency.first?.1 ?? 1)
                    }
                }
                .padding()

                // List view
                VStack(spacing: 12) {
                    ForEach(wordFrequency.prefix(20), id: \.0) { word, count in
                        HStack {
                            Text(word.capitalized)
                                .font(.body)
                                .foregroundColor(themeManager.currentTheme.textPrimary)

                            Spacer()

                            Text("\(count)")
                                .font(.headline)
                                .foregroundColor(themeManager.currentTheme.accentColor)

                            // Bar
                            GeometryReader { geometry in
                                ZStack(alignment: .leading) {
                                    RoundedRectangle(cornerRadius: 4)
                                        .fill(themeManager.currentTheme.primaryColor.opacity(0.2))

                                    RoundedRectangle(cornerRadius: 4)
                                        .fill(themeManager.currentTheme.primaryColor)
                                        .frame(width: geometry.size.width * (Double(count) / Double(wordFrequency.first?.1 ?? 1)))
                                }
                            }
                            .frame(width: 100, height: 8)
                        }
                        .padding(.horizontal)
                    }
                }
                .padding()
                .background(themeManager.currentTheme.cardBackground)
                .cornerRadius(16)
                .padding()
            }
        }
    }
}

struct WordBubble: View {
    @EnvironmentObject var themeManager: ThemeManager
    let word: String
    let count: Int
    let maxCount: Int

    private var fontSize: CGFloat {
        let ratio = Double(count) / Double(maxCount)
        return 12 + (ratio * 24) // 12pt to 36pt
    }

    var body: some View {
        Text(word)
            .font(.system(size: fontSize, weight: .medium))
            .foregroundColor(themeManager.currentTheme.accentColor)
            .padding(.horizontal, 12)
            .padding(.vertical, 8)
            .background(themeManager.currentTheme.primaryColor.opacity(0.2))
            .cornerRadius(20)
    }
}

// MARK: - Relationship Network View

struct RelationshipNetworkView: View {
    @EnvironmentObject var themeManager: ThemeManager
    let entries: [JournalEntry]

    private var peopleMentioned: [(String, Int)] {
        let allPeople = entries.flatMap { $0.peopleMentioned }
        let frequency = Dictionary(grouping: allPeople, by: { $0 })
            .mapValues { $0.count }
            .sorted { $0.value > $1.value }

        return Array(frequency)
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                Text("People You're Grateful For")
                    .font(.title2)
                    .fontWeight(.bold)
                    .padding()

                if peopleMentioned.isEmpty {
                    VStack(spacing: 12) {
                        Text("👥")
                            .font(.system(size: 60))
                        Text("No people mentioned yet")
                            .foregroundColor(.secondary)
                    }
                    .padding()
                } else {
                    // Top 3 people
                    VStack(spacing: 16) {
                        ForEach(Array(peopleMentioned.prefix(3).enumerated()), id: \.1.0) { index, person in
                            TopPersonCard(person: person.0, count: person.1, rank: index + 1)
                        }
                    }
                    .padding()

                    // All people list
                    VStack(spacing: 12) {
                        Text("All Mentioned")
                            .font(.headline)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .padding(.horizontal)

                        ForEach(peopleMentioned, id: \.0) { person, count in
                            HStack {
                                Text(person)
                                    .font(.body)

                                Spacer()

                                Text("\(count) times")
                                    .font(.caption)
                                    .foregroundColor(.secondary)

                                Image(systemName: "heart.fill")
                                    .foregroundColor(.pink)
                            }
                            .padding()
                            .background(themeManager.currentTheme.cardBackground)
                            .cornerRadius(12)
                        }
                    }
                    .padding()
                }
            }
        }
    }
}

struct TopPersonCard: View {
    @EnvironmentObject var themeManager: ThemeManager
    let person: String
    let count: Int
    let rank: Int

    private var medal: String {
        switch rank {
        case 1: return "🥇"
        case 2: return "🥈"
        case 3: return "🥉"
        default: return ""
        }
    }

    var body: some View {
        HStack {
            Text(medal)
                .font(.system(size: 40))

            VStack(alignment: .leading, spacing: 4) {
                Text(person)
                    .font(.headline)

                Text("Mentioned \(count) times")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }

            Spacer()
        }
        .padding()
        .background(themeManager.currentTheme.cardBackground)
        .cornerRadius(16)
        .shadow(color: .black.opacity(0.05), radius: 8, x: 0, y: 4)
    }
}

// MARK: - Life Events Timeline

struct LifeEventsTimelineView: View {
    @EnvironmentObject var themeManager: ThemeManager
    let entries: [JournalEntry]

    private var yearGroups: [(String, [JournalEntry])] {
        let calendar = Calendar.current
        let grouped = Dictionary(grouping: entries) { entry in
            String(calendar.component(.year, from: entry.date))
        }

        return grouped.sorted { $0.key > $1.key }
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                Text("Your Gratitude Journey")
                    .font(.title2)
                    .fontWeight(.bold)
                    .padding()

                ForEach(yearGroups, id: \.0) { year, yearEntries in
                    VStack(alignment: .leading, spacing: 12) {
                        HStack {
                            Text(year)
                                .font(.title3)
                                .fontWeight(.semibold)

                            Spacer()

                            Text("\(yearEntries.count) entries")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                        .padding(.horizontal)

                        // Month breakdown
                        let months = Dictionary(grouping: yearEntries) { entry in
                            Calendar.current.component(.month, from: entry.date)
                        }

                        ForEach(months.keys.sorted(by: >), id: \.self) { month in
                            let monthEntries = months[month] ?? []
                            MonthTimelineCard(month: month, entries: monthEntries)
                        }
                    }
                }
            }
            .padding()
        }
    }
}

struct MonthTimelineCard: View {
    @EnvironmentObject var themeManager: ThemeManager
    let month: Int
    let entries: [JournalEntry]

    private var monthName: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "MMMM"
        let date = Calendar.current.date(from: DateComponents(month: month))!
        return formatter.string(from: date)
    }

    private var mostCommonMood: MoodType {
        let moods = entries.map { $0.mood }
        let frequency = Dictionary(grouping: moods, by: { $0 })
        return frequency.max(by: { $0.value.count < $1.value.count })?.key ?? .grateful
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(mostCommonMood.emoji)
                    .font(.title)

                VStack(alignment: .leading, spacing: 2) {
                    Text(monthName)
                        .font(.subheadline)
                        .fontWeight(.medium)

                    Text("\(entries.count) entries")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }

                Spacer()

                Text(mostCommonMood.rawValue)
                    .font(.caption)
                    .foregroundColor(themeManager.currentTheme.accentColor)
            }
        }
        .padding()
        .background(themeManager.currentTheme.cardBackground)
        .cornerRadius(12)
        .padding(.horizontal)
    }
}

// MARK: - On This Day View

struct OnThisDayView: View {
    @EnvironmentObject var themeManager: ThemeManager
    let entries: [JournalEntry]

    private var onThisDayEntries: [JournalEntry] {
        let calendar = Calendar.current
        let today = Date()
        let todayDay = calendar.component(.day, from: today)
        let todayMonth = calendar.component(.month, from: today)

        return entries.filter { entry in
            let entryDay = calendar.component(.day, from: entry.date)
            let entryMonth = calendar.component(.month, from: entry.date)
            let entryYear = calendar.component(.year, from: entry.date)
            let currentYear = calendar.component(.year, from: today)

            return entryDay == todayDay && entryMonth == todayMonth && entryYear != currentYear
        }.sorted { $0.date > $1.date }
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                VStack(spacing: 12) {
                    Text("📅")
                        .font(.system(size: 60))

                    Text("On This Day")
                        .font(.title2)
                        .fontWeight(.bold)

                    Text("Memories from past years")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }
                .padding()

                if onThisDayEntries.isEmpty {
                    VStack(spacing: 12) {
                        Text("No entries from this day in previous years")
                            .foregroundColor(.secondary)
                            .multilineTextAlignment(.center)
                            .padding()

                        Text("Keep journaling and you'll build beautiful memories!")
                            .font(.caption)
                            .foregroundColor(.secondary)
                            .multilineTextAlignment(.center)
                    }
                    .padding()
                } else {
                    ForEach(onThisDayEntries) { entry in
                        OnThisDayCard(entry: entry)
                    }
                }
            }
            .padding()
        }
    }
}

struct OnThisDayCard: View {
    @EnvironmentObject var themeManager: ThemeManager
    let entry: JournalEntry

    private var yearsAgo: Int {
        Calendar.current.dateComponents([.year], from: entry.date, to: Date()).year ?? 0
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text(entry.mood.emoji)
                    .font(.title)

                VStack(alignment: .leading, spacing: 4) {
                    Text("\(yearsAgo) year\(yearsAgo == 1 ? "" : "s") ago")
                        .font(.headline)
                        .foregroundColor(themeManager.currentTheme.accentColor)

                    Text(entry.date.formatted(date: .long, time: .omitted))
                        .font(.caption)
                        .foregroundColor(.secondary)
                }

                Spacer()
            }

            Text(entry.content)
                .font(.body)
                .foregroundColor(themeManager.currentTheme.textPrimary)

            if !entry.tags.isEmpty {
                HStack {
                    ForEach(entry.tags.prefix(3), id: \.self) { tag in
                        Text("#\(tag)")
                            .font(.caption)
                            .foregroundColor(themeManager.currentTheme.accentColor)
                    }
                }
            }
        }
        .padding()
        .background(themeManager.currentTheme.cardBackground)
        .cornerRadius(16)
        .shadow(color: .black.opacity(0.05), radius: 8, x: 0, y: 4)
    }
}

#Preview {
    AdvancedAnalyticsView()
        .environmentObject(ThemeManager())
        .modelContainer(for: [JournalEntry.self])
}
