//
//  FamilyGroupFeaturesView.swift
//  GratitudeJournal
//
//  Placeholder views for family and group features
//

import SwiftUI

struct FamilyGroupFeaturesView: View {
    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject var themeManager: ThemeManager

    var body: some View {
        NavigationStack {
            ZStack {
                themeManager.currentTheme.backgroundColor
                    .ignoresSafeArea()

                ScrollView {
                    VStack(spacing: 20) {
                        Text("Share Gratitude")
                            .font(.largeTitle)
                            .fontWeight(.bold)
                            .padding(.top)

                        Text("Connect with family and friends to share your gratitude journey")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                            .multilineTextAlignment(.center)
                            .padding(.horizontal)

                        VStack(spacing: 16) {
                            NavigationLink(destination: FamilyJournalView()) {
                                FeatureCard(
                                    icon: "person.3.fill",
                                    title: "Family Journal",
                                    description: "Create a shared gratitude journal with your family",
                                    color: .blue
                                )
                            }

                            NavigationLink(destination: GroupChallengesView()) {
                                FeatureCard(
                                    icon: "flag.2.crossed.fill",
                                    title: "Group Challenges",
                                    description: "Join friends in gratitude challenges",
                                    color: .orange
                                )
                            }

                            NavigationLink(destination: SharedJarView()) {
                                FeatureCard(
                                    icon: "heart.circle.fill",
                                    title: "Shared Gratitude Jar",
                                    description: "Contribute to a family gratitude jar",
                                    color: .pink
                                )
                            }

                            NavigationLink(destination: CommunityView()) {
                                FeatureCard(
                                    icon: "globe",
                                    title: "Community",
                                    description: "Connect with the gratitude community",
                                    color: .green
                                )
                            }

                            NavigationLink(destination: GratitudeExchangeView()) {
                                FeatureCard(
                                    icon: "arrow.triangle.2.circlepath",
                                    title: "Gratitude Exchange",
                                    description: "Send and receive gratitude with others",
                                    color: .purple
                                )
                            }

                            NavigationLink(destination: CollaborativeGoalsView()) {
                                FeatureCard(
                                    icon: "target",
                                    title: "Collaborative Goals",
                                    description: "Set and achieve goals together",
                                    color: .red
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

struct FeatureCard: View {
    @EnvironmentObject var themeManager: ThemeManager
    let icon: String
    let title: String
    let description: String
    let color: Color

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

                Text("Coming Soon")
                    .font(.caption)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(Color.orange.opacity(0.2))
                    .foregroundColor(.orange)
                    .cornerRadius(6)
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
}

// MARK: - Family Journal

struct FamilyJournalView: View {
    @EnvironmentObject var themeManager: ThemeManager

    var body: some View {
        SocialFeatureComingSoonView(
            icon: "person.3.fill",
            title: "Family Journal",
            description: "Create a shared space where your whole family can contribute gratitude entries and celebrate together.",
            features: [
                "Shared family journal space",
                "Member-specific entry privacy",
                "Family gratitude timeline",
                "Celebration milestones",
                "Photo sharing and memories",
                "Custom family themes"
            ],
            benefits: [
                "Strengthen family bonds through shared gratitude",
                "Build positive family traditions",
                "Create lasting memories together"
            ],
            requiresBackend: true,
            color: .blue
        )
    }
}

// MARK: - Group Challenges

struct GroupChallengesView: View {
    @EnvironmentObject var themeManager: ThemeManager

    var body: some View {
        SocialFeatureComingSoonView(
            icon: "flag.2.crossed.fill",
            title: "Group Challenges",
            description: "Create or join gratitude challenges with friends and family. Motivate each other and track progress together.",
            features: [
                "Create custom group challenges",
                "Join public or private challenges",
                "Real-time progress tracking",
                "Leaderboards and achievements",
                "Group chat and encouragement",
                "Challenge rewards and badges"
            ],
            benefits: [
                "Stay motivated with group accountability",
                "Celebrate achievements together",
                "Build lasting gratitude habits"
            ],
            requiresBackend: true,
            color: .orange
        )
    }
}

// MARK: - Shared Gratitude Jar

struct SharedJarView: View {
    @EnvironmentObject var themeManager: ThemeManager

    var body: some View {
        SocialFeatureComingSoonView(
            icon: "heart.circle.fill",
            title: "Shared Gratitude Jar",
            description: "Contribute notes to a family or group gratitude jar. Perfect for holidays, special events, or daily appreciation.",
            features: [
                "Multiple shared jars",
                "Anonymous contributions option",
                "Scheduled reveal times",
                "Print jar contents",
                "Special occasion templates",
                "Contribution reminders"
            ],
            benefits: [
                "Collect gratitude from everyone",
                "Create meaningful group traditions",
                "Surprise reveals for special occasions"
            ],
            requiresBackend: true,
            color: .pink
        )
    }
}

// MARK: - Community

struct CommunityView: View {
    @EnvironmentObject var themeManager: ThemeManager

    var body: some View {
        SocialFeatureComingSoonView(
            icon: "globe",
            title: "Community",
            description: "Join a worldwide community of gratitude practitioners. Share inspiration, participate in global challenges, and spread positivity.",
            features: [
                "Global gratitude feed",
                "Community challenges",
                "Discussion forums",
                "Gratitude stories",
                "Expert tips and guidance",
                "Anonymous participation option"
            ],
            benefits: [
                "Find inspiration from others",
                "Share your gratitude journey",
                "Connect with like-minded people"
            ],
            requiresBackend: true,
            color: .green
        )
    }
}

// MARK: - Gratitude Exchange

struct GratitudeExchangeView: View {
    @EnvironmentObject var themeManager: ThemeManager

    var body: some View {
        SocialFeatureComingSoonView(
            icon: "arrow.triangle.2.circlepath",
            title: "Gratitude Exchange",
            description: "Send gratitude messages to friends and family. Receive appreciation and build a culture of thankfulness.",
            features: [
                "Send gratitude messages",
                "Gratitude cards and templates",
                "Schedule future deliveries",
                "Track sent and received",
                "Response notifications",
                "Gratitude streak with friends"
            ],
            benefits: [
                "Strengthen relationships",
                "Express appreciation directly",
                "Create positive feedback loops"
            ],
            requiresBackend: true,
            color: .purple
        )
    }
}

// MARK: - Collaborative Goals

struct CollaborativeGoalsView: View {
    @EnvironmentObject var themeManager: ThemeManager

    var body: some View {
        SocialFeatureComingSoonView(
            icon: "target",
            title: "Collaborative Goals",
            description: "Set gratitude goals with partners, family, or friends. Work together towards shared milestones and celebrate together.",
            features: [
                "Shared goal creation",
                "Individual and group milestones",
                "Progress visualization",
                "Goal chat and updates",
                "Celebration triggers",
                "Team achievements"
            ],
            benefits: [
                "Achieve more together",
                "Build accountability",
                "Celebrate shared success"
            ],
            requiresBackend: true,
            color: .red
        )
    }
}

// MARK: - Generic Social Feature Coming Soon View

struct SocialFeatureComingSoonView: View {
    @EnvironmentObject var themeManager: ThemeManager
    let icon: String
    let title: String
    let description: String
    let features: [String]
    let benefits: [String]
    let requiresBackend: Bool
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

                    // Features
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

                    // Benefits
                    VStack(alignment: .leading, spacing: 16) {
                        Text("Benefits")
                            .font(.headline)
                            .padding(.horizontal)

                        VStack(spacing: 12) {
                            ForEach(benefits, id: \.self) { benefit in
                                HStack(spacing: 12) {
                                    Image(systemName: "star.fill")
                                        .foregroundColor(.yellow)

                                    Text(benefit)
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

                        if requiresBackend {
                            Text("This feature requires cloud infrastructure and backend services. It will be available in a future update when server infrastructure is implemented.")
                                .font(.subheadline)
                                .foregroundColor(.secondary)
                                .multilineTextAlignment(.center)
                                .padding(.horizontal, 32)
                        } else {
                            Text("This feature is currently in development and will be available in a future update.")
                                .font(.subheadline)
                                .foregroundColor(.secondary)
                                .multilineTextAlignment(.center)
                                .padding(.horizontal, 32)
                        }
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
    FamilyGroupFeaturesView()
        .environmentObject(ThemeManager())
}
