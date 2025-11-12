//
//  HealthService.swift
//  GratitudeJournal
//
//  HealthKit integration for wellness tracking
//  © 2024 Gratitude Journal. All Rights Reserved.
//

import Foundation
import HealthKit

@MainActor
class HealthService: ObservableObject {
    static let shared = HealthService()

    private let healthStore = HKHealthStore()
    @Published var isAuthorized = false
    @Published var sleepData: [HKCategorySample] = []
    @Published var mindfulnessData: [HKCategorySample] = []
    @Published var stepsData: [HKQuantitySample] = []

    enum HealthError: LocalizedError {
        case notAvailable
        case unauthorized
        case dataFetchFailed

        var errorDescription: String? {
            switch self {
            case .notAvailable:
                return "HealthKit is not available on this device"
            case .unauthorized:
                return "HealthKit access not authorized"
            case .dataFetchFailed:
                return "Failed to fetch health data"
            }
        }
    }

    private init() {}

    // MARK: - Authorization

    func checkAvailability() -> Bool {
        return HKHealthStore.isHealthDataAvailable()
    }

    func requestAuthorization() async throws {
        guard checkAvailability() else {
            throw HealthError.notAvailable
        }

        let typesToRead: Set<HKObjectType> = [
            HKObjectType.categoryType(forIdentifier: .sleepAnalysis)!,
            HKObjectType.categoryType(forIdentifier: .mindfulSession)!,
            HKObjectType.quantityType(forIdentifier: .stepCount)!,
            HKObjectType.quantityType(forIdentifier: .activeEnergyBurned)!,
            HKObjectType.quantityType(forIdentifier: .heartRate)!,
            HKObjectType.quantityType(forIdentifier: .restingHeartRate)!,
            HKObjectType.quantityType(forIdentifier: .heartRateVariabilitySDNN)!
        ]

        let typesToWrite: Set<HKSampleType> = [
            HKObjectType.categoryType(forIdentifier: .mindfulSession)!
        ]

        do {
            try await healthStore.requestAuthorization(toShare: typesToWrite, read: typesToRead)
            self.isAuthorized = true
        } catch {
            throw HealthError.unauthorized
        }
    }

    // MARK: - Sleep Data

    func fetchSleepData(from startDate: Date, to endDate: Date) async throws -> [HKCategorySample] {
        guard isAuthorized else {
            throw HealthError.unauthorized
        }

        guard let sleepType = HKObjectType.categoryType(forIdentifier: .sleepAnalysis) else {
            throw HealthError.dataFetchFailed
        }

        let predicate = HKQuery.predicateForSamples(withStart: startDate, end: endDate, options: .strictStartDate)

        return try await withCheckedThrowingContinuation { continuation in
            let query = HKSampleQuery(sampleType: sleepType, predicate: predicate, limit: HKObjectQueryNoLimit, sortDescriptors: nil) { _, samples, error in
                if let error = error {
                    continuation.resume(throwing: error)
                    return
                }

                let sleepSamples = samples as? [HKCategorySample] ?? []
                Task { @MainActor in
                    self.sleepData = sleepSamples
                }
                continuation.resume(returning: sleepSamples)
            }

            healthStore.execute(query)
        }
    }

    func analyzeSleepQuality(samples: [HKCategorySample]) -> (hours: Double, quality: String) {
        let totalSleep = samples.reduce(0.0) { total, sample in
            if sample.value == HKCategoryValueSleepAnalysis.asleepCore.rawValue ||
               sample.value == HKCategoryValueSleepAnalysis.asleepDeep.rawValue ||
               sample.value == HKCategoryValueSleepAnalysis.asleepREM.rawValue {
                return total + sample.endDate.timeIntervalSince(sample.startDate) / 3600
            }
            return total
        }

        let quality: String
        switch totalSleep {
        case 0..<5:
            quality = "Poor"
        case 5..<6:
            quality = "Fair"
        case 6..<8:
            quality = "Good"
        case 8..<9:
            quality = "Excellent"
        default:
            quality = "Excessive"
        }

        return (hours: totalSleep, quality: quality)
    }

    // MARK: - Mindfulness Data

    func fetchMindfulnessMinutes(from startDate: Date, to endDate: Date) async throws -> Double {
        guard isAuthorized else {
            throw HealthError.unauthorized
        }

        guard let mindfulType = HKObjectType.categoryType(forIdentifier: .mindfulSession) else {
            throw HealthError.dataFetchFailed
        }

        let predicate = HKQuery.predicateForSamples(withStart: startDate, end: endDate, options: .strictStartDate)

        return try await withCheckedThrowingContinuation { continuation in
            let query = HKSampleQuery(sampleType: mindfulType, predicate: predicate, limit: HKObjectQueryNoLimit, sortDescriptors: nil) { _, samples, error in
                if let error = error {
                    continuation.resume(throwing: error)
                    return
                }

                let mindfulSamples = samples as? [HKCategorySample] ?? []
                Task { @MainActor in
                    self.mindfulnessData = mindfulSamples
                }

                let totalMinutes = mindfulSamples.reduce(0.0) { total, sample in
                    total + sample.endDate.timeIntervalSince(sample.startDate) / 60
                }

                continuation.resume(returning: totalMinutes)
            }

            healthStore.execute(query)
        }
    }

    func saveMindfulSession(duration: TimeInterval, startDate: Date = Date()) async throws {
        guard isAuthorized else {
            throw HealthError.unauthorized
        }

        guard let mindfulType = HKObjectType.categoryType(forIdentifier: .mindfulSession) else {
            throw HealthError.dataFetchFailed
        }

        let endDate = startDate.addingTimeInterval(duration)
        let sample = HKCategorySample(type: mindfulType, value: HKCategoryValue.notApplicable.rawValue, start: startDate, end: endDate)

        try await healthStore.save(sample)
    }

    // MARK: - Activity Data

    func fetchStepCount(for date: Date) async throws -> Double {
        guard isAuthorized else {
            throw HealthError.unauthorized
        }

        guard let stepsType = HKQuantityType.quantityType(forIdentifier: .stepCount) else {
            throw HealthError.dataFetchFailed
        }

        let startOfDay = Calendar.current.startOfDay(for: date)
        let endOfDay = Calendar.current.date(byAdding: .day, value: 1, to: startOfDay) ?? date
        let predicate = HKQuery.predicateForSamples(withStart: startOfDay, end: endOfDay, options: .strictStartDate)

        return try await withCheckedThrowingContinuation { continuation in
            let query = HKStatisticsQuery(quantityType: stepsType, quantitySamplePredicate: predicate, options: .cumulativeSum) { _, result, error in
                if let error = error {
                    continuation.resume(throwing: error)
                    return
                }

                let steps = result?.sumQuantity()?.doubleValue(for: HKUnit.count()) ?? 0
                continuation.resume(returning: steps)
            }

            healthStore.execute(query)
        }
    }

    func fetchActiveEnergyBurned(for date: Date) async throws -> Double {
        guard isAuthorized else {
            throw HealthError.unauthorized
        }

        guard let energyType = HKQuantityType.quantityType(forIdentifier: .activeEnergyBurned) else {
            throw HealthError.dataFetchFailed
        }

        let startOfDay = Calendar.current.startOfDay(for: date)
        let endOfDay = Calendar.current.date(byAdding: .day, value: 1, to: startOfDay) ?? date
        let predicate = HKQuery.predicateForSamples(withStart: startOfDay, end: endOfDay, options: .strictStartDate)

        return try await withCheckedThrowingContinuation { continuation in
            let query = HKStatisticsQuery(quantityType: energyType, quantitySamplePredicate: predicate, options: .cumulativeSum) { _, result, error in
                if let error = error {
                    continuation.resume(throwing: error)
                    return
                }

                let calories = result?.sumQuantity()?.doubleValue(for: HKUnit.kilocalorie()) ?? 0
                continuation.resume(returning: calories)
            }

            healthStore.execute(query)
        }
    }

    // MARK: - Heart Rate Data

    func fetchHeartRateVariability(for date: Date) async throws -> Double? {
        guard isAuthorized else {
            throw HealthError.unauthorized
        }

        guard let hrvType = HKQuantityType.quantityType(forIdentifier: .heartRateVariabilitySDNN) else {
            throw HealthError.dataFetchFailed
        }

        let startOfDay = Calendar.current.startOfDay(for: date)
        let endOfDay = Calendar.current.date(byAdding: .day, value: 1, to: startOfDay) ?? date
        let predicate = HKQuery.predicateForSamples(withStart: startOfDay, end: endOfDay, options: .strictStartDate)

        return try await withCheckedThrowingContinuation { continuation in
            let query = HKStatisticsQuery(quantityType: hrvType, quantitySamplePredicate: predicate, options: .discreteAverage) { _, result, error in
                if let error = error {
                    continuation.resume(throwing: error)
                    return
                }

                let hrv = result?.averageQuantity()?.doubleValue(for: HKUnit.secondUnit(with: .milli))
                continuation.resume(returning: hrv)
            }

            healthStore.execute(query)
        }
    }

    // MARK: - Correlation Analysis

    func correlateSleepWithGratitude(entries: [JournalEntry]) async throws -> [(date: Date, sleepHours: Double, gratitudeScore: Double)] {
        var correlations: [(Date, Double, Double)] = []

        for entry in entries {
            let startDate = Calendar.current.startOfDay(for: entry.date)
            let endDate = Calendar.current.date(byAdding: .day, value: 1, to: startDate) ?? entry.date

            do {
                let sleepSamples = try await fetchSleepData(from: startDate, to: endDate)
                let (hours, _) = analyzeSleepQuality(samples: sleepSamples)
                let gratitudeScore = entry.sentimentScore ?? 0.5

                correlations.append((entry.date, hours, gratitudeScore))
            } catch {
                // Skip entries with no sleep data
                continue
            }
        }

        return correlations
    }

    func correlateActivityWithGratitude(entries: [JournalEntry]) async throws -> [(date: Date, steps: Double, gratitudeScore: Double)] {
        var correlations: [(Date, Double, Double)] = []

        for entry in entries {
            do {
                let steps = try await fetchStepCount(for: entry.date)
                let gratitudeScore = entry.sentimentScore ?? 0.5

                correlations.append((entry.date, steps, gratitudeScore))
            } catch {
                continue
            }
        }

        return correlations
    }

    // MARK: - Health-Based Prompts

    func generateHealthPrompts(sleepHours: Double, steps: Double, mindfulMinutes: Double) -> [String] {
        var prompts: [String] = []

        if sleepHours >= 7 {
            prompts.append("You slept well! What energy and clarity are you grateful for today?")
        } else if sleepHours > 0 {
            prompts.append("Rest is essential. What opportunities for rest are you grateful for?")
        }

        if steps >= 10000 {
            prompts.append("Great activity today! What physical abilities are you grateful for?")
        } else if steps >= 5000 {
            prompts.append("You're moving! What movement brought you joy today?")
        }

        if mindfulMinutes >= 10 {
            prompts.append("You took time for mindfulness. What peace did you find?")
        }

        return prompts
    }
}
