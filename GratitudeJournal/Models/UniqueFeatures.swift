//
//  UniqueFeatures.swift
//  GratitudeJournal
//
//  Unique and creative features for gratitude journaling
//

import Foundation
import SwiftData

@Model
final class TimeCapsule {
    var id: UUID
    var entryID: UUID
    var createDate: Date
    var unlockDate: Date
    var title: String
    var message: String
    var futureMessage: String? // Message to future self
    var isUnlocked: Bool

    init(entryID: UUID, unlockDate: Date, title: String, message: String) {
        self.id = UUID()
        self.entryID = entryID
        self.createDate = Date()
        self.unlockDate = unlockDate
        self.title = title
        self.message = message
        self.isUnlocked = false
    }

    var isReady: Bool {
        Date() >= unlockDate
    }

    var daysUntilUnlock: Int {
        Calendar.current.dateComponents([.day], from: Date(), to: unlockDate).day ?? 0
    }

    func unlock() {
        if isReady {
            isUnlocked = true
        }
    }
}

@Model
final class FutureSelfLetter {
    var id: UUID
    var content: String
    var createdDate: Date
    var deliveryDate: Date
    var isDelivered: Bool
    var tags: [String]

    init(content: String, deliveryDate: Date) {
        self.id = UUID()
        self.content = content
        self.createdDate = Date()
        self.deliveryDate = deliveryDate
        self.isDelivered = false
        self.tags = []
    }

    var isReady: Bool {
        Date() >= deliveryDate
    }
}

@Model
final class DreamJournalEntry {
    var id: UUID
    var date: Date
    var dreamContent: String
    var dreamMood: String
    var gratitudeFromDream: String // What you're grateful to learn from the dream
    var symbols: [String]
    var isRecurring: Bool

    init(content: String, mood: String, gratitude: String) {
        self.id = UUID()
        self.date = Date()
        self.dreamContent = content
        self.dreamMood = mood
        self.gratitudeFromDream = gratitude
        self.symbols = []
        self.isRecurring = false
    }
}

@Model
final class GratitudeJar {
    var id: UUID
    var name: String
    var notes: [JarNote]
    var createdDate: Date
    var type: JarType

    init(name: String, type: JarType = .personal) {
        self.id = UUID()
        self.name = name
        self.notes = []
        self.createdDate = Date()
        self.type = type
    }

    func addNote(_ content: String) {
        notes.append(JarNote(content: content))
    }

    var noteCount: Int {
        notes.count
    }
}

struct JarNote: Codable {
    var id: UUID
    var content: String
    var date: Date
    var wasRead: Bool

    init(content: String) {
        self.id = UUID()
        self.content = content
        self.date = Date()
        self.wasRead = false
    }
}

enum JarType: String, Codable {
    case personal = "Personal"
    case couple = "For Two"
    case family = "Family Jar"
}

@Model
final class VisionBoard {
    var id: UUID
    var title: String
    var items: [VisionBoardItem]
    var createdDate: Date
    var theme: String

    init(title: String, theme: String = "Gratitude") {
        self.id = UUID()
        self.title = title
        self.items = []
        self.createdDate = Date()
        self.theme = theme
    }

    func addItem(_ item: VisionBoardItem) {
        items.append(item)
    }
}

struct VisionBoardItem: Codable {
    var id: UUID
    var type: ItemType
    var content: String
    var imageURL: String?
    var position: Position

    enum ItemType: String, Codable {
        case text
        case image
        case affirmation
        case goal
    }

    struct Position: Codable {
        var x: Double
        var y: Double
    }

    init(type: ItemType, content: String, x: Double = 0, y: Double = 0) {
        self.id = UUID()
        self.type = type
        self.content = content
        self.position = Position(x: x, y: y)
    }
}

@Model
final class GratitudeAffirmation {
    var id: UUID
    var text: String
    var sourceEntryID: UUID?
    var category: String
    var isFavorite: Bool
    var createdDate: Date

    init(text: String, category: String = "General", sourceEntryID: UUID? = nil) {
        self.id = UUID()
        self.text = text
        self.sourceEntryID = sourceEntryID
        self.category = category
        self.isFavorite = false
        self.createdDate = Date()
    }

    static func generateFromEntry(_ entry: JournalEntry) -> GratitudeAffirmation {
        // Simple affirmation generator
        let affirmationTemplates = [
            "I am grateful for",
            "I appreciate",
            "I am thankful for",
            "I celebrate",
            "I recognize"
        ]

        let template = affirmationTemplates.randomElement()!
        let words = entry.content.components(separatedBy: .whitespacesAndNewlines).prefix(10)
        let excerpt = words.joined(separator: " ")

        return GratitudeAffirmation(
            text: "\(template) \(excerpt)",
            sourceEntryID: entry.id
        )
    }
}

@Model
final class GratitudeScavengerHunt {
    var id: UUID
    var title: String
    var items: [ScavengerItem]
    var startDate: Date
    var endDate: Date?
    var isActive: Bool

    init(title: String, items: [ScavengerItem]) {
        self.id = UUID()
        self.title = title
        self.items = items
        self.startDate = Date()
        self.isActive = true
    }

    var progress: Double {
        let completed = items.filter { $0.isFound }.count
        return Double(completed) / Double(items.count)
    }
}

struct ScavengerItem: Codable {
    var id: UUID
    var prompt: String
    var isFound: Bool
    var foundDate: Date?
    var photoURL: String?
    var note: String?

    init(prompt: String) {
        self.id = UUID()
        self.prompt = prompt
        self.isFound = false
    }

    mutating func markFound(note: String? = nil, photoURL: String? = nil) {
        isFound = true
        foundDate = Date()
        self.note = note
        self.photoURL = photoURL
    }
}

// Accessibility Settings
@Model
final class AccessibilitySettings {
    var id: UUID

    // Visual
    var useDyslexiaFont: Bool
    var useHighContrast: Bool
    var textSizeMultiplier: Double // 1.0 = normal, up to 2.0
    var reduceMotion: Bool

    // Audio
    var textToSpeechEnabled: Bool
    var voiceToTextEnabled: Bool
    var speechRate: Double // 0.5 - 2.0

    // Language
    var preferredLanguage: String

    // Color-blind modes
    var colorBlindMode: ColorBlindMode

    init() {
        self.id = UUID()
        self.useDyslexiaFont = false
        self.useHighContrast = false
        self.textSizeMultiplier = 1.0
        self.reduceMotion = false
        self.textToSpeechEnabled = false
        self.voiceToTextEnabled = false
        self.speechRate = 1.0
        self.preferredLanguage = "en"
        self.colorBlindMode = .none
    }
}

enum ColorBlindMode: String, Codable, CaseIterable {
    case none = "Standard"
    case protanopia = "Protanopia"
    case deuteranopia = "Deuteranopia"
    case tritanopia = "Tritanopia"

    var description: String {
        switch self {
        case .none: return "Standard colors"
        case .protanopia: return "Red-blind friendly"
        case .deuteranopia: return "Green-blind friendly"
        case .tritanopia: return "Blue-blind friendly"
        }
    }
}

// MARK: - Collections
@Model
final class EntryCollection {
    var id: UUID
    var name: String
    var collectionDescription: String
    var theme: String
    var color: String // Hex color
    var entryIDs: [UUID]
    var createdDate: Date
    var isFavorite: Bool

    init(name: String, description: String = "", theme: String = "General", color: String = "#007AFF") {
        self.id = UUID()
        self.name = name
        self.collectionDescription = description
        self.theme = theme
        self.color = color
        self.entryIDs = []
        self.createdDate = Date()
        self.isFavorite = false
    }

    func addEntry(_ entryID: UUID) {
        if !entryIDs.contains(entryID) {
            entryIDs.append(entryID)
        }
    }

    func removeEntry(_ entryID: UUID) {
        entryIDs.removeAll { $0 == entryID }
    }

    var entryCount: Int {
        entryIDs.count
    }

    static var defaultCollections: [EntryCollection] {
        [
            EntryCollection(
                name: "Favorite Memories",
                description: "My most cherished grateful moments",
                theme: "Memories",
                color: "#FF6B6B"
            ),
            EntryCollection(
                name: "Growth & Learning",
                description: "Lessons and personal development",
                theme: "Growth",
                color: "#4ECDC4"
            ),
            EntryCollection(
                name: "Relationships",
                description: "Gratitude for the people in my life",
                theme: "People",
                color: "#FFE66D"
            ),
            EntryCollection(
                name: "Health & Wellness",
                description: "Physical and mental wellbeing",
                theme: "Health",
                color: "#95E1D3"
            )
        ]
    }
}
