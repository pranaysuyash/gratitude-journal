//
//  StreakManager.swift
//  GratitudeJournal
//
//  Manages gratitude writing streaks and milestones
//

import Foundation
import SwiftData

class StreakManager {
    static func calculateStreak(from entries: [JournalEntry]) -> Int {
        guard !entries.isEmpty else { return 0 }

        let sortedEntries = entries.sorted { $0.date > $1.date }
        let calendar = Calendar.current

        var streak = 0
        var currentDate = calendar.startOfDay(for: Date())

        for entry in sortedEntries {
            let entryDate = calendar.startOfDay(for: entry.date)

            if entryDate == currentDate {
                streak += 1
                currentDate = calendar.date(byAdding: .day, value: -1, to: currentDate) ?? currentDate
            } else if entryDate < currentDate {
                // Gap found, break the streak
                break
            }
        }

        return streak
    }

    static func longestStreak(from entries: [JournalEntry]) -> Int {
        guard !entries.isEmpty else { return 0 }

        let sortedEntries = entries.sorted { $0.date < $1.date }
        let calendar = Calendar.current

        var maxStreak = 0
        var currentStreak = 1
        var previousDate = calendar.startOfDay(for: sortedEntries[0].date)

        for i in 1..<sortedEntries.count {
            let currentDate = calendar.startOfDay(for: sortedEntries[i].date)
            let dayDifference = calendar.dateComponents([.day], from: previousDate, to: currentDate).day ?? 0

            if dayDifference == 1 {
                currentStreak += 1
            } else if dayDifference > 1 {
                maxStreak = max(maxStreak, currentStreak)
                currentStreak = 1
            }

            previousDate = currentDate
        }

        return max(maxStreak, currentStreak)
    }

    static func entriesThisWeek(from entries: [JournalEntry]) -> Int {
        let calendar = Calendar.current
        let now = Date()
        guard let weekAgo = calendar.date(byAdding: .day, value: -7, to: now) else { return 0 }

        return entries.filter { $0.date >= weekAgo }.count
    }

    static func entriesThisMonth(from entries: [JournalEntry]) -> Int {
        let calendar = Calendar.current
        let now = Date()
        let currentMonth = calendar.component(.month, from: now)
        let currentYear = calendar.component(.year, from: now)

        return entries.filter { entry in
            let entryMonth = calendar.component(.month, from: entry.date)
            let entryYear = calendar.component(.year, from: entry.date)
            return entryMonth == currentMonth && entryYear == currentYear
        }.count
    }

    static func averageWordsPerEntry(from entries: [JournalEntry]) -> Int {
        guard !entries.isEmpty else { return 0 }
        let totalWords = entries.reduce(0) { $0 + $1.wordCount }
        return totalWords / entries.count
    }

    static func totalWritingTime(from entries: [JournalEntry]) -> TimeInterval {
        entries.reduce(0) { $0 + $1.writingDuration }
    }

    static func mostUsedMood(from entries: [JournalEntry]) -> MoodType? {
        let moodCounts = Dictionary(grouping: entries, by: { $0.mood })
            .mapValues { $0.count }

        return moodCounts.max(by: { $0.value < $1.value })?.key
    }

    static func topTags(from entries: [JournalEntry], limit: Int = 10) -> [(String, Int)] {
        let allTags = entries.flatMap { $0.tags }
        let tagCounts = Dictionary(grouping: allTags, by: { $0 })
            .mapValues { $0.count }

        return tagCounts.sorted { $0.value > $1.value }
            .prefix(limit)
            .map { ($0.key, $0.value) }
    }

    static func entriesByMood(from entries: [JournalEntry]) -> [MoodType: Int] {
        Dictionary(grouping: entries, by: { $0.mood })
            .mapValues { $0.count }
    }

    static func gratitudeScore(from entries: [JournalEntry]) -> Double {
        guard !entries.isEmpty else { return 0 }

        let recentEntries = entries.sorted { $0.date > $1.date }.prefix(30)
        let totalScore = recentEntries.reduce(0.0) { $0 + ($1.sentimentScore ?? 0.5) }

        return totalScore / Double(recentEntries.count)
    }
}
