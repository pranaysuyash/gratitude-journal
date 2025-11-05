//
//  WritingTemplate.swift
//  GratitudeJournal
//
//  Writing templates and challenges for enhanced journaling
//

import Foundation
import SwiftData

@Model
final class WritingTemplate {
    var id: UUID
    var name: String
    var templateDescription: String
    var type: TemplateType
    var prompts: [String]
    var estimatedDuration: Int // minutes
    var difficultyLevel: DifficultyLevel
    var isUnlocked: Bool

    init(name: String, description: String, type: TemplateType, prompts: [String], duration: Int, difficulty: DifficultyLevel, unlocked: Bool = true) {
        self.id = UUID()
        self.name = name
        self.templateDescription = description
        self.type = type
        self.prompts = prompts
        self.estimatedDuration = duration
        self.difficultyLevel = difficulty
        self.isUnlocked = unlocked
    }

    static var defaultTemplates: [WritingTemplate] {
        [
            // Quick Templates
            WritingTemplate(
                name: "Quick Gratitude (5-min)",
                description: "Fast and focused gratitude practice",
                type: .quick,
                prompts: [
                    "What are 3 things you're grateful for right now?",
                    "Who made your day better today?",
                    "What simple pleasure did you enjoy?"
                ],
                duration: 5,
                difficulty: .beginner
            ),

            // Detailed Templates
            WritingTemplate(
                name: "Deep Reflection",
                description: "Thorough exploration of gratitude",
                type: .detailed,
                prompts: [
                    "Describe a person you're grateful for and why",
                    "What challenge taught you something valuable?",
                    "How has gratitude changed your perspective recently?",
                    "What opportunity are you thankful to have?",
                    "Reflect on a moment that brought you joy"
                ],
                duration: 15,
                difficulty: .advanced
            ),

            // Letter Template
            WritingTemplate(
                name: "Gratitude Letter",
                description: "Write a heartfelt letter of thanks",
                type: .letter,
                prompts: [
                    "Who are you writing to?",
                    "What specific things are you grateful for about them?",
                    "How have they impacted your life?",
                    "What do you want them to know?",
                    "How can you express your appreciation?"
                ],
                duration: 20,
                difficulty: .intermediate
            ),

            // Guided Templates
            WritingTemplate(
                name: "Morning Gratitude",
                description: "Start your day with appreciation",
                type: .guided,
                prompts: [
                    "What are you looking forward to today?",
                    "What comfort or blessing do you have right now?",
                    "Who can you appreciate today?"
                ],
                duration: 7,
                difficulty: .beginner
            ),

            WritingTemplate(
                name: "Evening Reflection",
                description: "End your day with gratitude",
                type: .guided,
                prompts: [
                    "What went well today?",
                    "Who helped or supported you?",
                    "What did you learn?",
                    "What moment made you smile?"
                ],
                duration: 10,
                difficulty: .beginner
            ),

            // Themed Templates
            WritingTemplate(
                name: "Gratitude for Challenges",
                description: "Find growth in difficult moments",
                type: .themed,
                prompts: [
                    "What challenge are you facing?",
                    "What strength have you discovered?",
                    "What support do you have?",
                    "What lesson is this teaching you?",
                    "How are you growing?"
                ],
                duration: 15,
                difficulty: .advanced
            ),

            WritingTemplate(
                name: "Relationship Gratitude",
                description: "Appreciate the people in your life",
                type: .themed,
                prompts: [
                    "Who made you feel loved recently?",
                    "What quality do you appreciate in someone close to you?",
                    "What memory with a loved one brings you joy?",
                    "Who has supported you lately?"
                ],
                duration: 12,
                difficulty: .intermediate
            )
        ]
    }
}

@Model
final class WritingChallenge {
    var id: UUID
    var title: String
    var challengeDescription: String
    var type: ChallengeType
    var targetDays: Int
    var currentDay: Int
    var startDate: Date
    var isActive: Bool
    var completedDates: [Date]

    init(title: String, description: String, type: ChallengeType, targetDays: Int) {
        self.id = UUID()
        self.title = title
        self.challengeDescription = description
        self.type = type
        self.targetDays = targetDays
        self.currentDay = 0
        self.startDate = Date()
        self.isActive = true
        self.completedDates = []
    }

    var progress: Double {
        Double(currentDay) / Double(targetDays)
    }

    var isCompleted: Bool {
        currentDay >= targetDays
    }

    func recordEntry() {
        if !completedDates.contains(where: { Calendar.current.isDate($0, inSameDayAs: Date()) }) {
            completedDates.append(Date())
            currentDay += 1
        }
    }

    static var thirtyDayChallenge: WritingChallenge {
        WritingChallenge(
            title: "30-Day Gratitude Challenge",
            description: "Write one gratitude entry every day for 30 days",
            type: .thirtyDays,
            targetDays: 30
        )
    }

    static var hundredDayChallenge: WritingChallenge {
        WritingChallenge(
            title: "100-Day Gratitude Journey",
            description: "Commit to 100 days of consistent gratitude practice",
            type: .hundredDays,
            targetDays: 100
        )
    }
}

enum TemplateType: String, Codable {
    case quick = "Quick (5-min)"
    case detailed = "Detailed"
    case guided = "Guided"
    case letter = "Letter"
    case themed = "Themed"
    case freeForm = "Free-form"
}

enum DifficultyLevel: String, Codable, CaseIterable {
    case beginner = "Beginner"
    case intermediate = "Intermediate"
    case advanced = "Advanced"

    var icon: String {
        switch self {
        case .beginner: return "1.circle.fill"
        case .intermediate: return "2.circle.fill"
        case .advanced: return "3.circle.fill"
        }
    }

    var description: String {
        switch self {
        case .beginner: return "Perfect for getting started"
        case .intermediate: return "For developing your practice"
        case .advanced: return "Deep, reflective exploration"
        }
    }
}

enum ChallengeType: String, Codable {
    case thirtyDays = "30-Day Challenge"
    case hundredDays = "100-Day Challenge"
    case weekly = "Weekly Challenge"
    case monthly = "Monthly Challenge"
}
