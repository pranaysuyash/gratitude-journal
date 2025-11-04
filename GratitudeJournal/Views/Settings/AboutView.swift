//
//  AboutView.swift
//  GratitudeJournal
//
//  About the app and credits
//

import SwiftUI

struct AboutView: View {
    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject var themeManager: ThemeManager

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 32) {
                    // App icon and name
                    VStack(spacing: 16) {
                        ZStack {
                            Circle()
                                .fill(
                                    LinearGradient(
                                        colors: [themeManager.currentTheme.primaryColor, themeManager.currentTheme.accentColor],
                                        startPoint: .topLeading,
                                        endPoint: .bottomTrailing
                                    )
                                )
                                .frame(width: 120, height: 120)

                            Image(systemName: "heart.text.square.fill")
                                .font(.system(size: 60))
                                .foregroundColor(.white)
                        }
                        .shadow(color: themeManager.currentTheme.accentColor.opacity(0.3), radius: 20, x: 0, y: 10)

                        Text("Gratitude Journal")
                            .font(.title)
                            .fontWeight(.bold)
                            .foregroundColor(themeManager.currentTheme.textPrimary)

                        Text("Version 1.0.0")
                            .font(.subheadline)
                            .foregroundColor(themeManager.currentTheme.textSecondary)
                    }
                    .padding(.top, 32)

                    // Description
                    VStack(spacing: 16) {
                        Text("About")
                            .font(.headline)
                            .foregroundColor(themeManager.currentTheme.textPrimary)

                        Text("Gratitude Journal is a beautiful, feature-rich app designed to help you cultivate happiness and mindfulness through daily gratitude practice. Track your journey, unlock achievements, and discover patterns in your gratitude.")
                            .font(.body)
                            .foregroundColor(themeManager.currentTheme.textSecondary)
                            .multilineTextAlignment(.center)
                            .padding(.horizontal)
                    }
                    .padding()
                    .background(themeManager.currentTheme.cardBackground)
                    .cornerRadius(16)
                    .shadow(color: .black.opacity(0.05), radius: 8, x: 0, y: 4)

                    // Features
                    VStack(alignment: .leading, spacing: 16) {
                        Text("Features")
                            .font(.headline)
                            .foregroundColor(themeManager.currentTheme.textPrimary)

                        VStack(alignment: .leading, spacing: 12) {
                            FeatureRow(icon: "book.fill", text: "Daily gratitude journaling")
                            FeatureRow(icon: "photo.fill", text: "Add photos and voice notes")
                            FeatureRow(icon: "chart.line.uptrend.xyaxis", text: "Track streaks and insights")
                            FeatureRow(icon: "star.fill", text: "Unlock achievements")
                            FeatureRow(icon: "sparkles", text: "Guided meditation")
                            FeatureRow(icon: "paintbrush.fill", text: "Beautiful calming themes")
                            FeatureRow(icon: "lock.fill", text: "Privacy and security")
                            FeatureRow(icon: "arrow.up.doc.fill", text: "Export your entries")
                        }
                    }
                    .padding()
                    .background(themeManager.currentTheme.cardBackground)
                    .cornerRadius(16)
                    .shadow(color: .black.opacity(0.05), radius: 8, x: 0, y: 4)

                    // Credits
                    VStack(spacing: 12) {
                        Text("Made with 💖")
                            .font(.subheadline)
                            .foregroundColor(themeManager.currentTheme.textSecondary)

                        Text("© 2024 Gratitude Journal. All rights reserved.")
                            .font(.caption)
                            .foregroundColor(themeManager.currentTheme.textSecondary)
                    }
                    .padding(.bottom, 32)
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
            .navigationBarTitleDisplayMode(.inline)
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
}

struct FeatureRow: View {
    @EnvironmentObject var themeManager: ThemeManager
    let icon: String
    let text: String

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .font(.body)
                .foregroundColor(themeManager.currentTheme.accentColor)
                .frame(width: 24)

            Text(text)
                .font(.subheadline)
                .foregroundColor(themeManager.currentTheme.textPrimary)
        }
    }
}

#Preview {
    AboutView()
        .environmentObject(ThemeManager())
}
