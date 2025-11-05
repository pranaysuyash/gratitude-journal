//
//  GamificationSystem.swift
//  GratitudeJournal
//
//  Gamification features: points, streak recovery, unlockables
//

import Foundation
import SwiftData

@Model
final class UserProgress {
    var id: UUID
    var totalPoints: Int
    var streakRecoveryTokens: Int
    var unlockedThemes: [String]
    var gratitudeGardenLevel: Int
    var lastStreakSaveDate: Date?
    var currentSeasonalChallenge: String?

    init() {
        self.id = UUID()
        self.totalPoints = 0
        self.streakRecoveryTokens = 3 // Start with 3 tokens
        self.unlockedThemes = ["sereneBlue"] // Default theme
        self.gratitudeGardenLevel = 0
    }

    // MARK: - Points System

    func awardPoints(_ points: Int, for action: GratitudeAction) {
        totalPoints += points
        checkForUnlocks()
    }

    func checkForUnlocks() {
        // Unlock themes based on points
        if totalPoints >= 100 && !unlockedThemes.contains("calmLavender") {
            unlockedThemes.append("calmLavender")
        }
        if totalPoints >= 250 && !unlockedThemes.contains("peacefulGreen") {
            unlockedThemes.append("peacefulGreen")
        }
        if totalPoints >= 500 && !unlockedThemes.contains("warmSunset") {
            unlockedThemes.append("warmSunset")
        }
        if totalPoints >= 1000 && !unlockedThemes.contains("gentlePink") {
            unlockedThemes.append("gentlePink")
        }
        if totalPoints >= 2000 && !unlockedThemes.contains("softMint") {
            unlockedThemes.append("softMint")
        }
        if totalPoints >= 3000 && !unlockedThemes.contains("tranquilSage") {
            unlockedThemes.append("tranquilSage")
        }
        if totalPoints >= 5000 && !unlockedThemes.contains("cozyBeige") {
            unlockedThemes.append("cozyBeige")
        }
    }

    // MARK: - Streak Recovery

    func canUseStreakRecovery() -> Bool {
        guard streakRecoveryTokens > 0 else { return false }

        // Can only use once per week
        if let lastUse = lastStreakSaveDate {
            let weekAgo = Calendar.current.date(byAdding: .day, value: -7, to: Date()) ?? Date()
            return lastUse < weekAgo
        }

        return true
    }

    func useStreakRecovery() -> Bool {
        guard canUseStreakRecovery() else { return false }

        streakRecoveryTokens -= 1
        lastStreakSaveDate = Date()
        return true
    }

    func earnStreakRecoveryToken() {
        streakRecoveryTokens += 1
    }

    // MARK: - Gratitude Garden

    func waterGarden() {
        gratitudeGardenLevel += 1
    }

    var gardenGrowthStage: GardenStage {
        switch gratitudeGardenLevel {
        case 0...10: return .seedling
        case 11...30: return .sprout
        case 31...60: return .plant
        case 61...100: return .flowering
        default: return .fullBloom
        }
    }
}

// MARK: - Enums

enum GratitudeAction {
    case writeEntry
    case addPhoto
    case addVoiceNote
    case writeGratitudeLetter
    case completeMeditation
    case achieveStreak(days: Int)
    case completeGoal
    case shareEntry

    var points: Int {
        switch self {
        case .writeEntry: return 10
        case .addPhoto: return 5
        case .addVoiceNote: return 5
        case .writeGratitudeLetter: return 25
        case .completeMeditation: return 15
        case .achieveStreak(let days): return days * 5
        case .completeGoal: return 50
        case .shareEntry: return 10
        }
    }
}

enum GardenStage: String {
    case seedling = "Seedling"
    case sprout = "Sprout"
    case plant = "Growing Plant"
    case flowering = "Flowering"
    case fullBloom = "Full Bloom"

    var emoji: String {
        switch self {
        case .seedling: return "🌱"
        case .sprout: return "🌿"
        case .plant: return "🪴"
        case .flowering: return "🌸"
        case .fullBloom: return "🌺"
        }
    }

    var description: String {
        switch self {
        case .seedling: return "Your gratitude practice is just beginning to take root"
        case .sprout: return "Your gratitude is growing stronger each day"
        case .plant: return "Your practice is flourishing beautifully"
        case .flowering: return "Your gratitude blooms with vibrant energy"
        case .fullBloom: return "Your gratitude garden is in magnificent full bloom"
        }
    }
}

@Model
final class SeasonalChallenge {
    var id: UUID
    var title: String
    var description: String
    var season: Season
    var startDate: Date
    var endDate: Date
    var targetEntries: Int
    var isActive: Bool

    init(title: String, description: String, season: Season, targetEntries: Int) {
        self.id = UUID()
        self.title = title
        self.description = description
        self.season = season
        self.startDate = Date()
        self.endDate = Calendar.current.date(byAdding: .month, value: 3, to: Date()) ?? Date()
        self.targetEntries = targetEntries
        self.isActive = true
    }

    static var springChallenge: SeasonalChallenge {
        SeasonalChallenge(
            title: "Spring Renewal",
            description: "Write about new beginnings and growth this spring",
            season: .spring,
            targetEntries: 30
        )
    }

    static var summerChallenge: SeasonalChallenge {
        SeasonalChallenge(
            title: "Summer Joy",
            description: "Capture moments of sunshine and warmth",
            season: .summer,
            targetEntries: 30
        )
    }

    static var autumnChallenge: SeasonalChallenge {
        SeasonalChallenge(
            title: "Autumn Harvest",
            description: "Reflect on abundance and gratitude",
            season: .autumn,
            targetEntries: 30
        )
    }

    static var winterChallenge: SeasonalChallenge {
        SeasonalChallenge(
            title: "Winter Warmth",
            description: "Find gratitude in cozy moments",
            season: .winter,
            targetEntries: 30
        )
    }
}
