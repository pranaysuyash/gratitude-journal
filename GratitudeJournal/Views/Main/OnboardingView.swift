//
//  OnboardingView.swift
//  GratitudeJournal
//
//  Welcome and onboarding experience
//

import SwiftUI

struct OnboardingView: View {
    @EnvironmentObject var themeManager: ThemeManager
    @EnvironmentObject var notificationManager: NotificationManager

    @Binding var isPresented: Bool

    @State private var currentPage = 0
    @State private var selectedTheme: AppTheme = .sereneBlue

    private let pages: [OnboardingPage] = [
        OnboardingPage(
            title: "Welcome to\nGratitude Journal",
            description: "Cultivate happiness and mindfulness through daily gratitude practice",
            icon: "heart.fill",
            color: .moodGrateful
        ),
        OnboardingPage(
            title: "Write Daily Entries",
            description: "Express what you're grateful for with text, photos, and voice notes",
            icon: "book.fill",
            color: .moodPeaceful
        ),
        OnboardingPage(
            title: "Track Your Progress",
            description: "Build streaks, unlock achievements, and see your gratitude grow",
            icon: "chart.line.uptrend.xyaxis",
            color: .moodJoyful
        ),
        OnboardingPage(
            title: "Find Your Peace",
            description: "Meditate, reflect, and discover patterns in your gratitude journey",
            icon: "sparkles",
            color: .moodCalm
        )
    ]

    var body: some View {
        ZStack {
            // Background gradient
            LinearGradient(
                colors: selectedTheme.gradientColors,
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()

            VStack(spacing: 0) {
                // Skip button
                HStack {
                    Spacer()
                    Button("Skip") {
                        completeOnboarding()
                    }
                    .foregroundColor(themeManager.currentTheme.accentColor)
                    .padding()
                }

                // Pages
                TabView(selection: $currentPage) {
                    ForEach(0..<pages.count, id: \.self) { index in
                        OnboardingPageView(page: pages[index])
                            .tag(index)
                    }

                    // Theme selection page
                    ThemeSelectionPageView(selectedTheme: $selectedTheme)
                        .tag(pages.count)

                    // Notification permission page
                    NotificationPageView()
                        .tag(pages.count + 1)
                }
                .tabViewStyle(.page(indexDisplayMode: .never))

                // Page indicators
                HStack(spacing: 8) {
                    ForEach(0..<pages.count + 2, id: \.self) { index in
                        Circle()
                            .fill(currentPage == index ? themeManager.currentTheme.accentColor : themeManager.currentTheme.textSecondary.opacity(0.3))
                            .frame(width: 8, height: 8)
                            .scaleEffect(currentPage == index ? 1.2 : 1.0)
                            .animation(.spring(), value: currentPage)
                    }
                }
                .padding()

                // Next/Get Started button
                Button(action: nextPage) {
                    Text(currentPage == pages.count + 1 ? "Get Started" : "Next")
                        .font(.headline)
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(themeManager.currentTheme.accentColor)
                        .cornerRadius(16)
                }
                .padding()
            }
        }
        .onChange(of: selectedTheme) { _, newTheme in
            themeManager.setTheme(newTheme)
        }
    }

    private func nextPage() {
        if currentPage < pages.count + 1 {
            withAnimation {
                currentPage += 1
            }
        } else {
            completeOnboarding()
        }
    }

    private func completeOnboarding() {
        isPresented = false
    }
}

struct OnboardingPage {
    let title: String
    let description: String
    let icon: String
    let color: Color
}

struct OnboardingPageView: View {
    @EnvironmentObject var themeManager: ThemeManager
    let page: OnboardingPage

    var body: some View {
        VStack(spacing: 40) {
            Spacer()

            // Icon
            ZStack {
                Circle()
                    .fill(page.color.opacity(0.2))
                    .frame(width: 150, height: 150)

                Image(systemName: page.icon)
                    .font(.system(size: 60))
                    .foregroundColor(page.color)
            }

            // Title and description
            VStack(spacing: 16) {
                Text(page.title)
                    .font(.system(size: 32, weight: .bold))
                    .foregroundColor(themeManager.currentTheme.textPrimary)
                    .multilineTextAlignment(.center)

                Text(page.description)
                    .font(.body)
                    .foregroundColor(themeManager.currentTheme.textSecondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 32)
            }

            Spacer()
        }
    }
}

struct ThemeSelectionPageView: View {
    @EnvironmentObject var themeManager: ThemeManager
    @Binding var selectedTheme: AppTheme

    var body: some View {
        VStack(spacing: 40) {
            Spacer()

            VStack(spacing: 16) {
                Image(systemName: "paintbrush.fill")
                    .font(.system(size: 60))
                    .foregroundColor(themeManager.currentTheme.accentColor)

                Text("Choose Your Theme")
                    .font(.system(size: 32, weight: .bold))
                    .foregroundColor(themeManager.currentTheme.textPrimary)
                    .multilineTextAlignment(.center)

                Text("Pick a color scheme that brings you peace")
                    .font(.body)
                    .foregroundColor(themeManager.currentTheme.textSecondary)
                    .multilineTextAlignment(.center)
            }

            // Theme options
            ScrollView {
                VStack(spacing: 12) {
                    ForEach(AppTheme.allCases.prefix(4)) { theme in
                        ThemeSelectionCard(
                            theme: theme,
                            isSelected: selectedTheme == theme,
                            action: { selectedTheme = theme }
                        )
                    }
                }
                .padding(.horizontal)
            }
            .frame(maxHeight: 300)

            Spacer()
        }
    }
}

struct ThemeSelectionCard: View {
    let theme: AppTheme
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 16) {
                // Color preview
                HStack(spacing: 4) {
                    Circle()
                        .fill(theme.primaryColor)
                        .frame(width: 24, height: 24)
                    Circle()
                        .fill(theme.secondaryColor)
                        .frame(width: 24, height: 24)
                    Circle()
                        .fill(theme.accentColor)
                        .frame(width: 24, height: 24)
                }

                Text(theme.rawValue)
                    .font(.headline)
                    .foregroundColor(theme.textPrimary)

                Spacer()

                if isSelected {
                    Image(systemName: "checkmark.circle.fill")
                        .foregroundColor(theme.accentColor)
                        .font(.title3)
                }
            }
            .padding()
            .background(theme.cardBackground)
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(isSelected ? theme.accentColor : Color.clear, lineWidth: 2)
            )
            .cornerRadius(12)
            .shadow(color: .black.opacity(0.05), radius: 4, x: 0, y: 2)
        }
    }
}

struct NotificationPageView: View {
    @EnvironmentObject var themeManager: ThemeManager
    @EnvironmentObject var notificationManager: NotificationManager

    var body: some View {
        VStack(spacing: 40) {
            Spacer()

            VStack(spacing: 16) {
                Image(systemName: "bell.badge.fill")
                    .font(.system(size: 60))
                    .foregroundColor(themeManager.currentTheme.accentColor)

                Text("Stay Consistent")
                    .font(.system(size: 32, weight: .bold))
                    .foregroundColor(themeManager.currentTheme.textPrimary)
                    .multilineTextAlignment(.center)

                Text("Get gentle reminders to write your daily gratitude entries")
                    .font(.body)
                    .foregroundColor(themeManager.currentTheme.textSecondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 32)
            }

            VStack(spacing: 16) {
                Button(action: {
                    notificationManager.requestAuthorization()
                }) {
                    Text("Enable Notifications")
                        .font(.headline)
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(themeManager.currentTheme.accentColor)
                        .cornerRadius(16)
                }

                Text("You can change this later in Settings")
                    .font(.caption)
                    .foregroundColor(themeManager.currentTheme.textSecondary)
            }
            .padding(.horizontal, 32)

            Spacer()
        }
    }
}

#Preview {
    OnboardingView(isPresented: .constant(true))
        .environmentObject(ThemeManager())
        .environmentObject(NotificationManager())
}
