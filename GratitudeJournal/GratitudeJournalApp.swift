//
//  GratitudeJournalApp.swift
//  GratitudeJournal
//
//  A mindful gratitude journaling app with comprehensive features
//

import SwiftUI
import SwiftData

@main
struct GratitudeJournalApp: App {
    @StateObject private var themeManager = ThemeManager()
    @StateObject private var notificationManager = NotificationManager()
    @StateObject private var audioManager = AudioManager()

    let modelContainer: ModelContainer

    init() {
        do {
            modelContainer = try ModelContainer(for:
                JournalEntry.self,
                Reminder.self,
                GratitudeGoal.self,
                Badge.self,
                Category.self,
                VisionBoard.self,
                EntryCollection.self,
                GratitudeAffirmation.self,
                GratitudeJar.self,
                TimeCapsule.self,
                FutureSelfLetter.self,
                DreamJournalEntry.self,
                GratitudeScavengerHunt.self,
                WritingTemplate.self,
                WritingChallenge.self,
                UserProgress.self,
                PrivacySettings.self,
                PrivateVault.self,
                WellnessTracking.self,
                DailyRoutine.self,
                AccessibilitySettings.self
            )
        } catch {
            fatalError("Could not initialize ModelContainer: \(error)")
        }
    }

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(themeManager)
                .environmentObject(notificationManager)
                .environmentObject(audioManager)
                .modelContainer(modelContainer)
                .preferredColorScheme(themeManager.colorScheme)
                .tint(themeManager.currentTheme.accentColor)
        }
    }
}
