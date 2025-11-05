//
//  AIService.swift
//  GratitudeJournal
//
//  AI-powered features for gratitude journaling
//  Note: Currently uses rule-based logic. Can be replaced with actual ML models.
//

import Foundation
import SwiftData
import NaturalLanguage

class AIService {
    static let shared = AIService()

    private init() {}

    // MARK: - AI-Powered Prompt Suggestions

    /// Generate personalized prompts based on past entries
    func generatePersonalizedPrompts(from entries: [JournalEntry]) -> [String] {
        guard !entries.isEmpty else {
            return GratitudePrompt.allPrompts.map { $0.text }.shuffled().prefix(3).map { String($0) }
        }

        // Analyze past entries to suggest relevant prompts
        let recentEntries = entries.prefix(10)
        var suggestedPrompts: [String] = []

        // Check what hasn't been written about recently
        let recentCategories = Set(recentEntries.flatMap { $0.categories })
        let allCategories = ["Family", "Friends", "Health", "Career", "Nature", "Personal Growth"]
        let unusedCategories = allCategories.filter { !recentCategories.contains($0) }

        if unusedCategories.contains("Family") {
            suggestedPrompts.append("What family moment brought you joy recently?")
        }
        if unusedCategories.contains("Nature") {
            suggestedPrompts.append("What in nature filled you with wonder today?")
        }

        // Check for patterns in mood
        let recentMoods = recentEntries.map { $0.mood }
        if recentMoods.filter({ $0 == .reflective }).count > 3 {
            suggestedPrompts.append("What simple pleasure made you smile today?")
        }

        // Time-based suggestions
        let calendar = Calendar.current
        let hour = calendar.component(.hour, from: Date())
        if hour < 12 {
            suggestedPrompts.append("What are you looking forward to today?")
        } else {
            suggestedPrompts.append("What went better than expected today?")
        }

        return Array(suggestedPrompts.prefix(3))
    }

    // MARK: - Smart Duplicate Detection

    /// Detect if an entry might be a duplicate
    func detectDuplicate(content: String, in entries: [JournalEntry], date: Date) -> JournalEntry? {
        let calendar = Calendar.current

        // Check entries from the same day
        let sameDayEntries = entries.filter { calendar.isDate($0.date, inSameDayAs: date) }

        for entry in sameDayEntries {
            let similarity = calculateSimilarity(content, entry.content)
            if similarity > 0.8 {
                return entry
            }
        }

        return nil
    }

    // MARK: - Sentiment Analysis

    /// Analyze sentiment of entry content
    func analyzeSentiment(for content: String) -> Double {
        let tagger = NLTagger(tagSchemes: [.sentimentScore])
        tagger.string = content

        let (sentiment, _) = tagger.tag(at: content.startIndex, unit: .paragraph, scheme: .sentimentScore)

        if let sentimentValue = sentiment?.rawValue, let score = Double(sentimentValue) {
            // Convert from -1...1 to 0...1
            return (score + 1) / 2
        }

        // Fallback: count positive words
        let positiveWords = ["grateful", "thankful", "blessed", "happy", "joy", "love", "wonderful", "amazing", "beautiful", "peace"]
        let words = content.lowercased().components(separatedBy: .whitespacesAndNewlines)
        let positiveCount = words.filter { word in positiveWords.contains(where: { word.contains($0) }) }.count

        return min(0.5 + Double(positiveCount) * 0.1, 1.0)
    }

    // MARK: - Monthly Summary Generation

    /// Generate AI summary of monthly gratitude patterns
    func generateMonthlySummary(for entries: [JournalEntry]) -> String {
        guard !entries.isEmpty else {
            return "No entries this month to analyze."
        }

        let totalEntries = entries.count
        let totalWords = entries.reduce(0) { $0 + $1.wordCount }
        let avgWords = totalWords / max(totalEntries, 1)

        // Mood analysis
        let moodCounts = Dictionary(grouping: entries, by: { $0.mood }).mapValues { $0.count }
        let topMood = moodCounts.max(by: { $0.value < $1.value })?.key ?? .grateful

        // Category analysis
        let allCategories = entries.flatMap { $0.categories }
        let categoryCounts = Dictionary(grouping: allCategories, by: { $0 }).mapValues { $0.count }
        let topCategory = categoryCounts.max(by: { $0.value < $1.value })?.key ?? "Life"

        // People analysis
        let allPeople = entries.flatMap { $0.peopleMentioned }
        let uniquePeople = Set(allPeople).count

        // Generate summary
        var summary = """
        This month, you wrote \(totalEntries) gratitude entries with an average of \(avgWords) words each.

        Your most common mood was \(topMood.rawValue), and you wrote most about \(topCategory).
        """

        if uniquePeople > 0 {
            summary += "You mentioned \(uniquePeople) different people who bring you gratitude. "
        }

        let avgSentiment = entries.compactMap { $0.sentimentScore }.reduce(0, +) / Double(max(entries.count, 1))
        if avgSentiment > 0.7 {
            summary += "\n\nYour gratitude score is high this month (\(Int(avgSentiment * 100))%), showing strong positive emotions in your practice!"
        }

        return summary
    }

    // MARK: - Predictive Reminder Timing

    /// Predict best time to journal based on past patterns
    func predictBestJournalingTime(from entries: [JournalEntry]) -> Date? {
        guard entries.count >= 5 else { return nil }

        let calendar = Calendar.current
        let hours = entries.map { calendar.component(.hour, from: $0.date) }

        // Find most common hour
        let hourCounts = Dictionary(grouping: hours, by: { $0 }).mapValues { $0.count }
        guard let mostCommonHour = hourCounts.max(by: { $0.value < $1.value })?.key else {
            return nil
        }

        // Create date for today at that hour
        var components = calendar.dateComponents([.year, .month, .day], from: Date())
        components.hour = mostCommonHour
        components.minute = 0

        return calendar.date(from: components)
    }

    // MARK: - Auto-Suggest Tags

    /// Suggest tags based on entry content
    func suggestTags(for content: String, existingTags: [String]) -> [String] {
        var suggestions: [String] = []

        let lowercased = content.lowercased()

        // Common gratitude themes
        let tagMap: [String: [String]] = [
            "family": ["family", "children", "kids", "parents", "siblings", "relatives"],
            "friends": ["friend", "friendship", "buddy", "pal"],
            "health": ["health", "healthy", "exercise", "workout", "fitness", "wellbeing"],
            "nature": ["nature", "outdoors", "trees", "flowers", "sunset", "sunrise", "sky"],
            "food": ["food", "meal", "dinner", "lunch", "breakfast", "cooking"],
            "work": ["work", "job", "career", "project", "meeting", "colleague"],
            "learning": ["learn", "study", "book", "course", "knowledge", "skill"],
            "travel": ["travel", "trip", "vacation", "journey", "adventure"],
            "home": ["home", "house", "cozy", "comfort"],
            "achievement": ["achievement", "success", "accomplish", "win", "complete"]
        ]

        for (tag, keywords) in tagMap {
            if keywords.contains(where: { lowercased.contains($0) }) && !existingTags.contains(tag) {
                suggestions.append(tag)
            }
        }

        return Array(suggestions.prefix(3))
    }

    // MARK: - Smart Photo Matching

    /// Match photos to entry themes (placeholder)
    func matchPhotosToEntry(content: String, photoURLs: [String]) -> [String: Double] {
        // In real implementation, would use Vision framework to analyze photo content
        // and match to entry themes

        var matches: [String: Double] = [:]
        for url in photoURLs {
            // Placeholder: all photos get moderate relevance score
            matches[url] = 0.7
        }
        return matches
    }

    // MARK: - AI Gratitude Coach

    /// Generate personalized feedback as gratitude coach
    func generateCoachFeedback(for entries: [JournalEntry]) -> String {
        guard !entries.isEmpty else {
            return "Welcome! Start your gratitude journey by writing your first entry. Focus on what truly made you feel grateful today."
        }

        let recentEntries = entries.prefix(7)
        let streak = StreakManager.calculateStreak(from: entries)

        var feedback = ""

        // Streak-based feedback
        if streak >= 7 {
            feedback += "🔥 Amazing consistency! You've maintained a \(streak)-day streak. "
        } else if streak >= 3 {
            feedback += "💪 Great start! You're building momentum with a \(streak)-day streak. "
        }

        // Depth analysis
        let avgWords = recentEntries.reduce(0) { $0 + $1.wordCount } / max(recentEntries.count, 1)
        if avgWords < 20 {
            feedback += "Try writing a bit more detail in your entries. Diving deeper helps you appreciate your gratitude more fully. "
        } else if avgWords > 100 {
            feedback += "Your detailed entries show deep reflection. Beautiful work! "
        }

        // Variety analysis
        let uniqueMoods = Set(recentEntries.map { $0.mood }).count
        if uniqueMoods <= 2 {
            feedback += "Consider exploring different moods and perspectives in your gratitude practice. "
        }

        // Categories
        let categories = Set(recentEntries.flatMap { $0.categories })
        if categories.count == 1 {
            feedback += "You might discover new sources of gratitude by writing about different areas of your life. "
        }

        return feedback.isEmpty ? "Keep up the great work with your gratitude practice!" : feedback
    }

    // MARK: - Helper Methods

    private func calculateSimilarity(_ text1: String, _ text2: String) -> Double {
        let words1 = Set(text1.lowercased().components(separatedBy: .whitespacesAndNewlines))
        let words2 = Set(text2.lowercased().components(separatedBy: .whitespacesAndNewlines))

        let intersection = words1.intersection(words2)
        let union = words1.union(words2)

        guard !union.isEmpty else { return 0 }
        return Double(intersection.count) / Double(union.count)
    }
}
