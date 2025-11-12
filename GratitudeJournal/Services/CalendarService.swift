//
//  CalendarService.swift
//  GratitudeJournal
//
//  Calendar integration using EventKit
//  © 2024 Gratitude Journal. All Rights Reserved.
//

import Foundation
import EventKit

@MainActor
class CalendarService: ObservableObject {
    static let shared = CalendarService()

    private let eventStore = EKEventStore()
    @Published var authorizationStatus: EKAuthorizationStatus = .notDetermined
    @Published var events: [EKEvent] = []
    @Published var isAuthorized = false

    enum CalendarError: LocalizedError {
        case unauthorized
        case eventCreationFailed
        case eventFetchFailed

        var errorDescription: String? {
            switch self {
            case .unauthorized:
                return "Calendar access not authorized"
            case .eventCreationFailed:
                return "Failed to create calendar event"
            case .eventFetchFailed:
                return "Failed to fetch calendar events"
            }
        }
    }

    private init() {
        checkAuthorizationStatus()
    }

    // MARK: - Authorization

    func checkAuthorizationStatus() {
        if #available(iOS 17.0, *) {
            authorizationStatus = EKEventStore.authorizationStatus(for: .event)
        } else {
            authorizationStatus = EKEventStore.authorizationStatus(for: .event)
        }
        isAuthorized = authorizationStatus == .fullAccess || authorizationStatus == .authorized
    }

    func requestAuthorization() async throws -> Bool {
        if #available(iOS 17.0, *) {
            let granted = try await eventStore.requestFullAccessToEvents()
            checkAuthorizationStatus()
            return granted
        } else {
            return try await withCheckedThrowingContinuation { continuation in
                eventStore.requestAccess(to: .event) { granted, error in
                    if let error = error {
                        continuation.resume(throwing: error)
                    } else {
                        Task { @MainActor in
                            self.checkAuthorizationStatus()
                        }
                        continuation.resume(returning: granted)
                    }
                }
            }
        }
    }

    // MARK: - Fetch Events

    func fetchEvents(from startDate: Date, to endDate: Date) async throws -> [EKEvent] {
        guard isAuthorized else {
            throw CalendarError.unauthorized
        }

        let predicate = eventStore.predicateForEvents(withStart: startDate, end: endDate, calendars: nil)
        let fetchedEvents = eventStore.events(matching: predicate)
        self.events = fetchedEvents
        return fetchedEvents
    }

    func fetchTodaysEvents() async throws -> [EKEvent] {
        let startOfDay = Calendar.current.startOfDay(for: Date())
        let endOfDay = Calendar.current.date(byAdding: .day, value: 1, to: startOfDay) ?? Date()
        return try await fetchEvents(from: startOfDay, to: endOfDay)
    }

    func fetchEventsForWeek() async throws -> [EKEvent] {
        let startDate = Date()
        let endDate = Calendar.current.date(byAdding: .day, value: 7, to: startDate) ?? Date()
        return try await fetchEvents(from: startDate, to: endDate)
    }

    // MARK: - Create Events

    func createGratitudeReminderEvent(title: String, date: Date, duration: TimeInterval = 900) async throws -> String {
        guard isAuthorized else {
            throw CalendarError.unauthorized
        }

        let event = EKEvent(eventStore: eventStore)
        event.title = title
        event.startDate = date
        event.endDate = date.addingTimeInterval(duration)
        event.calendar = eventStore.defaultCalendarForNewEvents
        event.notes = "Gratitude Journal Entry Reminder"
        event.alarms = [EKAlarm(relativeOffset: -300)] // 5 minutes before

        do {
            try eventStore.save(event, span: .thisEvent)
            return event.eventIdentifier
        } catch {
            throw CalendarError.eventCreationFailed
        }
    }

    func createWeeklyReflectionEvent(weekday: Int, hour: Int) async throws {
        guard isAuthorized else {
            throw CalendarError.unauthorized
        }

        let calendar = Calendar.current
        var components = DateComponents()
        components.weekday = weekday
        components.hour = hour
        components.minute = 0

        guard let firstOccurrence = calendar.nextDate(after: Date(), matching: components, matchingPolicy: .nextTime) else {
            throw CalendarError.eventCreationFailed
        }

        let event = EKEvent(eventStore: eventStore)
        event.title = "Weekly Gratitude Reflection"
        event.startDate = firstOccurrence
        event.endDate = firstOccurrence.addingTimeInterval(1800) // 30 minutes
        event.calendar = eventStore.defaultCalendarForNewEvents
        event.notes = "Time to reflect on your week's gratitude entries"

        // Create recurring rule
        let recurrenceRule = EKRecurrenceRule(
            recurrenceWith: .weekly,
            interval: 1,
            end: nil
        )
        event.recurrenceRules = [recurrenceRule]

        do {
            try eventStore.save(event, span: .futureEvents)
        } catch {
            throw CalendarError.eventCreationFailed
        }
    }

    // MARK: - Link Entries to Events

    func findEventsForEntry(date: Date) async throws -> [EKEvent] {
        let startOfDay = Calendar.current.startOfDay(for: date)
        let endOfDay = Calendar.current.date(byAdding: .day, value: 1, to: startOfDay) ?? date
        return try await fetchEvents(from: startOfDay, to: endOfDay)
    }

    func generateEventBasedPrompts(events: [EKEvent]) -> [String] {
        var prompts: [String] = []

        for event in events {
            let title = event.title ?? "Event"
            prompts.append("What are you grateful for about: \(title)?")

            if event.hasAttendees {
                prompts.append("Who from \(title) are you grateful to have in your life?")
            }

            if let location = event.location, !location.isEmpty {
                prompts.append("What about \(location) brings you gratitude?")
            }
        }

        return prompts
    }

    // MARK: - Calendar Analytics

    func analyzeEventGratitudeCorrelation(entries: [JournalEntry]) async throws -> [(eventType: String, gratitudeCount: Int)] {
        let startDate = Calendar.current.date(byAdding: .month, value: -6, to: Date()) ?? Date()
        let endDate = Date()
        let events = try await fetchEvents(from: startDate, to: endDate)

        var eventTypes: [String: Int] = [:]

        for entry in entries {
            let dayEvents = events.filter { event in
                Calendar.current.isDate(event.startDate, inSameDayAs: entry.date)
            }

            for event in dayEvents {
                let title = event.title ?? "Unknown"
                eventTypes[title, default: 0] += 1
            }
        }

        return eventTypes.map { (eventType: $0.key, gratitudeCount: $0.value) }
            .sorted { $0.gratitudeCount > $1.gratitudeCount }
    }

    // MARK: - Milestone Events

    func createMilestoneEvent(title: String, milestone: Int, date: Date) async throws {
        guard isAuthorized else {
            throw CalendarError.unauthorized
        }

        let event = EKEvent(eventStore: eventStore)
        event.title = "🎉 \(title) - \(milestone) Entries!"
        event.startDate = date
        event.endDate = date.addingTimeInterval(0) // All-day event
        event.calendar = eventStore.defaultCalendarForNewEvents
        event.isAllDay = true
        event.notes = "Congratulations on reaching \(milestone) gratitude journal entries!"

        do {
            try eventStore.save(event, span: .thisEvent)
        } catch {
            throw CalendarError.eventCreationFailed
        }
    }

    // MARK: - Export to Calendar

    func exportEntryToCalendar(entry: JournalEntry) async throws -> String {
        guard isAuthorized else {
            throw CalendarError.unauthorized
        }

        let event = EKEvent(eventStore: eventStore)
        event.title = "Gratitude: \(entry.content.prefix(50))"
        event.startDate = entry.date
        event.endDate = entry.date.addingTimeInterval(0)
        event.calendar = eventStore.defaultCalendarForNewEvents
        event.isAllDay = true
        event.notes = entry.content

        do {
            try eventStore.save(event, span: .thisEvent)
            return event.eventIdentifier
        } catch {
            throw CalendarError.eventCreationFailed
        }
    }

    func exportMonthToCalendar(entries: [JournalEntry], month: Date) async throws {
        for entry in entries {
            _ = try await exportEntryToCalendar(entry: entry)
        }
    }
}
