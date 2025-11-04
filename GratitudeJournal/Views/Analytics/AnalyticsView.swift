//
//  AnalyticsView.swift
//  GratitudeJournal
//
//  Analytics and insights dashboard
//

import SwiftUI
import SwiftData
import Charts

struct AnalyticsView: View {
    @Environment(\.modelContext) private var modelContext
    @EnvironmentObject var themeManager: ThemeManager

    @Query(sort: \JournalEntry.date, order: .reverse) private var entries: [JournalEntry]
    @Query private var badges: [Badge]

    @State private var selectedTimeRange: TimeRange = .month
    @State private var showBadgesView = false

    private var currentStreak: Int {
        StreakManager.calculateStreak(from: entries)
    }

    private var longestStreak: Int {
        StreakManager.longestStreak(from: entries)
    }

    private var totalEntries: Int {
        entries.count
    }

    private var thisWeekEntries: Int {
        StreakManager.entriesThisWeek(from: entries)
    }

    private var thisMonthEntries: Int {
        StreakManager.entriesThisMonth(from: entries)
    }

    private var averageWords: Int {
        StreakManager.averageWordsPerEntry(from: entries)
    }

    private var totalWritingTime: TimeInterval {
        StreakManager.totalWritingTime(from: entries)
    }

    private var mostUsedMood: MoodType? {
        StreakManager.mostUsedMood(from: entries)
    }

    private var gratitudeScore: Double {
        StreakManager.gratitudeScore(from: entries)
    }

    private var unlockedBadgesCount: Int {
        badges.filter { $0.isUnlocked }.count
    }

    private var totalBadgesCount: Int {
        badges.count
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 24) {
                    // Streak Section
                    streakSection

                    // Quick Stats Grid
                    statsGrid

                    // Time Range Selector
                    timeRangeSelector

                    // Mood Distribution Chart
                    moodChartSection

                    // Entry Timeline
                    entryTimelineSection

                    // Top Tags
                    topTagsSection

                    // Badges Progress
                    badgesSection

                    // Insights
                    insightsSection
                }
                .padding()
            }
            .background(
                LinearGradient(
                    colors: themeManager.currentTheme.gradientColors,
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
                .ignoresSafeArea()
            )
            .navigationTitle("Insights")
            .sheet(isPresented: $showBadgesView) {
                BadgesView()
            }
        }
    }

    // MARK: - View Components

    private var streakSection: some View {
        VStack(spacing: 16) {
            HStack(spacing: 20) {
                // Current Streak
                VStack(spacing: 8) {
                    Image(systemName: "flame.fill")
                        .font(.system(size: 40))
                        .foregroundColor(.orange)

                    Text("\(currentStreak)")
                        .font(.system(size: 36, weight: .bold))
                        .foregroundColor(themeManager.currentTheme.textPrimary)

                    Text("Day Streak")
                        .font(.caption)
                        .foregroundColor(themeManager.currentTheme.textSecondary)
                }
                .frame(maxWidth: .infinity)
                .padding()
                .background(themeManager.currentTheme.cardBackground)
                .cornerRadius(16)

                // Longest Streak
                VStack(spacing: 8) {
                    Image(systemName: "crown.fill")
                        .font(.system(size: 40))
                        .foregroundColor(.yellow)

                    Text("\(longestStreak)")
                        .font(.system(size: 36, weight: .bold))
                        .foregroundColor(themeManager.currentTheme.textPrimary)

                    Text("Best Streak")
                        .font(.caption)
                        .foregroundColor(themeManager.currentTheme.textSecondary)
                }
                .frame(maxWidth: .infinity)
                .padding()
                .background(themeManager.currentTheme.cardBackground)
                .cornerRadius(16)
            }
            .shadow(color: .black.opacity(0.05), radius: 8, x: 0, y: 4)
        }
    }

    private var statsGrid: some View {
        LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
            AnalyticsStatCard(
                title: "Total Entries",
                value: "\(totalEntries)",
                icon: "book.fill",
                color: themeManager.currentTheme.primaryColor
            )

            AnalyticsStatCard(
                title: "This Week",
                value: "\(thisWeekEntries)",
                icon: "calendar.badge.clock",
                color: themeManager.currentTheme.secondaryColor
            )

            AnalyticsStatCard(
                title: "Avg Words",
                value: "\(averageWords)",
                icon: "text.alignleft",
                color: themeManager.currentTheme.accentColor
            )

            AnalyticsStatCard(
                title: "Writing Time",
                value: formatTotalTime(totalWritingTime),
                icon: "clock.fill",
                color: Color.moodPeaceful
            )

            AnalyticsStatCard(
                title: "Gratitude Score",
                value: String(format: "%.1f%%", gratitudeScore * 100),
                icon: "heart.fill",
                color: Color.moodGrateful
            )

            AnalyticsStatCard(
                title: "Badges",
                value: "\(unlockedBadgesCount)/\(totalBadgesCount)",
                icon: "star.fill",
                color: Color.moodJoyful
            )
        }
    }

    private var timeRangeSelector: some View {
        HStack(spacing: 12) {
            ForEach(TimeRange.allCases, id: \.self) { range in
                Button(action: { selectedTimeRange = range }) {
                    Text(range.rawValue)
                        .font(.subheadline)
                        .fontWeight(selectedTimeRange == range ? .semibold : .regular)
                        .foregroundColor(selectedTimeRange == range ? .white : themeManager.currentTheme.textPrimary)
                        .padding(.horizontal, 16)
                        .padding(.vertical, 8)
                        .background(selectedTimeRange == range ? themeManager.currentTheme.accentColor : themeManager.currentTheme.cardBackground)
                        .cornerRadius(20)
                }
            }
        }
    }

    private var moodChartSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Mood Distribution")
                .font(.headline)
                .foregroundColor(themeManager.currentTheme.textPrimary)

            VStack(spacing: 12) {
                let moodCounts = StreakManager.entriesByMood(from: filteredEntries)

                ForEach(MoodType.allCases, id: \.self) { mood in
                    let count = moodCounts[mood] ?? 0
                    let percentage = totalEntries > 0 ? Double(count) / Double(totalEntries) : 0

                    HStack {
                        Text(mood.emoji)
                            .font(.title3)

                        Text(mood.rawValue)
                            .font(.subheadline)
                            .foregroundColor(themeManager.currentTheme.textPrimary)

                        Spacer()

                        Text("\(count)")
                            .font(.subheadline)
                            .fontWeight(.medium)
                            .foregroundColor(themeManager.currentTheme.textSecondary)

                        GeometryReader { geometry in
                            ZStack(alignment: .leading) {
                                RoundedRectangle(cornerRadius: 4)
                                    .fill(Color(mood.color).opacity(0.2))

                                RoundedRectangle(cornerRadius: 4)
                                    .fill(Color(mood.color))
                                    .frame(width: geometry.size.width * percentage)
                            }
                        }
                        .frame(width: 100, height: 8)
                    }
                }
            }
            .padding()
            .background(themeManager.currentTheme.cardBackground)
            .cornerRadius(16)
            .shadow(color: .black.opacity(0.05), radius: 8, x: 0, y: 4)
        }
    }

    private var entryTimelineSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Entry Timeline")
                .font(.headline)
                .foregroundColor(themeManager.currentTheme.textPrimary)

            // Calendar Heatmap Preview
            CalendarHeatmapView(entries: entries)
                .frame(height: 200)
                .padding()
                .background(themeManager.currentTheme.cardBackground)
                .cornerRadius(16)
                .shadow(color: .black.opacity(0.05), radius: 8, x: 0, y: 4)
        }
    }

    private var topTagsSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Top Tags")
                .font(.headline)
                .foregroundColor(themeManager.currentTheme.textPrimary)

            let topTags = StreakManager.topTags(from: filteredEntries, limit: 10)

            if topTags.isEmpty {
                Text("No tags yet")
                    .font(.subheadline)
                    .foregroundColor(themeManager.currentTheme.textSecondary)
                    .frame(maxWidth: .infinity, alignment: .center)
                    .padding()
                    .background(themeManager.currentTheme.cardBackground)
                    .cornerRadius(16)
            } else {
                VStack(spacing: 12) {
                    ForEach(topTags, id: \.0) { tag, count in
                        HStack {
                            Text("#\(tag)")
                                .font(.subheadline)
                                .fontWeight(.medium)
                                .foregroundColor(themeManager.currentTheme.accentColor)

                            Spacer()

                            Text("\(count)")
                                .font(.subheadline)
                                .foregroundColor(themeManager.currentTheme.textSecondary)

                            Image(systemName: "tag.fill")
                                .font(.caption)
                                .foregroundColor(themeManager.currentTheme.accentColor)
                        }
                    }
                }
                .padding()
                .background(themeManager.currentTheme.cardBackground)
                .cornerRadius(16)
                .shadow(color: .black.opacity(0.05), radius: 8, x: 0, y: 4)
            }
        }
    }

    private var badgesSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack {
                Text("Achievements")
                    .font(.headline)
                    .foregroundColor(themeManager.currentTheme.textPrimary)

                Spacer()

                Button(action: { showBadgesView = true }) {
                    Text("View All")
                        .font(.subheadline)
                        .foregroundColor(themeManager.currentTheme.accentColor)
                }
            }

            VStack(spacing: 12) {
                ProgressView(value: Double(unlockedBadgesCount), total: Double(totalBadgesCount))
                    .tint(themeManager.currentTheme.accentColor)

                HStack {
                    Text("\(unlockedBadgesCount) of \(totalBadgesCount) badges unlocked")
                        .font(.subheadline)
                        .foregroundColor(themeManager.currentTheme.textSecondary)

                    Spacer()

                    Text("\(Int(Double(unlockedBadgesCount) / Double(max(totalBadgesCount, 1)) * 100))%")
                        .font(.subheadline)
                        .fontWeight(.semibold)
                        .foregroundColor(themeManager.currentTheme.accentColor)
                }

                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 12) {
                        ForEach(badges.filter { $0.isUnlocked }.prefix(5)) { badge in
                            VStack(spacing: 6) {
                                ZStack {
                                    Circle()
                                        .fill(Color(hex: badge.colorHex).opacity(0.2))
                                        .frame(width: 50, height: 50)

                                    Image(systemName: badge.icon)
                                        .font(.title3)
                                        .foregroundColor(Color(hex: badge.colorHex))
                                }

                                Text(badge.title)
                                    .font(.caption2)
                                    .fontWeight(.medium)
                                    .multilineTextAlignment(.center)
                                    .lineLimit(2)
                                    .frame(width: 70)
                            }
                        }
                    }
                    .padding(.vertical, 8)
                }
            }
            .padding()
            .background(themeManager.currentTheme.cardBackground)
            .cornerRadius(16)
            .shadow(color: .black.opacity(0.05), radius: 8, x: 0, y: 4)
        }
    }

    private var insightsSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Insights")
                .font(.headline)
                .foregroundColor(themeManager.currentTheme.textPrimary)

            VStack(spacing: 12) {
                if let mostUsedMood = mostUsedMood {
                    InsightCard(
                        icon: mostUsedMood.emoji,
                        title: "Most Common Mood",
                        description: "You most often feel \(mostUsedMood.rawValue.lowercased()) when writing",
                        color: Color(mostUsedMood.color)
                    )
                }

                if currentStreak >= 7 {
                    InsightCard(
                        icon: "🔥",
                        title: "Great Consistency!",
                        description: "You've maintained a \(currentStreak)-day streak. Keep it up!",
                        color: .orange
                    )
                }

                if thisWeekEntries >= 5 {
                    InsightCard(
                        icon: "⭐",
                        title: "Active Week",
                        description: "You've written \(thisWeekEntries) entries this week!",
                        color: Color.moodJoyful
                    )
                }

                if gratitudeScore > 0.7 {
                    InsightCard(
                        icon: "💖",
                        title: "High Gratitude",
                        description: "Your entries show strong positive sentiment",
                        color: Color.moodGrateful
                    )
                }
            }
        }
    }

    // MARK: - Helpers

    private var filteredEntries: [JournalEntry] {
        let calendar = Calendar.current
        let now = Date()

        return entries.filter { entry in
            switch selectedTimeRange {
            case .week:
                guard let weekAgo = calendar.date(byAdding: .day, value: -7, to: now) else { return false }
                return entry.date >= weekAgo
            case .month:
                guard let monthAgo = calendar.date(byAdding: .month, value: -1, to: now) else { return false }
                return entry.date >= monthAgo
            case .year:
                guard let yearAgo = calendar.date(byAdding: .year, value: -1, to: now) else { return false }
                return entry.date >= yearAgo
            case .all:
                return true
            }
        }
    }

    private func formatTotalTime(_ duration: TimeInterval) -> String {
        let hours = Int(duration) / 3600
        if hours > 0 {
            return "\(hours)h"
        } else {
            let minutes = Int(duration) / 60
            return "\(minutes)m"
        }
    }
}

// MARK: - Supporting Views

struct AnalyticsStatCard: View {
    @EnvironmentObject var themeManager: ThemeManager
    let title: String
    let value: String
    let icon: String
    let color: Color

    var body: some View {
        VStack(spacing: 12) {
            Image(systemName: icon)
                .font(.title2)
                .foregroundColor(color)

            Text(value)
                .font(.title3)
                .fontWeight(.bold)
                .foregroundColor(themeManager.currentTheme.textPrimary)

            Text(title)
                .font(.caption)
                .foregroundColor(themeManager.currentTheme.textSecondary)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(themeManager.currentTheme.cardBackground)
        .cornerRadius(16)
        .shadow(color: .black.opacity(0.05), radius: 8, x: 0, y: 4)
    }
}

struct InsightCard: View {
    @EnvironmentObject var themeManager: ThemeManager
    let icon: String
    let title: String
    let description: String
    let color: Color

    var body: some View {
        HStack(spacing: 12) {
            Text(icon)
                .font(.title)

            VStack(alignment: .leading, spacing: 4) {
                Text(title)
                    .font(.subheadline)
                    .fontWeight(.semibold)
                    .foregroundColor(themeManager.currentTheme.textPrimary)

                Text(description)
                    .font(.caption)
                    .foregroundColor(themeManager.currentTheme.textSecondary)
            }

            Spacer()
        }
        .padding()
        .background(color.opacity(0.1))
        .cornerRadius(12)
    }
}

struct CalendarHeatmapView: View {
    @EnvironmentObject var themeManager: ThemeManager
    let entries: [JournalEntry]

    private var entriesByDate: [Date: Int] {
        let calendar = Calendar.current
        let grouped = Dictionary(grouping: entries) { entry in
            calendar.startOfDay(for: entry.date)
        }
        return grouped.mapValues { $0.count }
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Last 12 weeks")
                .font(.caption)
                .foregroundColor(themeManager.currentTheme.textSecondary)

            // Simplified heatmap - would need more complex layout in production
            LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 4), count: 7), spacing: 4) {
                ForEach(0..<84, id: \.self) { index in
                    let date = Calendar.current.date(byAdding: .day, value: -84 + index, to: Date()) ?? Date()
                    let count = entriesByDate[Calendar.current.startOfDay(for: date)] ?? 0

                    RoundedRectangle(cornerRadius: 2)
                        .fill(count > 0 ? themeManager.currentTheme.accentColor.opacity(min(Double(count) * 0.3 + 0.2, 1.0)) : themeManager.currentTheme.textSecondary.opacity(0.1))
                        .aspectRatio(1, contentMode: .fit)
                }
            }

            HStack(spacing: 4) {
                Text("Less")
                    .font(.caption2)
                    .foregroundColor(themeManager.currentTheme.textSecondary)

                ForEach(0..<5) { intensity in
                    RoundedRectangle(cornerRadius: 2)
                        .fill(themeManager.currentTheme.accentColor.opacity(Double(intensity) * 0.25))
                        .frame(width: 12, height: 12)
                }

                Text("More")
                    .font(.caption2)
                    .foregroundColor(themeManager.currentTheme.textSecondary)
            }
        }
    }
}

enum TimeRange: String, CaseIterable {
    case week = "Week"
    case month = "Month"
    case year = "Year"
    case all = "All Time"
}

#Preview {
    AnalyticsView()
        .environmentObject(ThemeManager())
        .modelContainer(for: [JournalEntry.self, Badge.self])
}
