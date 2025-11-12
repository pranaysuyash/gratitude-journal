//
//  SettingsView.swift
//  GratitudeJournal
//
//  App settings and preferences
//

import SwiftUI
import SwiftData

struct SettingsView: View {
    @EnvironmentObject var themeManager: ThemeManager
    @EnvironmentObject var notificationManager: NotificationManager

    @Query private var reminders: [Reminder]
    @Query private var goals: [GratitudeGoal]
    @Query private var categories: [Category]

    @State private var showThemePicker = false
    @State private var showRemindersView = false
    @State private var showGoalsView = false
    @State private var showCategoriesView = false
    @State private var showExportOptions = false
    @State private var showAbout = false
    @State private var enableBiometricLock = false
    @State private var enableHaptics = true
    @State private var enableSounds = true

    // New feature views
    @State private var showVisionBoard = false
    @State private var showCollections = false
    @State private var showAffirmations = false
    @State private var showGratitudeJar = false
    @State private var showTimeCapsule = false
    @State private var showScavengerHunt = false
    @State private var showAdvancedAnalytics = false
    @State private var showTemplates = false
    @State private var showChallenges = false
    @State private var showIntegrations = false
    @State private var showSocialFeatures = false
    @State private var showGamification = false

    var body: some View {
        NavigationStack {
            List {
                // Appearance Section
                Section {
                    Button(action: { showThemePicker = true }) {
                        HStack {
                            Image(systemName: "paintbrush.fill")
                                .foregroundColor(themeManager.currentTheme.accentColor)
                                .frame(width: 30)

                            VStack(alignment: .leading, spacing: 4) {
                                Text("Theme")
                                    .foregroundColor(themeManager.currentTheme.textPrimary)
                                Text(themeManager.currentTheme.rawValue)
                                    .font(.caption)
                                    .foregroundColor(themeManager.currentTheme.textSecondary)
                            }

                            Spacer()

                            Image(systemName: "chevron.right")
                                .font(.caption)
                                .foregroundColor(themeManager.currentTheme.textSecondary)
                        }
                    }

                    Toggle(isOn: $themeManager.isDarkMode) {
                        HStack {
                            Image(systemName: themeManager.isDarkMode ? "moon.fill" : "sun.max.fill")
                                .foregroundColor(themeManager.currentTheme.accentColor)
                                .frame(width: 30)
                            Text("Dark Mode")
                                .foregroundColor(themeManager.currentTheme.textPrimary)
                        }
                    }
                    .tint(themeManager.currentTheme.accentColor)
                } header: {
                    Text("Appearance")
                }

                // Journaling Section
                Section {
                    Button(action: { showRemindersView = true }) {
                        HStack {
                            Image(systemName: "bell.fill")
                                .foregroundColor(themeManager.currentTheme.accentColor)
                                .frame(width: 30)

                            Text("Reminders")
                                .foregroundColor(themeManager.currentTheme.textPrimary)

                            Spacer()

                            Text("\(reminders.filter { $0.isEnabled }.count)")
                                .font(.subheadline)
                                .foregroundColor(themeManager.currentTheme.textSecondary)

                            Image(systemName: "chevron.right")
                                .font(.caption)
                                .foregroundColor(themeManager.currentTheme.textSecondary)
                        }
                    }

                    Button(action: { showGoalsView = true }) {
                        HStack {
                            Image(systemName: "target")
                                .foregroundColor(themeManager.currentTheme.accentColor)
                                .frame(width: 30)

                            Text("Goals")
                                .foregroundColor(themeManager.currentTheme.textPrimary)

                            Spacer()

                            Text("\(goals.filter { !$0.isCompleted }.count)")
                                .font(.subheadline)
                                .foregroundColor(themeManager.currentTheme.textSecondary)

                            Image(systemName: "chevron.right")
                                .font(.caption)
                                .foregroundColor(themeManager.currentTheme.textSecondary)
                        }
                    }

                    Button(action: { showCategoriesView = true }) {
                        HStack {
                            Image(systemName: "folder.fill")
                                .foregroundColor(themeManager.currentTheme.accentColor)
                                .frame(width: 30)

                            Text("Categories")
                                .foregroundColor(themeManager.currentTheme.textPrimary)

                            Spacer()

                            Text("\(categories.count)")
                                .font(.subheadline)
                                .foregroundColor(themeManager.currentTheme.textSecondary)

                            Image(systemName: "chevron.right")
                                .font(.caption)
                                .foregroundColor(themeManager.currentTheme.textSecondary)
                        }
                    }
                } header: {
                    Text("Journaling")
                }

                // Creative Features Section
                Section {
                    Button(action: { showVisionBoard = true }) {
                        HStack {
                            Image(systemName: "target")
                                .foregroundColor(.purple)
                                .frame(width: 30)

                            Text("Vision Board")
                                .foregroundColor(themeManager.currentTheme.textPrimary)

                            Spacer()

                            Image(systemName: "chevron.right")
                                .font(.caption)
                                .foregroundColor(themeManager.currentTheme.textSecondary)
                        }
                    }

                    Button(action: { showCollections = true }) {
                        HStack {
                            Image(systemName: "folder.fill.badge.plus")
                                .foregroundColor(.blue)
                                .frame(width: 30)

                            Text("Collections")
                                .foregroundColor(themeManager.currentTheme.textPrimary)

                            Spacer()

                            Image(systemName: "chevron.right")
                                .font(.caption)
                                .foregroundColor(themeManager.currentTheme.textSecondary)
                        }
                    }

                    Button(action: { showAffirmations = true }) {
                        HStack {
                            Image(systemName: "sparkles")
                                .foregroundColor(.orange)
                                .frame(width: 30)

                            Text("Affirmations")
                                .foregroundColor(themeManager.currentTheme.textPrimary)

                            Spacer()

                            Image(systemName: "chevron.right")
                                .font(.caption)
                                .foregroundColor(themeManager.currentTheme.textSecondary)
                        }
                    }

                    Button(action: { showGratitudeJar = true }) {
                        HStack {
                            Text("🏺")
                                .font(.title3)
                                .frame(width: 30)

                            Text("Gratitude Jar")
                                .foregroundColor(themeManager.currentTheme.textPrimary)

                            Spacer()

                            Image(systemName: "chevron.right")
                                .font(.caption)
                                .foregroundColor(themeManager.currentTheme.textSecondary)
                        }
                    }

                    Button(action: { showTimeCapsule = true }) {
                        HStack {
                            Image(systemName: "clock.arrow.circlepath")
                                .foregroundColor(.cyan)
                                .frame(width: 30)

                            Text("Time Capsule")
                                .foregroundColor(themeManager.currentTheme.textPrimary)

                            Spacer()

                            Image(systemName: "chevron.right")
                                .font(.caption)
                                .foregroundColor(themeManager.currentTheme.textSecondary)
                        }
                    }

                    Button(action: { showScavengerHunt = true }) {
                        HStack {
                            Image(systemName: "scope")
                                .foregroundColor(.green)
                                .frame(width: 30)

                            Text("Scavenger Hunts")
                                .foregroundColor(themeManager.currentTheme.textPrimary)

                            Spacer()

                            Image(systemName: "chevron.right")
                                .font(.caption)
                                .foregroundColor(themeManager.currentTheme.textSecondary)
                        }
                    }
                } header: {
                    Text("Creative Features")
                }

                // Analytics & Insights Section
                Section {
                    Button(action: { showAdvancedAnalytics = true }) {
                        HStack {
                            Image(systemName: "chart.bar.xaxis")
                                .foregroundColor(.indigo)
                                .frame(width: 30)

                            VStack(alignment: .leading, spacing: 2) {
                                Text("Advanced Analytics")
                                    .foregroundColor(themeManager.currentTheme.textPrimary)
                                Text("Word clouds, relationships, timeline")
                                    .font(.caption)
                                    .foregroundColor(themeManager.currentTheme.textSecondary)
                            }

                            Spacer()

                            Image(systemName: "chevron.right")
                                .font(.caption)
                                .foregroundColor(themeManager.currentTheme.textSecondary)
                        }
                    }
                } header: {
                    Text("Analytics")
                }

                // Templates & Challenges Section
                Section {
                    Button(action: { showTemplates = true }) {
                        HStack {
                            Image(systemName: "doc.text.fill")
                                .foregroundColor(.pink)
                                .frame(width: 30)

                            Text("Writing Templates")
                                .foregroundColor(themeManager.currentTheme.textPrimary)

                            Spacer()

                            Image(systemName: "chevron.right")
                                .font(.caption)
                                .foregroundColor(themeManager.currentTheme.textSecondary)
                        }
                    }

                    Button(action: { showChallenges = true }) {
                        HStack {
                            Image(systemName: "flag.fill")
                                .foregroundColor(.orange)
                                .frame(width: 30)

                            Text("Challenges")
                                .foregroundColor(themeManager.currentTheme.textPrimary)

                            Spacer()

                            Image(systemName: "chevron.right")
                                .font(.caption)
                                .foregroundColor(themeManager.currentTheme.textSecondary)
                        }
                    }

                    Button(action: { showGamification = true }) {
                        HStack {
                            Image(systemName: "gamecontroller.fill")
                                .foregroundColor(.purple)
                                .frame(width: 30)

                            Text("Gamification")
                                .foregroundColor(themeManager.currentTheme.textPrimary)

                            Spacer()

                            Image(systemName: "chevron.right")
                                .font(.caption)
                                .foregroundColor(themeManager.currentTheme.textSecondary)
                        }
                    }
                } header: {
                    Text("Motivation")
                }

                // Integrations Section
                Section {
                    Button(action: { showIntegrations = true }) {
                        HStack {
                            Image(systemName: "link.circle")
                                .foregroundColor(.blue)
                                .frame(width: 30)

                            VStack(alignment: .leading, spacing: 2) {
                                Text("Integrations")
                                    .foregroundColor(themeManager.currentTheme.textPrimary)
                                Text("Weather, Calendar, Music, Health")
                                    .font(.caption)
                                    .foregroundColor(themeManager.currentTheme.textSecondary)
                            }

                            Spacer()

                            Text("Coming Soon")
                                .font(.caption)
                                .padding(.horizontal, 8)
                                .padding(.vertical, 4)
                                .background(Color.orange.opacity(0.2))
                                .foregroundColor(.orange)
                                .cornerRadius(6)

                            Image(systemName: "chevron.right")
                                .font(.caption)
                                .foregroundColor(themeManager.currentTheme.textSecondary)
                        }
                    }
                } header: {
                    Text("Connect")
                }

                // Social & Family Section
                Section {
                    Button(action: { showSocialFeatures = true }) {
                        HStack {
                            Image(systemName: "person.3.fill")
                                .foregroundColor(.green)
                                .frame(width: 30)

                            VStack(alignment: .leading, spacing: 2) {
                                Text("Family & Social")
                                    .foregroundColor(themeManager.currentTheme.textPrimary)
                                Text("Share gratitude with loved ones")
                                    .font(.caption)
                                    .foregroundColor(themeManager.currentTheme.textSecondary)
                            }

                            Spacer()

                            Text("Coming Soon")
                                .font(.caption)
                                .padding(.horizontal, 8)
                                .padding(.vertical, 4)
                                .background(Color.orange.opacity(0.2))
                                .foregroundColor(.orange)
                                .cornerRadius(6)

                            Image(systemName: "chevron.right")
                                .font(.caption)
                                .foregroundColor(themeManager.currentTheme.textSecondary)
                        }
                    }
                } header: {
                    Text("Community")
                }

                // Privacy & Security
                Section {
                    Toggle(isOn: $enableBiometricLock) {
                        HStack {
                            Image(systemName: "faceid")
                                .foregroundColor(themeManager.currentTheme.accentColor)
                                .frame(width: 30)
                            VStack(alignment: .leading, spacing: 2) {
                                Text("Biometric Lock")
                                    .foregroundColor(themeManager.currentTheme.textPrimary)
                                Text("Require Face ID or Touch ID to open app")
                                    .font(.caption)
                                    .foregroundColor(themeManager.currentTheme.textSecondary)
                            }
                        }
                    }
                    .tint(themeManager.currentTheme.accentColor)
                } header: {
                    Text("Privacy & Security")
                }

                // Data Section
                Section {
                    Button(action: { showExportOptions = true }) {
                        HStack {
                            Image(systemName: "square.and.arrow.up")
                                .foregroundColor(themeManager.currentTheme.accentColor)
                                .frame(width: 30)

                            Text("Export Data")
                                .foregroundColor(themeManager.currentTheme.textPrimary)

                            Spacer()

                            Image(systemName: "chevron.right")
                                .font(.caption)
                                .foregroundColor(themeManager.currentTheme.textSecondary)
                        }
                    }

                    Button(action: {}) {
                        HStack {
                            Image(systemName: "icloud.and.arrow.up")
                                .foregroundColor(themeManager.currentTheme.accentColor)
                                .frame(width: 30)

                            VStack(alignment: .leading, spacing: 2) {
                                Text("iCloud Sync")
                                    .foregroundColor(themeManager.currentTheme.textPrimary)
                                Text("Coming soon")
                                    .font(.caption)
                                    .foregroundColor(themeManager.currentTheme.textSecondary)
                            }
                        }
                    }
                    .disabled(true)
                } header: {
                    Text("Data")
                }

                // Preferences Section
                Section {
                    Toggle(isOn: $enableHaptics) {
                        HStack {
                            Image(systemName: "hand.tap")
                                .foregroundColor(themeManager.currentTheme.accentColor)
                                .frame(width: 30)
                            Text("Haptic Feedback")
                                .foregroundColor(themeManager.currentTheme.textPrimary)
                        }
                    }
                    .tint(themeManager.currentTheme.accentColor)

                    Toggle(isOn: $enableSounds) {
                        HStack {
                            Image(systemName: "speaker.wave.2")
                                .foregroundColor(themeManager.currentTheme.accentColor)
                                .frame(width: 30)
                            Text("Sound Effects")
                                .foregroundColor(themeManager.currentTheme.textPrimary)
                        }
                    }
                    .tint(themeManager.currentTheme.accentColor)
                } header: {
                    Text("Preferences")
                }

                // About Section
                Section {
                    Button(action: { showAbout = true }) {
                        HStack {
                            Image(systemName: "info.circle")
                                .foregroundColor(themeManager.currentTheme.accentColor)
                                .frame(width: 30)

                            Text("About")
                                .foregroundColor(themeManager.currentTheme.textPrimary)

                            Spacer()

                            Image(systemName: "chevron.right")
                                .font(.caption)
                                .foregroundColor(themeManager.currentTheme.textSecondary)
                        }
                    }

                    Link(destination: URL(string: "https://example.com/privacy")!) {
                        HStack {
                            Image(systemName: "hand.raised")
                                .foregroundColor(themeManager.currentTheme.accentColor)
                                .frame(width: 30)

                            Text("Privacy Policy")
                                .foregroundColor(themeManager.currentTheme.textPrimary)

                            Spacer()

                            Image(systemName: "arrow.up.forward")
                                .font(.caption)
                                .foregroundColor(themeManager.currentTheme.textSecondary)
                        }
                    }

                    Link(destination: URL(string: "https://example.com/terms")!) {
                        HStack {
                            Image(systemName: "doc.text")
                                .foregroundColor(themeManager.currentTheme.accentColor)
                                .frame(width: 30)

                            Text("Terms of Service")
                                .foregroundColor(themeManager.currentTheme.textPrimary)

                            Spacer()

                            Image(systemName: "arrow.up.forward")
                                .font(.caption)
                                .foregroundColor(themeManager.currentTheme.textSecondary)
                        }
                    }
                } header: {
                    Text("About")
                }

                // Version
                Section {
                    HStack {
                        Text("Version")
                            .foregroundColor(themeManager.currentTheme.textSecondary)
                        Spacer()
                        Text("1.0.0")
                            .foregroundColor(themeManager.currentTheme.textSecondary)
                    }
                    .font(.caption)
                }
            }
            .navigationTitle("Settings")
            .sheet(isPresented: $showThemePicker) {
                ThemePickerView()
            }
            .sheet(isPresented: $showRemindersView) {
                RemindersView()
            }
            .sheet(isPresented: $showGoalsView) {
                GoalsView()
            }
            .sheet(isPresented: $showCategoriesView) {
                CategoriesView()
            }
            .sheet(isPresented: $showExportOptions) {
                ExportOptionsView()
            }
            .sheet(isPresented: $showAbout) {
                AboutView()
            }
            // New feature sheets
            .sheet(isPresented: $showVisionBoard) {
                VisionBoardView()
            }
            .sheet(isPresented: $showCollections) {
                CollectionsView()
            }
            .sheet(isPresented: $showAffirmations) {
                AffirmationsView()
            }
            .sheet(isPresented: $showGratitudeJar) {
                GratitudeJarView()
            }
            .sheet(isPresented: $showTimeCapsule) {
                TimeCapsuleView()
            }
            .sheet(isPresented: $showScavengerHunt) {
                ScavengerHuntView()
            }
            .sheet(isPresented: $showAdvancedAnalytics) {
                AdvancedAnalyticsView()
            }
            .sheet(isPresented: $showTemplates) {
                TemplateSelectionView()
            }
            .sheet(isPresented: $showChallenges) {
                ChallengesView()
            }
            .sheet(isPresented: $showGamification) {
                GamificationDashboardView()
            }
            .sheet(isPresented: $showIntegrations) {
                APIIntegrationsView()
            }
            .sheet(isPresented: $showSocialFeatures) {
                FamilyGroupFeaturesView()
            }
        }
    }
}

// MARK: - Theme Picker View

struct ThemePickerView: View {
    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject var themeManager: ThemeManager

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 16) {
                    ForEach(AppTheme.allCases) { theme in
                        ThemeOptionCard(theme: theme, isSelected: themeManager.currentTheme == theme) {
                            themeManager.setTheme(theme)
                            DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
                                dismiss()
                            }
                        }
                    }
                }
                .padding()
            }
            .navigationTitle("Choose Theme")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") {
                        dismiss()
                    }
                }
            }
        }
    }
}

struct ThemeOptionCard: View {
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
                        .frame(width: 30, height: 30)
                    Circle()
                        .fill(theme.secondaryColor)
                        .frame(width: 30, height: 30)
                    Circle()
                        .fill(theme.accentColor)
                        .frame(width: 30, height: 30)
                }

                VStack(alignment: .leading, spacing: 4) {
                    Text(theme.rawValue)
                        .font(.headline)
                        .foregroundColor(theme.textPrimary)

                    Text("Tap to apply")
                        .font(.caption)
                        .foregroundColor(theme.textSecondary)
                }

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
                RoundedRectangle(cornerRadius: 16)
                    .stroke(isSelected ? theme.accentColor : Color.clear, lineWidth: 2)
            )
            .cornerRadius(16)
            .shadow(color: .black.opacity(0.05), radius: 8, x: 0, y: 4)
        }
    }
}

#Preview {
    SettingsView()
        .environmentObject(ThemeManager())
        .environmentObject(NotificationManager())
        .modelContainer(for: [Reminder.self, GratitudeGoal.self, Category.self])
}
