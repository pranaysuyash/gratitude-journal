//
//  HomeView.swift
//  GratitudeJournal
//
//  Home screen with daily inspiration and quick stats
//

import SwiftUI
import SwiftData

struct HomeView: View {
    @Environment(\.modelContext) private var modelContext
    @EnvironmentObject var themeManager: ThemeManager

    @Query(sort: \JournalEntry.date, order: .reverse) private var entries: [JournalEntry]
    @Query private var badges: [Badge]
    @Query private var goals: [GratitudeGoal]

    @State private var currentQuote = GratitudeQuote.random()
    @State private var showNewEntry = false
    @State private var showBadgeAnimation = false

    private var currentStreak: Int {
        StreakManager.calculateStreak(from: entries)
    }

    private var totalEntries: Int {
        entries.count
    }

    private var hasWrittenToday: Bool {
        guard let lastEntry = entries.first else { return false }
        return Calendar.current.isDateInToday(lastEntry.date)
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 24) {
                    // Header with greeting
                    headerSection

                    // Daily Quote
                    quoteCard

                    // Streak Card
                    streakCard

                    // Quick Stats
                    statsSection

                    // Active Goals
                    if !goals.filter({ !$0.isCompleted }).isEmpty {
                        goalsSection
                    }

                    // Recent Badges
                    if !badges.filter({ $0.isUnlocked }).isEmpty {
                        badgesSection
                    }

                    // Quick Actions
                    quickActionsSection
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
            .navigationTitle("Gratitude")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: refreshQuote) {
                        Image(systemName: "sparkles")
                            .foregroundColor(themeManager.currentTheme.accentColor)
                    }
                }
            }
            .sheet(isPresented: $showNewEntry) {
                NewEntryView()
            }
        }
    }

    // MARK: - View Components

    private var headerSection: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text(greeting)
                    .font(.title2)
                    .fontWeight(.semibold)
                    .foregroundColor(themeManager.currentTheme.textPrimary)

                Text("What are you grateful for today?")
                    .font(.subheadline)
                    .foregroundColor(themeManager.currentTheme.textSecondary)
            }
            Spacer()
        }
        .padding()
        .background(themeManager.currentTheme.cardBackground)
        .cornerRadius(16)
        .shadow(color: .black.opacity(0.05), radius: 8, x: 0, y: 4)
    }

    private var quoteCard: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Image(systemName: "quote.opening")
                    .font(.title3)
                    .foregroundColor(themeManager.currentTheme.accentColor)
                Spacer()
                Image(systemName: "sparkles")
                    .foregroundColor(themeManager.currentTheme.primaryColor)
            }

            Text(currentQuote.text)
                .font(.body)
                .foregroundColor(themeManager.currentTheme.textPrimary)
                .multilineTextAlignment(.leading)

            Text("— \(currentQuote.author)")
                .font(.caption)
                .foregroundColor(themeManager.currentTheme.textSecondary)
                .padding(.top, 4)
        }
        .padding()
        .background(themeManager.currentTheme.cardBackground)
        .cornerRadius(16)
        .shadow(color: .black.opacity(0.05), radius: 8, x: 0, y: 4)
    }

    private var streakCard: some View {
        HStack(spacing: 20) {
            VStack {
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

            Divider()

            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Image(systemName: hasWrittenToday ? "checkmark.circle.fill" : "circle")
                        .foregroundColor(hasWrittenToday ? .green : themeManager.currentTheme.textSecondary)
                    Text(hasWrittenToday ? "Completed today!" : "Write today's entry")
                        .font(.subheadline)
                        .foregroundColor(themeManager.currentTheme.textPrimary)
                }

                if !hasWrittenToday {
                    Button(action: { showNewEntry = true }) {
                        Text("Write Now")
                            .font(.subheadline)
                            .fontWeight(.semibold)
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 8)
                            .background(themeManager.currentTheme.accentColor)
                            .cornerRadius(8)
                    }
                }
            }
            .padding(.leading)
        }
        .padding()
        .background(themeManager.currentTheme.cardBackground)
        .cornerRadius(16)
        .shadow(color: .black.opacity(0.05), radius: 8, x: 0, y: 4)
    }

    private var statsSection: some View {
        VStack(spacing: 12) {
            HStack {
                Text("This Week")
                    .font(.headline)
                    .foregroundColor(themeManager.currentTheme.textPrimary)
                Spacer()
            }

            HStack(spacing: 12) {
                StatCard(
                    title: "Entries",
                    value: "\(StreakManager.entriesThisWeek(from: entries))",
                    icon: "book.fill",
                    color: themeManager.currentTheme.primaryColor
                )

                StatCard(
                    title: "Total",
                    value: "\(totalEntries)",
                    icon: "text.book.closed.fill",
                    color: themeManager.currentTheme.secondaryColor
                )

                StatCard(
                    title: "Avg Words",
                    value: "\(StreakManager.averageWordsPerEntry(from: entries))",
                    icon: "character.cursor.ibeam",
                    color: themeManager.currentTheme.accentColor
                )
            }
        }
    }

    private var goalsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Active Goals")
                .font(.headline)
                .foregroundColor(themeManager.currentTheme.textPrimary)

            ForEach(goals.filter { !$0.isCompleted }.prefix(3)) { goal in
                GoalProgressCard(goal: goal)
            }
        }
    }

    private var badgesSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Recent Achievements")
                .font(.headline)
                .foregroundColor(themeManager.currentTheme.textPrimary)

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 12) {
                    ForEach(badges.filter { $0.isUnlocked }.sorted(by: { $0.unlockedDate ?? Date() > $1.unlockedDate ?? Date() }).prefix(5)) { badge in
                        BadgeMiniCard(badge: badge)
                    }
                }
            }
        }
    }

    private var quickActionsSection: some View {
        VStack(spacing: 12) {
            HStack {
                Text("Quick Actions")
                    .font(.headline)
                    .foregroundColor(themeManager.currentTheme.textPrimary)
                Spacer()
            }

            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
                QuickActionButton(
                    title: "Meditation",
                    icon: "sparkles",
                    color: Color.moodPeaceful
                ) {
                    // Navigate to meditation
                }

                QuickActionButton(
                    title: "Voice Note",
                    icon: "mic.fill",
                    color: Color.moodGrateful
                ) {
                    // Start voice note
                }

                QuickActionButton(
                    title: "Photo Entry",
                    icon: "camera.fill",
                    color: Color.moodJoyful
                ) {
                    // Start photo entry
                }

                QuickActionButton(
                    title: "Gratitude Letter",
                    icon: "envelope.fill",
                    color: Color.moodHopeful
                ) {
                    // Start letter
                }
            }
        }
    }

    private var greeting: String {
        let hour = Calendar.current.component(.hour, from: Date())
        switch hour {
        case 0..<12: return "Good Morning"
        case 12..<17: return "Good Afternoon"
        default: return "Good Evening"
        }
    }

    private func refreshQuote() {
        withAnimation {
            currentQuote = GratitudeQuote.random()
        }
    }
}

// MARK: - Supporting Views

struct StatCard: View {
    @EnvironmentObject var themeManager: ThemeManager
    let title: String
    let value: String
    let icon: String
    let color: Color

    var body: some View {
        VStack(spacing: 8) {
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
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(themeManager.currentTheme.cardBackground)
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.05), radius: 4, x: 0, y: 2)
    }
}

struct GoalProgressCard: View {
    @EnvironmentObject var themeManager: ThemeManager
    let goal: GratitudeGoal

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(goal.title)
                    .font(.subheadline)
                    .fontWeight(.medium)
                    .foregroundColor(themeManager.currentTheme.textPrimary)
                Spacer()
                Text("\(goal.progressPercentage)%")
                    .font(.caption)
                    .foregroundColor(themeManager.currentTheme.accentColor)
            }

            ProgressView(value: goal.progress)
                .tint(themeManager.currentTheme.accentColor)
        }
        .padding()
        .background(themeManager.currentTheme.cardBackground)
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.05), radius: 4, x: 0, y: 2)
    }
}

struct BadgeMiniCard: View {
    let badge: Badge

    var body: some View {
        VStack(spacing: 8) {
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

struct QuickActionButton: View {
    @EnvironmentObject var themeManager: ThemeManager
    let title: String
    let icon: String
    let color: Color
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack {
                Image(systemName: icon)
                    .font(.title3)
                    .foregroundColor(color)

                Text(title)
                    .font(.subheadline)
                    .fontWeight(.medium)
                    .foregroundColor(themeManager.currentTheme.textPrimary)

                Spacer()
            }
            .padding()
            .background(themeManager.currentTheme.cardBackground)
            .cornerRadius(12)
            .shadow(color: .black.opacity(0.05), radius: 4, x: 0, y: 2)
        }
    }
}

// MARK: - Gratitude Quotes

struct GratitudeQuote {
    let text: String
    let author: String

    static let quotes = [
        GratitudeQuote(text: "Gratitude turns what we have into enough.", author: "Aesop"),
        GratitudeQuote(text: "Gratitude is the healthiest of all human emotions.", author: "Zig Ziglar"),
        GratitudeQuote(text: "When you are grateful, fear disappears and abundance appears.", author: "Tony Robbins"),
        GratitudeQuote(text: "Gratitude makes sense of our past, brings peace for today, and creates a vision for tomorrow.", author: "Melody Beattie"),
        GratitudeQuote(text: "The struggle ends when gratitude begins.", author: "Neale Donald Walsch"),
        GratitudeQuote(text: "Gratitude is not only the greatest of virtues, but the parent of all others.", author: "Cicero"),
        GratitudeQuote(text: "In ordinary life, we hardly realize that we receive a great deal more than we give.", author: "Dietrich Bonhoeffer"),
        GratitudeQuote(text: "Gratitude is a powerful catalyst for happiness.", author: "Amy Collette"),
        GratitudeQuote(text: "Enjoy the little things, for one day you may look back and realize they were the big things.", author: "Robert Brault"),
        GratitudeQuote(text: "Gratitude is the fairest blossom which springs from the soul.", author: "Henry Ward Beecher")
    ]

    static func random() -> GratitudeQuote {
        quotes.randomElement() ?? quotes[0]
    }
}

// Color extension for hex support
extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (255, 0, 0, 0)
        }
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue:  Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}

#Preview {
    HomeView()
        .environmentObject(ThemeManager())
        .environmentObject(NotificationManager())
        .environmentObject(AudioManager())
        .modelContainer(for: [JournalEntry.self, Reminder.self, GratitudeGoal.self, Badge.self, Category.self])
}
