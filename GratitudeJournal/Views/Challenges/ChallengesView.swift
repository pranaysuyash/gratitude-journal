//
//  ChallengesView.swift
//  GratitudeJournal
//
//  Manage and track gratitude challenges
//

import SwiftUI
import SwiftData

struct ChallengesView: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(\.modelContext) private var modelContext
    @EnvironmentObject var themeManager: ThemeManager

    @Query private var challenges: [WritingChallenge]
    @Query private var seasonalChallenges: [SeasonalChallenge]

    @State private var showCreateChallenge = false

    private var activeChallenges: [WritingChallenge] {
        challenges.filter { $0.isActive && !$0.isCompleted }
    }

    private var completedChallenges: [WritingChallenge] {
        challenges.filter { $0.isCompleted }
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 24) {
                    // Header
                    challengeHeader

                    // Suggested challenges
                    suggestedChallengesSection

                    // Active challenges
                    if !activeChallenges.isEmpty {
                        activeChallengesSection
                    }

                    // Seasonal challenges
                    if !seasonalChallenges.isEmpty {
                        seasonalChallengesSection
                    }

                    // Completed challenges
                    if !completedChallenges.isEmpty {
                        completedChallengesSection
                    }
                }
                .padding()
            }
            .background(themeManager.currentTheme.backgroundColor.ignoresSafeArea())
            .navigationTitle("Challenges")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") { dismiss() }
                }
            }
            .sheet(isPresented: $showCreateChallenge) {
                CreateChallengeView()
            }
        }
    }

    private var challengeHeader: some View {
        VStack(spacing: 12) {
            Text("🎯")
                .font(.system(size: 60))

            Text("Gratitude Challenges")
                .font(.title2)
                .fontWeight(.bold)

            Text("Build consistency with structured challenges")
                .font(.subheadline)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
        }
        .padding()
    }

    private var suggestedChallengesSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Suggested Challenges")
                .font(.headline)

            SuggestedChallengeCard(
                title: "30-Day Gratitude Challenge",
                description: "Write one gratitude entry every day for 30 days",
                icon: "calendar.badge.clock",
                color: .blue,
                days: 30
            ) {
                startChallenge(.thirtyDays, days: 30)
            }

            SuggestedChallengeCard(
                title: "100-Day Gratitude Journey",
                description: "Commit to 100 days of consistent gratitude practice",
                icon: "star.circle.fill",
                color: .purple,
                days: 100
            ) {
                startChallenge(.hundredDays, days: 100)
            }

            SuggestedChallengeCard(
                title: "Weekly Reflection Challenge",
                description: "Write 7 entries this week",
                icon: "chart.line.uptrend.xyaxis",
                color: .green,
                days: 7
            ) {
                startChallenge(.weekly, days: 7)
            }
        }
    }

    private var activeChallengesSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Active Challenges")
                .font(.headline)

            ForEach(activeChallenges) { challenge in
                ActiveChallengeCard(challenge: challenge)
            }
        }
    }

    private var seasonalChallengesSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Seasonal Challenges")
                .font(.headline)

            ForEach(seasonalChallenges.filter { $0.isActive }) { challenge in
                SeasonalChallengeCardView(challenge: challenge)
            }
        }
    }

    private var completedChallengesSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Completed")
                .font(.headline)

            ForEach(completedChallenges) { challenge in
                CompletedChallengeCard(challenge: challenge)
            }
        }
    }

    private func startChallenge(_ type: ChallengeType, days: Int) {
        let challenge: WritingChallenge

        switch type {
        case .thirtyDays:
            challenge = WritingChallenge.thirtyDayChallenge
        case .hundredDays:
            challenge = WritingChallenge.hundredDayChallenge
        default:
            challenge = WritingChallenge(
                title: type.rawValue,
                description: "Complete \(days) days of gratitude journaling",
                type: type,
                targetDays: days
            )
        }

        modelContext.insert(challenge)
    }
}

struct SuggestedChallengeCard: View {
    @EnvironmentObject var themeManager: ThemeManager
    let title: String
    let description: String
    let icon: String
    let color: Color
    let days: Int
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 16) {
                ZStack {
                    Circle()
                        .fill(color.opacity(0.2))
                        .frame(width: 60, height: 60)

                    Image(systemName: icon)
                        .font(.title2)
                        .foregroundColor(color)
                }

                VStack(alignment: .leading, spacing: 4) {
                    Text(title)
                        .font(.headline)
                        .foregroundColor(themeManager.currentTheme.textPrimary)

                    Text(description)
                        .font(.caption)
                        .foregroundColor(.secondary)

                    Text("\(days) days")
                        .font(.caption2)
                        .fontWeight(.semibold)
                        .foregroundColor(color)
                }

                Spacer()

                Image(systemName: "plus.circle.fill")
                    .font(.title2)
                    .foregroundColor(themeManager.currentTheme.accentColor)
            }
            .padding()
            .background(themeManager.currentTheme.cardBackground)
            .cornerRadius(16)
            .shadow(color: .black.opacity(0.05), radius: 8, x: 0, y: 4)
        }
    }
}

struct ActiveChallengeCard: View {
    @EnvironmentObject var themeManager: ThemeManager
    let challenge: WritingChallenge

    private var daysRemaining: Int {
        challenge.targetDays - challenge.currentDay
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text(challenge.title)
                    .font(.headline)

                Spacer()

                Text("Day \(challenge.currentDay)/\(challenge.targetDays)")
                    .font(.caption)
                    .foregroundColor(themeManager.currentTheme.accentColor)
            }

            ProgressView(value: challenge.progress)
                .tint(themeManager.currentTheme.accentColor)

            HStack {
                Text("\(Int(challenge.progress * 100))% Complete")
                    .font(.caption)
                    .foregroundColor(.secondary)

                Spacer()

                Text("\(daysRemaining) days left")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
        .padding()
        .background(themeManager.currentTheme.cardBackground)
        .cornerRadius(16)
        .shadow(color: .black.opacity(0.05), radius: 8, x: 0, y: 4)
    }
}

struct SeasonalChallengeCardView: View {
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
                .font(.system(size: 50))

            VStack(alignment: .leading, spacing: 6) {
                Text(challenge.title)
                    .font(.headline)

                Text(challenge.description)
                    .font(.caption)
                    .foregroundColor(.secondary)

                Text("Target: \(challenge.targetEntries) entries")
                    .font(.caption2)
                    .foregroundColor(themeManager.currentTheme.accentColor)

                Text("Ends \(challenge.endDate.formatted(date: .abbreviated, time: .omitted))")
                    .font(.caption2)
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

struct CompletedChallengeCard: View {
    @EnvironmentObject var themeManager: ThemeManager
    let challenge: WritingChallenge

    var body: some View {
        HStack {
            Image(systemName: "checkmark.seal.fill")
                .font(.title)
                .foregroundColor(.green)

            VStack(alignment: .leading, spacing: 4) {
                Text(challenge.title)
                    .font(.headline)
                    .foregroundColor(themeManager.currentTheme.textPrimary)

                Text("Completed!")
                    .font(.caption)
                    .foregroundColor(.green)
            }

            Spacer()

            Text("\(challenge.targetDays) days")
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .padding()
        .background(themeManager.currentTheme.cardBackground.opacity(0.7))
        .cornerRadius(12)
    }
}

struct CreateChallengeView: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(\.modelContext) private var modelContext
    @EnvironmentObject var themeManager: ThemeManager

    @State private var title = ""
    @State private var description = ""
    @State private var targetDays = 30

    var body: some View {
        NavigationStack {
            Form {
                Section("Challenge Details") {
                    TextField("Title", text: $title)

                    TextField("Description", text: $description)

                    Stepper("Target Days: \(targetDays)", value: $targetDays, in: 1...365)
                }
            }
            .navigationTitle("New Challenge")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") { dismiss() }
                }

                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Create") {
                        let challenge = WritingChallenge(
                            title: title,
                            description: description,
                            type: .custom,
                            targetDays: targetDays
                        )
                        modelContext.insert(challenge)
                        dismiss()
                    }
                    .disabled(title.isEmpty)
                }
            }
        }
    }
}

#Preview {
    ChallengesView()
        .environmentObject(ThemeManager())
        .modelContainer(for: [WritingChallenge.self, SeasonalChallenge.self])
}
