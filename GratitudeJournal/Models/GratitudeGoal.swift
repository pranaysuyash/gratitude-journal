//
//  GratitudeGoal.swift
//  GratitudeJournal
//
//  Personal gratitude goals and challenges
//

import Foundation
import SwiftData

@Model
final class GratitudeGoal {
    var id: UUID
    var title: String
    var goalDescription: String
    var goalType: GoalType
    var targetValue: Int
    var currentValue: Int
    var startDate: Date
    var endDate: Date?
    var isCompleted: Bool
    var createdAt: Date

    // Specific goal parameters
    var targetWordCount: Int?
    var targetDuration: TimeInterval?
    var targetCategory: String?
    var targetStreak: Int?

    init(
        title: String,
        description: String,
        goalType: GoalType,
        targetValue: Int,
        startDate: Date = Date(),
        endDate: Date? = nil
    ) {
        self.id = UUID()
        self.title = title
        self.goalDescription = description
        self.goalType = goalType
        self.targetValue = targetValue
        self.currentValue = 0
        self.startDate = startDate
        self.endDate = endDate
        self.isCompleted = false
        self.createdAt = Date()
    }

    var progress: Double {
        guard targetValue > 0 else { return 0 }
        return min(Double(currentValue) / Double(targetValue), 1.0)
    }

    var progressPercentage: Int {
        Int(progress * 100)
    }
}

enum GoalType: String, Codable, CaseIterable {
    case dailyEntry = "Daily Entry"
    case weeklyEntries = "Weekly Entries"
    case monthlyEntries = "Monthly Entries"
    case streak = "Streak"
    case wordCount = "Word Count"
    case writingDuration = "Writing Duration"
    case photoEntries = "Photo Entries"
    case categoryFocus = "Category Focus"
    case gratitudeLetters = "Gratitude Letters"
    case meditation = "Meditation"
    case custom = "Custom"
}

enum ChallengeType: String, Codable, CaseIterable {
    case thirtyDays = "30-Day Challenge"
    case hundredDays = "100-Day Challenge"
    case yearOfGratitude = "Year of Gratitude"
    case weeklyThemes = "Weekly Themes"
    case photoChallenge = "Photo Challenge"
    case letterChallenge = "Letter Challenge"
}
