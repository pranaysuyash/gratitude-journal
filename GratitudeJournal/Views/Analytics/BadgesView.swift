//
//  BadgesView.swift
//  GratitudeJournal
//
//  View all achievement badges
//

import SwiftUI
import SwiftData

struct BadgesView: View {
    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject var themeManager: ThemeManager

    @Query private var badges: [Badge]

    @State private var selectedCategory: BadgeCategory?

    private var filteredBadges: [Badge] {
        if let category = selectedCategory {
            return badges.filter { $0.category == category }
        }
        return badges
    }

    private var unlockedBadges: [Badge] {
        filteredBadges.filter { $0.isUnlocked }
    }

    private var lockedBadges: [Badge] {
        filteredBadges.filter { !$0.isUnlocked }
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 24) {
                    // Stats header
                    statsHeader

                    // Category filter
                    categoryFilter

                    // Unlocked badges
                    if !unlockedBadges.isEmpty {
                        badgeSection(title: "Unlocked", badges: unlockedBadges)
                    }

                    // Locked badges
                    if !lockedBadges.isEmpty {
                        badgeSection(title: "Locked", badges: lockedBadges)
                    }
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
            .navigationTitle("Achievements")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") {
                        dismiss()
                    }
                    .foregroundColor(themeManager.currentTheme.accentColor)
                }
            }
        }
    }

    private var statsHeader: some View {
        VStack(spacing: 12) {
            // Progress circle
            ZStack {
                Circle()
                    .stroke(themeManager.currentTheme.textSecondary.opacity(0.2), lineWidth: 12)
                    .frame(width: 120, height: 120)

                Circle()
                    .trim(from: 0, to: progressValue)
                    .stroke(
                        LinearGradient(
                            colors: [themeManager.currentTheme.primaryColor, themeManager.currentTheme.accentColor],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        ),
                        style: StrokeStyle(lineWidth: 12, lineCap: .round)
                    )
                    .frame(width: 120, height: 120)
                    .rotationEffect(.degrees(-90))

                VStack(spacing: 4) {
                    Text("\(badges.filter { $0.isUnlocked }.count)")
                        .font(.system(size: 36, weight: .bold))
                        .foregroundColor(themeManager.currentTheme.textPrimary)

                    Text("of \(badges.count)")
                        .font(.caption)
                        .foregroundColor(themeManager.currentTheme.textSecondary)
                }
            }
            .padding()

            Text("\(Int(progressValue * 100))% Complete")
                .font(.headline)
                .foregroundColor(themeManager.currentTheme.textPrimary)
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(themeManager.currentTheme.cardBackground)
        .cornerRadius(16)
        .shadow(color: .black.opacity(0.05), radius: 8, x: 0, y: 4)
    }

    private var categoryFilter: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 12) {
                FilterButton(title: "All", isSelected: selectedCategory == nil) {
                    selectedCategory = nil
                }

                ForEach(BadgeCategory.allCases, id: \.self) { category in
                    FilterButton(title: category.rawValue, isSelected: selectedCategory == category) {
                        selectedCategory = category
                    }
                }
            }
        }
    }

    private func badgeSection(title: String, badges: [Badge]) -> some View {
        VStack(alignment: .leading, spacing: 16) {
            Text(title)
                .font(.title3)
                .fontWeight(.semibold)
                .foregroundColor(themeManager.currentTheme.textPrimary)

            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 16) {
                ForEach(badges) { badge in
                    BadgeCard(badge: badge, isUnlocked: badge.isUnlocked)
                }
            }
        }
    }

    private var progressValue: Double {
        guard !badges.isEmpty else { return 0 }
        return Double(badges.filter { $0.isUnlocked }.count) / Double(badges.count)
    }
}

struct BadgeCard: View {
    @EnvironmentObject var themeManager: ThemeManager
    let badge: Badge
    let isUnlocked: Bool

    var body: some View {
        VStack(spacing: 12) {
            // Badge icon
            ZStack {
                Circle()
                    .fill(isUnlocked ? Color(hex: badge.colorHex).opacity(0.2) : themeManager.currentTheme.textSecondary.opacity(0.1))
                    .frame(width: 80, height: 80)

                Image(systemName: badge.icon)
                    .font(.system(size: 36))
                    .foregroundColor(isUnlocked ? Color(hex: badge.colorHex) : themeManager.currentTheme.textSecondary.opacity(0.3))

                if !isUnlocked {
                    Image(systemName: "lock.fill")
                        .font(.caption)
                        .foregroundColor(themeManager.currentTheme.textSecondary)
                        .offset(x: 25, y: 25)
                }
            }

            VStack(spacing: 4) {
                Text(badge.title)
                    .font(.subheadline)
                    .fontWeight(.semibold)
                    .foregroundColor(isUnlocked ? themeManager.currentTheme.textPrimary : themeManager.currentTheme.textSecondary)
                    .multilineTextAlignment(.center)
                    .lineLimit(2)

                Text(badge.badgeDescription)
                    .font(.caption)
                    .foregroundColor(themeManager.currentTheme.textSecondary)
                    .multilineTextAlignment(.center)
                    .lineLimit(3)
            }

            if let unlockedDate = badge.unlockedDate {
                Text(unlockedDate.formatted(date: .abbreviated, time: .omitted))
                    .font(.caption2)
                    .foregroundColor(themeManager.currentTheme.textSecondary)
            }
        }
        .padding()
        .frame(maxWidth: .infinity)
        .background(themeManager.currentTheme.cardBackground)
        .cornerRadius(16)
        .shadow(color: .black.opacity(0.05), radius: 8, x: 0, y: 4)
        .opacity(isUnlocked ? 1.0 : 0.6)
    }
}

struct FilterButton: View {
    @EnvironmentObject var themeManager: ThemeManager
    let title: String
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Text(title)
                .font(.subheadline)
                .fontWeight(isSelected ? .semibold : .regular)
                .foregroundColor(isSelected ? .white : themeManager.currentTheme.textPrimary)
                .padding(.horizontal, 16)
                .padding(.vertical, 8)
                .background(isSelected ? themeManager.currentTheme.accentColor : themeManager.currentTheme.cardBackground)
                .cornerRadius(20)
                .shadow(color: .black.opacity(0.05), radius: 4, x: 0, y: 2)
        }
    }
}

#Preview {
    BadgesView()
        .environmentObject(ThemeManager())
        .modelContainer(for: [Badge.self])
}
