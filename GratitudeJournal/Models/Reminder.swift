//
//  Reminder.swift
//  GratitudeJournal
//
//  Reminder notifications for gratitude journaling
//

import Foundation
import SwiftData

@Model
final class Reminder {
    var id: UUID
    var title: String
    var body: String
    var time: Date
    var isEnabled: Bool
    var repeatType: RepeatType
    var daysOfWeek: [Int] // 1-7 for Sun-Sat
    var createdAt: Date

    // Advanced reminder types
    var reminderType: ReminderType
    var locationName: String?
    var eventName: String?
    var personName: String?
    var activityName: String?
    var prompt: String?

    init(
        title: String,
        body: String,
        time: Date,
        repeatType: RepeatType = .daily,
        reminderType: ReminderType = .timeOfDay,
        isEnabled: Bool = true
    ) {
        self.id = UUID()
        self.title = title
        self.body = body
        self.time = time
        self.isEnabled = isEnabled
        self.repeatType = repeatType
        self.daysOfWeek = []
        self.createdAt = Date()
        self.reminderType = reminderType
    }
}

enum RepeatType: String, Codable, CaseIterable {
    case none = "None"
    case daily = "Daily"
    case weekly = "Weekly"
    case monthly = "Monthly"
    case custom = "Custom"
}

enum ReminderType: String, Codable, CaseIterable {
    case timeOfDay = "Time of Day"
    case morning = "Morning Routine"
    case evening = "Evening Reflection"
    case location = "Location-based"
    case event = "Event-based"
    case person = "Person-based"
    case activity = "Activity-based"
    case goal = "Goal-based"
    case weeklyReflection = "Weekly Reflection"
    case prompt = "Writing Prompt"
}
