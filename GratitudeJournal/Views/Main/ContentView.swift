//
//  ContentView.swift
//  GratitudeJournal
//
//  Main app interface with tab navigation
//

import SwiftUI
import SwiftData

struct ContentView: View {
    @EnvironmentObject var themeManager: ThemeManager
    @State private var selectedTab = 0
    @State private var showOnboarding = false

    var body: some View {
        TabView(selection: $selectedTab) {
            HomeView()
                .tabItem {
                    Label("Home", systemImage: "house.fill")
                }
                .tag(0)

            JournalListView()
                .tabItem {
                    Label("Journal", systemImage: "book.fill")
                }
                .tag(1)

            NewEntryView()
                .tabItem {
                    Label("Write", systemImage: "plus.circle.fill")
                }
                .tag(2)

            AnalyticsView()
                .tabItem {
                    Label("Insights", systemImage: "chart.line.uptrend.xyaxis")
                }
                .tag(3)

            SettingsView()
                .tabItem {
                    Label("Settings", systemImage: "gear")
                }
                .tag(4)
        }
        .accentColor(themeManager.currentTheme.accentColor)
        .sheet(isPresented: $showOnboarding) {
            OnboardingView(isPresented: $showOnboarding)
        }
        .onAppear {
            checkFirstLaunch()
            setupTabBarAppearance()
        }
    }

    private func checkFirstLaunch() {
        let hasLaunchedBefore = UserDefaults.standard.bool(forKey: "hasLaunchedBefore")
        if !hasLaunchedBefore {
            showOnboarding = true
            UserDefaults.standard.set(true, forKey: "hasLaunchedBefore")
        }
    }

    private func setupTabBarAppearance() {
        let appearance = UITabBarAppearance()
        appearance.configureWithOpaqueBackground()
        appearance.backgroundColor = UIColor(themeManager.currentTheme.cardBackground)

        UITabBar.appearance().standardAppearance = appearance
        UITabBar.appearance().scrollEdgeAppearance = appearance
    }
}

#Preview {
    ContentView()
        .environmentObject(ThemeManager())
        .environmentObject(NotificationManager())
        .environmentObject(AudioManager())
        .modelContainer(for: [JournalEntry.self, Reminder.self, GratitudeGoal.self, Badge.self, Category.self])
}
