//
//  APIIntegrationsView.swift
//  GratitudeJournal
//
//  Placeholder views for external API integrations
//

import SwiftUI

struct APIIntegrationsView: View {
    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject var themeManager: ThemeManager

    var body: some View {
        NavigationStack {
            ZStack {
                themeManager.currentTheme.backgroundColor
                    .ignoresSafeArea()

                ScrollView {
                    VStack(spacing: 20) {
                        Text("Integrations")
                            .font(.largeTitle)
                            .fontWeight(.bold)
                            .padding(.top)

                        Text("Connect your favorite apps to enhance your gratitude practice")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                            .multilineTextAlignment(.center)
                            .padding(.horizontal)

                        VStack(spacing: 16) {
                            NavigationLink(destination: WeatherIntegrationView()) {
                                IntegrationCard(
                                    icon: "cloud.sun.fill",
                                    title: "Weather",
                                    description: "Add weather context to your entries",
                                    color: .blue,
                                    status: .comingSoon
                                )
                            }

                            NavigationLink(destination: CalendarIntegrationView()) {
                                IntegrationCard(
                                    icon: "calendar",
                                    title: "Calendar",
                                    description: "Sync with your calendar events",
                                    color: .red,
                                    status: .comingSoon
                                )
                            }

                            NavigationLink(destination: MusicIntegrationView()) {
                                IntegrationCard(
                                    icon: "music.note",
                                    title: "Music",
                                    description: "Add mood music to your entries",
                                    color: .purple,
                                    status: .comingSoon
                                )
                            }

                            NavigationLink(destination: HealthIntegrationView()) {
                                IntegrationCard(
                                    icon: "heart.fill",
                                    title: "Health",
                                    description: "Connect with Apple Health",
                                    color: .pink,
                                    status: .comingSoon
                                )
                            }

                            NavigationLink(destination: LocationIntegrationView()) {
                                IntegrationCard(
                                    icon: "location.fill",
                                    title: "Location",
                                    description: "Tag entries with places",
                                    color: .green,
                                    status: .comingSoon
                                )
                            }
                        }
                        .padding()
                    }
                }
            }
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Done") { dismiss() }
                }
            }
        }
    }
}

struct IntegrationCard: View {
    @EnvironmentObject var themeManager: ThemeManager
    let icon: String
    let title: String
    let description: String
    let color: Color
    let status: IntegrationStatus

    enum IntegrationStatus {
        case connected
        case comingSoon
        case disconnected
    }

    var body: some View {
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
                    .font(.subheadline)
                    .foregroundColor(themeManager.currentTheme.textSecondary)
                    .lineLimit(2)

                statusBadge
            }

            Spacer()

            Image(systemName: "chevron.right")
                .foregroundColor(themeManager.currentTheme.textSecondary)
        }
        .padding()
        .background(themeManager.currentTheme.cardBackground)
        .cornerRadius(16)
        .shadow(color: .black.opacity(0.05), radius: 8, x: 0, y: 4)
    }

    @ViewBuilder
    private var statusBadge: some View {
        switch status {
        case .connected:
            Label("Connected", systemImage: "checkmark.circle.fill")
                .font(.caption)
                .foregroundColor(.green)
        case .comingSoon:
            Text("Coming Soon")
                .font(.caption)
                .padding(.horizontal, 8)
                .padding(.vertical, 4)
                .background(Color.orange.opacity(0.2))
                .foregroundColor(.orange)
                .cornerRadius(6)
        case .disconnected:
            Text("Not Connected")
                .font(.caption)
                .foregroundColor(.secondary)
        }
    }
}

// MARK: - Weather Integration

struct WeatherIntegrationView: View {
    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject var themeManager: ThemeManager

    var body: some View {
        ComingSoonView(
            icon: "cloud.sun.fill",
            title: "Weather Integration",
            description: "Automatically add weather information to your gratitude entries. Track how weather affects your mood and gratitude practice.",
            features: [
                "Automatic weather detection",
                "Historical weather data",
                "Mood-weather correlations",
                "Weather-based entry insights"
            ],
            color: .blue
        )
    }
}

// MARK: - Calendar Integration

struct CalendarIntegrationView: View {
    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject var themeManager: ThemeManager

    var body: some View {
        ComingSoonView(
            icon: "calendar",
            title: "Calendar Integration",
            description: "Connect your calendar to add context to your entries. Reference events and milestones in your gratitude practice.",
            features: [
                "Sync with Apple Calendar",
                "Link entries to events",
                "Event-based reminders",
                "Milestone tracking"
            ],
            color: .red
        )
    }
}

// MARK: - Music Integration

struct MusicIntegrationView: View {
    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject var themeManager: ThemeManager

    var body: some View {
        ComingSoonView(
            icon: "music.note",
            title: "Music Integration",
            description: "Connect with Spotify or Apple Music to add your favorite songs to entries. Create playlists that match your gratitude journey.",
            features: [
                "Link songs to entries",
                "Gratitude-based playlists",
                "Mood music recommendations",
                "Music memory associations"
            ],
            color: .purple
        )
    }
}

// MARK: - Health Integration

struct HealthIntegrationView: View {
    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject var themeManager: ThemeManager

    var body: some View {
        ComingSoonView(
            icon: "heart.fill",
            title: "Health Integration",
            description: "Connect with Apple Health to see correlations between your wellness metrics and gratitude practice.",
            features: [
                "Sync with Apple Health",
                "Sleep tracking correlation",
                "Activity data insights",
                "Mindfulness minutes tracking"
            ],
            color: .pink
        )
    }
}

// MARK: - Location Integration

struct LocationIntegrationView: View {
    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject var themeManager: ThemeManager

    var body: some View {
        ComingSoonView(
            icon: "location.fill",
            title: "Location Services",
            description: "Tag entries with locations to remember where grateful moments happened. Build a map of your gratitude journey.",
            features: [
                "Auto-detect location",
                "Gratitude map visualization",
                "Location-based memories",
                "Travel gratitude tracking"
            ],
            color: .green
        )
    }
}

// MARK: - Generic Coming Soon View

struct ComingSoonView: View {
    @EnvironmentObject var themeManager: ThemeManager
    let icon: String
    let title: String
    let description: String
    let features: [String]
    let color: Color

    var body: some View {
        ZStack {
            themeManager.currentTheme.backgroundColor
                .ignoresSafeArea()

            ScrollView {
                VStack(spacing: 32) {
                    // Icon
                    ZStack {
                        Circle()
                            .fill(color.opacity(0.2))
                            .frame(width: 120, height: 120)

                        Image(systemName: icon)
                            .font(.system(size: 50))
                            .foregroundColor(color)
                    }
                    .padding(.top, 40)

                    // Coming Soon Badge
                    HStack {
                        Image(systemName: "clock.fill")
                        Text("Coming Soon")
                    }
                    .font(.headline)
                    .foregroundColor(.white)
                    .padding(.horizontal, 20)
                    .padding(.vertical, 10)
                    .background(Color.orange)
                    .cornerRadius(20)

                    // Description
                    VStack(spacing: 16) {
                        Text(title)
                            .font(.title2)
                            .fontWeight(.bold)
                            .multilineTextAlignment(.center)

                        Text(description)
                            .font(.body)
                            .foregroundColor(.secondary)
                            .multilineTextAlignment(.center)
                            .padding(.horizontal, 32)
                    }

                    // Planned Features
                    VStack(alignment: .leading, spacing: 16) {
                        Text("Planned Features")
                            .font(.headline)
                            .padding(.horizontal)

                        VStack(spacing: 12) {
                            ForEach(features, id: \.self) { feature in
                                HStack(spacing: 12) {
                                    Image(systemName: "checkmark.circle.fill")
                                        .foregroundColor(color)

                                    Text(feature)
                                        .font(.body)
                                        .foregroundColor(themeManager.currentTheme.textPrimary)

                                    Spacer()
                                }
                                .padding()
                                .background(themeManager.currentTheme.cardBackground)
                                .cornerRadius(12)
                            }
                        }
                        .padding(.horizontal)
                    }

                    // Info box
                    VStack(spacing: 12) {
                        Image(systemName: "info.circle")
                            .font(.title2)
                            .foregroundColor(themeManager.currentTheme.accentColor)

                        Text("This feature requires external API integration and will be available in a future update.")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                            .multilineTextAlignment(.center)
                            .padding(.horizontal, 32)
                    }
                    .padding()
                    .background(themeManager.currentTheme.accentColor.opacity(0.1))
                    .cornerRadius(16)
                    .padding(.horizontal)

                    Spacer()
                }
            }
        }
        .navigationTitle(title)
        .navigationBarTitleDisplayMode(.inline)
    }
}

#Preview {
    APIIntegrationsView()
        .environmentObject(ThemeManager())
}
