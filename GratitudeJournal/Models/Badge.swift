//
//  Badge.swift
//  GratitudeJournal
//
//  Achievement badges and milestones
//

import Foundation
import SwiftData

@Model
final class Badge {
    var id: UUID
    var title: String
    var badgeDescription: String
    var icon: String
    var colorHex: String
    var isUnlocked: Bool
    var unlockedDate: Date?
    var badgeType: BadgeType
    var requirement: Int
    var category: BadgeCategory

    init(
        title: String,
        description: String,
        icon: String,
        colorHex: String,
        badgeType: BadgeType,
        requirement: Int,
        category: BadgeCategory
    ) {
        self.id = UUID()
        self.title = title
        self.badgeDescription = description
        self.icon = icon
        self.colorHex = colorHex
        self.isUnlocked = false
        self.badgeType = badgeType
        self.requirement = requirement
        self.category = category
    }

    func unlock() {
        isUnlocked = true
        unlockedDate = Date()
    }

    static var allBadges: [Badge] {
        [
            // Streak Badges
            Badge(title: "Getting Started", description: "Write your first entry", icon: "star.fill", colorHex: "#FFD700", badgeType: .firstEntry, requirement: 1, category: .streak),
            Badge(title: "Three Days Strong", description: "3-day writing streak", icon: "flame.fill", colorHex: "#FF6347", badgeType: .streak, requirement: 3, category: .streak),
            Badge(title: "One Week Wonder", description: "7-day writing streak", icon: "flame.fill", colorHex: "#FF4500", badgeType: .streak, requirement: 7, category: .streak),
            Badge(title: "Two Week Warrior", description: "14-day writing streak", icon: "flame.fill", colorHex: "#FF8C00", badgeType: .streak, requirement: 14, category: .streak),
            Badge(title: "Monthly Master", description: "30-day writing streak", icon: "flame.fill", colorHex: "#FFA500", badgeType: .streak, requirement: 30, category: .streak),
            Badge(title: "Hundred Day Hero", description: "100-day writing streak", icon: "crown.fill", colorHex: "#FFD700", badgeType: .streak, requirement: 100, category: .streak),
            Badge(title: "Year of Gratitude", description: "365-day writing streak", icon: "sparkles", colorHex: "#FF1493", badgeType: .streak, requirement: 365, category: .streak),

            // Entry Count Badges
            Badge(title: "Ten Entries", description: "Write 10 gratitude entries", icon: "text.book.closed.fill", colorHex: "#87CEEB", badgeType: .entryCount, requirement: 10, category: .writing),
            Badge(title: "Fifty Entries", description: "Write 50 gratitude entries", icon: "book.fill", colorHex: "#4682B4", badgeType: .entryCount, requirement: 50, category: .writing),
            Badge(title: "Century Club", description: "Write 100 gratitude entries", icon: "books.vertical.fill", colorHex: "#1E90FF", badgeType: .entryCount, requirement: 100, category: .writing),
            Badge(title: "Grateful Writer", description: "Write 500 gratitude entries", icon: "pencil.and.list.clipboard", colorHex: "#4169E1", badgeType: .entryCount, requirement: 500, category: .writing),

            // Word Count Badges
            Badge(title: "Wordsmith", description: "Write 10,000 words total", icon: "character.cursor.ibeam", colorHex: "#9370DB", badgeType: .wordCount, requirement: 10000, category: .writing),
            Badge(title: "Novelist", description: "Write 50,000 words total", icon: "doc.text.fill", colorHex: "#8A2BE2", badgeType: .wordCount, requirement: 50000, category: .writing),

            // Photo Badges
            Badge(title: "Picture Perfect", description: "Add 10 photos to entries", icon: "photo.fill", colorHex: "#FF69B4", badgeType: .photoCount, requirement: 10, category: .creative),
            Badge(title: "Memory Keeper", description: "Add 50 photos to entries", icon: "photo.stack.fill", colorHex: "#FF1493", badgeType: .photoCount, requirement: 50, category: .creative),

            // Special Badges
            Badge(title: "Letter Writer", description: "Write your first gratitude letter", icon: "envelope.fill", colorHex: "#FFB6C1", badgeType: .firstLetter, requirement: 1, category: .special),
            Badge(title: "Voice of Gratitude", description: "Add your first voice note", icon: "mic.fill", colorHex: "#FF6B9D", badgeType: .firstVoiceNote, requirement: 1, category: .special),
            Badge(title: "Mindful Meditator", description: "Complete 10 meditation sessions", icon: "sparkles", colorHex: "#E6E6FA", badgeType: .meditation, requirement: 10, category: .mindfulness),
            Badge(title: "Early Bird", description: "Write 10 morning entries", icon: "sunrise.fill", colorHex: "#FFD700", badgeType: .morningEntry, requirement: 10, category: .timing),
            Badge(title: "Night Owl", description: "Write 10 evening entries", icon: "moon.stars.fill", colorHex: "#191970", badgeType: .eveningEntry, requirement: 10, category: .timing)
        ]
    }
}

enum BadgeType: String, Codable {
    case firstEntry
    case streak
    case entryCount
    case wordCount
    case photoCount
    case firstLetter
    case firstVoiceNote
    case meditation
    case morningEntry
    case eveningEntry
    case categoryMastery
    case social
}

enum BadgeCategory: String, Codable, CaseIterable {
    case streak = "Streaks"
    case writing = "Writing"
    case creative = "Creative"
    case special = "Special"
    case mindfulness = "Mindfulness"
    case timing = "Timing"
    case social = "Social"
}
