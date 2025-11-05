//
//  GamificationDashboardView.swift
//  GratitudeJournal
//
//  Points, garden, and challenges dashboard
//

import SwiftUI
import SwiftData

struct GamificationDashboardView: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(\.modelContext) private var modelContext
    @EnvironmentObject var themeManager: ThemeManager

    @Query private var progress: [UserProgress]
    @Query private var challenges: [WritingChallenge]
    @Query private var seasonalChallenges: [SeasonalChallenge]

    private var userProgress: UserProgress {
        progress.first ?? {
            let newProgress = UserProgress()
            modelContext.insert(newProgress)
            return newProgress
        }()
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 24) {
                    // Points Section
                    pointsCard

                    // Gratitude Garden
                    gardenCard

                    // Streak Recovery Tokens
                    tokensCard

                    // Active Challenges
                    if !challenges.filter({ $0.isActive }).isEmpty {
                        challengesSection
                    }

                    // Seasonal Challenge
                    if !seasonalChallenges.filter({ $0.isActive }).isEmpty {
                        seasonalSection
                    }

                    // Unlockable Themes
                    themesSection
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
            .navigationTitle("Progress")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") { dismiss() }
                }
            }
        }
    }

    // MARK: - Components

    private var pointsCard: some View {
        VStack(spacing: 16) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text("Gratitude Points")
                        .font(.headline)
                        .foregroundColor(themeManager.currentTheme.textPrimary)

                    Text("\(userProgress.totalPoints) Points")
                        .font(.system(size: 36, weight: .bold))
                        .foregroundColor(themeManager.currentTheme.accentColor)
                }

                Spacer()

                Text("⭐")
                    .font(.system(size: 60))
            }

            Divider()

            Text("Earn points by writing entries, meditating, and achieving goals!")
                .font(.caption)
                .foregroundColor(themeManager.currentTheme.textSecondary)
                .multilineTextAlignment(.center)
        }
        .padding()
        .background(themeManager.currentTheme.cardBackground)
        .cornerRadius(16)
        .shadow(color: .black.opacity(0.05), radius: 8, x: 0, y: 4)
    }

    private var gardenCard: some View {
        VStack(spacing: 16) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text("Gratitude Garden")
                        .font(.headline)
                        .foregroundColor(themeManager.currentTheme.textPrimary)

                    Text(userProgress.gardenGrowthStage.rawValue)
                        .font(.title3)
                        .fontWeight(.semibold)
                        .foregroundColor(themeManager.currentTheme.accentColor)
                }

                Spacer()

                Text(userProgress.gardenGrowthStage.emoji)
                    .font(.system(size: 60))
            }

            ProgressView(value: Double(userProgress.gratitudeGardenLevel), total: 100)
                .tint(themeManager.currentTheme.accentColor)

            Text(userProgress.gardenGrowthStage.description)
                .font(.caption)
                .foregroundColor(themeManager.currentTheme.textSecondary)
                .multilineTextAlignment(.center)

            Text("Level \(userProgress.gratitudeGardenLevel) / 100")
                .font(.caption2)
                .foregroundColor(themeManager.currentTheme.textSecondary)
        }
        .padding()
        .background(themeManager.currentTheme.cardBackground)
        .cornerRadius(16)
        .shadow(color: .black.opacity(0.05), radius: 8, x: 0, y: 4)
    }

    private var tokensCard: some View {
        VStack(spacing: 16) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text("Streak Recovery Tokens")
                        .font(.headline)
                        .foregroundColor(themeManager.currentTheme.textPrimary)

                    Text("\(userProgress.streakRecoveryTokens) Available")
                        .font(.title3)
                        .fontWeight(.semibold)
                        .foregroundColor(themeManager.currentTheme.accentColor)
                }

                Spacer()

                Text("💎")
                    .font(.system(size: 50))
            }

            Text("Use a token to save your streak if you miss a day! Earn more by completing challenges.")
                .font(.caption)
                .foregroundColor(themeManager.currentTheme.textSecondary)
                .multilineTextAlignment(.center)

            if !userProgress.canUseStreakRecovery() {
                Text("Next token available in \(daysUntilNextToken) days")
                    .font(.caption2)
                    .foregroundColor(.orange)
            }
        }
        .padding()
        .background(themeManager.currentTheme.cardBackground)
        .cornerRadius(16)
        .shadow(color: .black.opacity(0.05), radius: 8, x: 0, y: 4)
    }

    private var challengesSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Active Challenges")
                .font(.headline)
                .foregroundColor(themeManager.currentTheme.textPrimary)

            ForEach(challenges.filter { $0.isActive }) { challenge in
                ChallengeCard(challenge: challenge)
            }
        }
    }

    private var seasonalSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Seasonal Challenge")
                .font(.headline)
                .foregroundColor(themeManager.currentTheme.textPrimary)

            ForEach(seasonalChallenges.filter { $0.isActive }) { challenge in
                SeasonalChallengeCard(challenge: challenge)
            }
        }
    }

    private var themesSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Unlockable Themes")
                .font(.headline)
                .foregroundColor(themeManager.currentTheme.textPrimary)

            VStack(spacing: 8) {
                ThemeUnlockRow(theme: "Calm Lavender", points: 100, unlocked: userProgress.totalPoints >= 100)
                ThemeUnlockRow(theme: "Peaceful Green", points: 250, unlocked: userProgress.totalPoints >= 250)
                ThemeUnlockRow(theme: "Warm Sunset", points: 500, unlocked: userProgress.totalPoints >= 500)
                ThemeUnlockRow(theme: "Gentle Pink", points: 1000, unlocked: userProgress.totalPoints >= 1000)
                ThemeUnlockRow(theme: "Soft Mint", points: 2000, unlocked: userProgress.totalPoints >= 2000)
                ThemeUnlockRow(theme: "Tranquil Sage", points: 3000, unlocked: userProgress.totalPoints >= 3000)
                ThemeUnlockRow(theme: "Cozy Beige", points: 5000, unlocked: userProgress.totalPoints >= 5000)
            }
            .padding()
            .background(themeManager.currentTheme.cardBackground)
            .cornerRadius(12)
        }
    }

    private var daysUntilNextToken: Int {
        guard let lastUse = userProgress.lastStreakSaveDate else { return 0 }
        let nextAvailable = Calendar.current.date(byAdding: .day, value: 7, to: lastUse) ?? Date()
        return Calendar.current.dateComponents([.day], from: Date(), to: nextAvailable).day ?? 0
    }
}

struct ChallengeCard: View {
    @EnvironmentObject var themeManager: ThemeManager
    let challenge: WritingChallenge

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text(challenge.title)
                    .font(.subheadline)
                    .fontWeight(.semibold)

                Spacer()

                Text("\(challenge.currentDay)/\(challenge.targetDays)")
                    .font(.caption)
                    .foregroundColor(themeManager.currentTheme.accentColor)
            }

            ProgressView(value: challenge.progress)
                .tint(themeManager.currentTheme.accentColor)

            Text(challenge.challengeDescription)
                .font(.caption)
                .foregroundColor(themeManager.currentTheme.textSecondary)
        }
        .padding()
        .background(themeManager.currentTheme.cardBackground)
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.05), radius: 4, x: 0, y: 2)
    }
}

struct SeasonalChallengeCard: View {
    @EnvironmentObject var themeManager: ThemeManager
    let challenge: SeasonalChallenge

    private var seasonEmoji: String {
        switch challenge.season {
        case .spring: return "🌸"
        case .summer: return "☀️"
        case .autumn: return "🍂"
        case .winter: return "❄️"
        }
    }

    var body: some View {
        HStack {
            Text(seasonEmoji)
                .font(.system(size: 40))

            VStack(alignment: .leading, spacing: 4) {
                Text(challenge.title)
                    .font(.headline)

                Text(challenge.description)
                    .font(.caption)
                    .foregroundColor(.secondary)

                Text("Target: \(challenge.targetEntries) entries")
                    .font(.caption2)
                    .foregroundColor(themeManager.currentTheme.accentColor)
            }

            Spacer()
        }
        .padding()
        .background(themeManager.currentTheme.cardBackground)
        .cornerRadius(12)
    }
}

struct ThemeUnlockRow: View {
    @EnvironmentObject var themeManager: ThemeManager
    let theme: String
    let points: Int
    let unlocked: Bool

    var body: some View {
        HStack {
            Image(systemName: unlocked ? "checkmark.circle.fill" : "lock.fill")
                .foregroundColor(unlocked ? .green : .gray)

            Text(theme)
                .font(.subheadline)
                .foregroundColor(unlocked ? themeManager.currentTheme.textPrimary : .gray)

            Spacer()

            Text("\(points) pts")
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .opacity(unlocked ? 1.0 : 0.6)
    }
}

#Preview {
    GamificationDashboardView()
        .environmentObject(ThemeManager())
        .modelContainer(for: [UserProgress.self, WritingChallenge.self, SeasonalChallenge.self])
}
