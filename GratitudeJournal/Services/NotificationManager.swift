//
//  NotificationManager.swift
//  GratitudeJournal
//
//  Manages local notifications and reminders
//

import Foundation
import UserNotifications
import SwiftUI

class NotificationManager: NSObject, ObservableObject {
    @Published var isAuthorized = false

    static let shared = NotificationManager()

    override init() {
        super.init()
        checkAuthorization()
    }

    func requestAuthorization() {
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .badge, .sound]) { granted, _ in
            DispatchQueue.main.async {
                self.isAuthorized = granted
            }
        }
    }

    func checkAuthorization() {
        UNUserNotificationCenter.current().getNotificationSettings { settings in
            DispatchQueue.main.async {
                self.isAuthorized = settings.authorizationStatus == .authorized
            }
        }
    }

    func scheduleReminder(_ reminder: Reminder) {
        guard isAuthorized else {
            requestAuthorization()
            return
        }

        let content = UNMutableNotificationContent()
        content.title = reminder.title
        content.body = reminder.body
        content.sound = .default
        content.categoryIdentifier = "GRATITUDE_REMINDER"

        var trigger: UNNotificationTrigger?

        switch reminder.repeatType {
        case .daily:
            let components = Calendar.current.dateComponents([.hour, .minute], from: reminder.time)
            trigger = UNCalendarNotificationTrigger(dateMatching: components, repeats: true)

        case .weekly:
            var components = Calendar.current.dateComponents([.hour, .minute, .weekday], from: reminder.time)
            if !reminder.daysOfWeek.isEmpty {
                components.weekday = reminder.daysOfWeek.first
            }
            trigger = UNCalendarNotificationTrigger(dateMatching: components, repeats: true)

        case .monthly:
            let components = Calendar.current.dateComponents([.day, .hour, .minute], from: reminder.time)
            trigger = UNCalendarNotificationTrigger(dateMatching: components, repeats: true)

        case .none:
            let components = Calendar.current.dateComponents([.year, .month, .day, .hour, .minute], from: reminder.time)
            trigger = UNCalendarNotificationTrigger(dateMatching: components, repeats: false)

        case .custom:
            let components = Calendar.current.dateComponents([.hour, .minute], from: reminder.time)
            trigger = UNCalendarNotificationTrigger(dateMatching: components, repeats: true)
        }

        if let trigger = trigger {
            let request = UNNotificationRequest(
                identifier: reminder.id.uuidString,
                content: content,
                trigger: trigger
            )

            UNUserNotificationCenter.current().add(request) { error in
                if let error = error {
                    print("Error scheduling notification: \(error.localizedDescription)")
                }
            }
        }
    }

    func cancelReminder(_ reminder: Reminder) {
        UNUserNotificationCenter.current().removePendingNotificationRequests(withIdentifiers: [reminder.id.uuidString])
    }

    func scheduleStreakReminder() {
        let content = UNMutableNotificationContent()
        content.title = "Keep Your Streak Going!"
        content.body = "Don't forget to write today's gratitude entry 🌟"
        content.sound = .default

        var components = DateComponents()
        components.hour = 20 // 8 PM
        components.minute = 0

        let trigger = UNCalendarNotificationTrigger(dateMatching: components, repeats: true)
        let request = UNNotificationRequest(identifier: "streak-reminder", content: content, trigger: trigger)

        UNUserNotificationCenter.current().add(request)
    }
}
