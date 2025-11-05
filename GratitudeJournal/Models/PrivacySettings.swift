//
//  PrivacySettings.swift
//  GratitudeJournal
//
//  Privacy and security features
//

import Foundation
import SwiftData
import LocalAuthentication

@Model
final class PrivacySettings {
    var id: UUID
    var biometricEnabled: Bool
    var requirePasswordForPrivateEntries: Bool
    var autoDeleteAfterDays: Int? // nil = never delete
    var localOnlyMode: Bool // No cloud sync
    var enabledAnonymousBackup: Bool

    init() {
        self.id = UUID()
        self.biometricEnabled = false
        self.requirePasswordForPrivateEntries = false
        self.autoDeleteAfterDays = nil
        self.localOnlyMode = true
        self.enabledAnonymousBackup = false
    }

    // MARK: - Biometric Authentication

    func authenticateWithBiometrics(completion: @escaping (Bool, Error?) -> Void) {
        let context = LAContext()
        var error: NSError?

        if context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error) {
            let reason = "Unlock your gratitude journal"

            context.evaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, localizedReason: reason) { success, authError in
                DispatchQueue.main.async {
                    completion(success, authError)
                }
            }
        } else {
            completion(false, error)
        }
    }

    // MARK: - Password Protection

    private static let passwordKey = "journal_password"

    func setPassword(_ password: String) {
        // In production, use Keychain for secure storage
        UserDefaults.standard.set(password.hash, forKey: Self.passwordKey)
    }

    func verifyPassword(_ password: String) -> Bool {
        let stored = UserDefaults.standard.integer(forKey: Self.passwordKey)
        return password.hash == stored
    }

    func hasPassword() -> Bool {
        UserDefaults.standard.object(forKey: Self.passwordKey) != nil
    }
}

@Model
final class PrivateVault {
    var id: UUID
    var name: String
    var entryIDs: [UUID]
    var isLocked: Bool
    var requiresPassword: Bool

    init(name: String = "Private Vault") {
        self.id = UUID()
        self.name = name
        self.entryIDs = []
        self.isLocked = true
        self.requiresPassword = true
    }

    func addEntry(_ entryID: UUID) {
        if !entryIDs.contains(entryID) {
            entryIDs.append(entryID)
        }
    }

    func removeEntry(_ entryID: UUID) {
        entryIDs.removeAll { $0 == entryID }
    }

    func unlock() {
        isLocked = false
    }

    func lock() {
        isLocked = true
    }
}

@Model
final class WellnessTracking {
    var id: UUID
    var date: Date

    // Mood and Stress
    var stressLevel: Int // 1-10
    var anxietyLevel: Int // 1-10
    var depressionLevel: Int? // 1-10, optional

    // Sleep
    var sleepQuality: Int? // 1-10
    var sleepHours: Double?

    // Exercise
    var exerciseMinutes: Int?
    var exerciseType: String?

    // Notes
    var wellnessNotes: String?

    init(date: Date = Date(), stressLevel: Int = 5, anxietyLevel: Int = 5) {
        self.id = UUID()
        self.date = date
        self.stressLevel = stressLevel
        self.anxietyLevel = anxietyLevel
    }
}

@Model
final class DailyRoutine {
    var id: UUID
    var name: String
    var type: RoutineType
    var tasks: [RoutineTask]
    var scheduledTime: Date
    var isEnabled: Bool

    init(name: String, type: RoutineType, scheduledTime: Date) {
        self.id = UUID()
        self.name = name
        self.type = type
        self.tasks = []
        self.scheduledTime = scheduledTime
        self.isEnabled = true
    }
}

struct RoutineTask: Codable {
    var id: UUID
    var title: String
    var isCompleted: Bool
    var includesGratitude: Bool

    init(title: String, includesGratitude: Bool = false) {
        self.id = UUID()
        self.title = title
        self.isCompleted = false
        self.includesGratitude = includesGratitude
    }
}

enum RoutineType: String, Codable {
    case morning = "Morning Routine"
    case evening = "Evening Routine"
    case custom = "Custom Routine"
}

// CBT (Cognitive Behavioral Therapy) aligned prompts
struct CBTPrompt {
    let id = UUID()
    let prompt: String
    let category: CBTCategory
    let reframingQuestion: String

    enum CBTCategory: String {
        case cognition = "Cognitive Reframing"
        case gratitude = "Gratitude Focus"
        case growth = "Growth Mindset"
        case acceptance = "Acceptance"
    }

    static let prompts = [
        CBTPrompt(
            prompt: "What difficult situation can you find a silver lining in?",
            category: .cognition,
            reframingQuestion: "How has this challenge helped you grow?"
        ),
        CBTPrompt(
            prompt: "What strength did you use to overcome a recent obstacle?",
            category: .growth,
            reframingQuestion: "What did this reveal about your capabilities?"
        ),
        CBTPrompt(
            prompt: "What can you accept and be grateful for in this moment?",
            category: .acceptance,
            reframingQuestion: "How can acceptance bring you peace?"
        ),
        CBTPrompt(
            prompt: "What positive evidence contradicts a negative thought you had?",
            category: .cognition,
            reframingQuestion: "What's a more balanced way to view this?"
        )
    ]
}
