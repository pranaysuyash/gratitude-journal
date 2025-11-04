//
//  JournalEntry.swift
//  GratitudeJournal
//
//  Core model for gratitude journal entries
//

import Foundation
import SwiftData
import CoreLocation

@Model
final class JournalEntry {
    var id: UUID
    var content: String
    var date: Date
    var createdAt: Date
    var modifiedAt: Date

    // Mood & Emotions
    var mood: MoodType
    var emotions: [EmotionType]

    // Media
    var photoURLs: [String]
    var voiceNoteURL: String?
    var voiceNoteDuration: TimeInterval?

    // Organization
    var tags: [String]
    var categories: [String]
    var isPinned: Bool
    var isDraft: Bool
    var isPrivate: Bool

    // Location & Weather
    var locationName: String?
    var latitude: Double?
    var longitude: Double?
    var weatherCondition: WeatherCondition?
    var temperature: Double?
    var season: Season

    // People & Activities
    var peopleMentioned: [String]
    var activities: [String]

    // Writing Metadata
    var wordCount: Int
    var writingDuration: TimeInterval
    var templateUsed: String?
    var promptUsed: String?

    // AI Analysis
    var sentimentScore: Double?
    var keyThemes: [String]
    var aiSummary: String?

    // Special Types
    var isGratitudeLetter: Bool
    var letterRecipient: String?
    var isTimeCapsule: Bool
    var unlockDate: Date?

    init(
        content: String,
        date: Date = Date(),
        mood: MoodType = .grateful,
        emotions: [EmotionType] = [],
        photoURLs: [String] = [],
        tags: [String] = [],
        categories: [String] = [],
        isPinned: Bool = false,
        isDraft: Bool = false,
        isPrivate: Bool = false,
        peopleMentioned: [String] = [],
        activities: [String] = [],
        season: Season = .spring
    ) {
        self.id = UUID()
        self.content = content
        self.date = date
        self.createdAt = Date()
        self.modifiedAt = Date()
        self.mood = mood
        self.emotions = emotions
        self.photoURLs = photoURLs
        self.tags = tags
        self.categories = categories
        self.isPinned = isPinned
        self.isDraft = isDraft
        self.isPrivate = isPrivate
        self.peopleMentioned = peopleMentioned
        self.activities = activities
        self.wordCount = content.split(separator: " ").count
        self.writingDuration = 0
        self.keyThemes = []
        self.isGratitudeLetter = false
        self.isTimeCapsule = false
        self.season = season
    }

    var isLocked: Bool {
        guard isTimeCapsule, let unlockDate = unlockDate else { return false }
        return Date() < unlockDate
    }
}

// MARK: - Enums
enum MoodType: String, Codable, CaseIterable {
    case joyful = "Joyful"
    case peaceful = "Peaceful"
    case grateful = "Grateful"
    case hopeful = "Hopeful"
    case reflective = "Reflective"
    case content = "Content"
    case inspired = "Inspired"
    case calm = "Calm"
    case energetic = "Energetic"
    case loved = "Loved"

    var emoji: String {
        switch self {
        case .joyful: return "😊"
        case .peaceful: return "😌"
        case .grateful: return "🙏"
        case .hopeful: return "🌟"
        case .reflective: return "🤔"
        case .content: return "😊"
        case .inspired: return "✨"
        case .calm: return "🧘"
        case .energetic: return "⚡"
        case .loved: return "💖"
        }
    }

    var color: String {
        switch self {
        case .joyful: return "moodJoyful"
        case .peaceful: return "moodPeaceful"
        case .grateful: return "moodGrateful"
        case .hopeful: return "moodHopeful"
        case .reflective: return "moodReflective"
        case .content: return "moodContent"
        case .inspired: return "moodInspired"
        case .calm: return "moodCalm"
        case .energetic: return "moodJoyful"
        case .loved: return "moodGrateful"
        }
    }
}

enum EmotionType: String, Codable, CaseIterable {
    case happy, thankful, blessed, amazed, excited
    case peaceful, relaxed, serene, content, satisfied
    case loved, appreciated, connected, supported, valued
    case proud, accomplished, successful, confident, empowered
    case hopeful, optimistic, inspired, motivated, encouraged
}

enum WeatherCondition: String, Codable, CaseIterable {
    case sunny, cloudy, rainy, snowy, windy, foggy, stormy, clear
}

enum Season: String, Codable, CaseIterable {
    case spring, summer, autumn, winter

    static func current() -> Season {
        let month = Calendar.current.component(.month, from: Date())
        switch month {
        case 3...5: return .spring
        case 6...8: return .summer
        case 9...11: return .autumn
        default: return .winter
        }
    }
}
