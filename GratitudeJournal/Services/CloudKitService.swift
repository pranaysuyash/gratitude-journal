//
//  CloudKitService.swift
//  GratitudeJournal
//
//  CloudKit backend for sync and social features
//  © 2024 Gratitude Journal. All Rights Reserved.
//

import Foundation
import CloudKit

@MainActor
class CloudKitService: ObservableObject {
    static let shared = CloudKitService()

    private let container: CKContainer
    private let privateDatabase: CKDatabase
    private let publicDatabase: CKDatabase
    private let sharedDatabase: CKDatabase

    @Published var accountStatus: CKAccountStatus = .couldNotDetermine
    @Published var isAvailable = false
    @Published var isSyncing = false

    enum CloudKitError: LocalizedError {
        case notAvailable
        case unauthorized
        case uploadFailed
        case downloadFailed
        case sharingFailed

        var errorDescription: String? {
            switch self {
            case .notAvailable:
                return "iCloud is not available"
            case .unauthorized:
                return "iCloud access not authorized"
            case .uploadFailed:
                return "Failed to upload to iCloud"
            case .downloadFailed:
                return "Failed to download from iCloud"
            case .sharingFailed:
                return "Failed to share data"
            }
        }
    }

    private init() {
        self.container = CKContainer.default()
        self.privateDatabase = container.privateCloudDatabase
        self.publicDatabase = container.publicCloudDatabase
        self.sharedDatabase = container.sharedCloudDatabase

        Task {
            await checkAccountStatus()
        }
    }

    // MARK: - Account Status

    func checkAccountStatus() async {
        do {
            let status = try await container.accountStatus()
            self.accountStatus = status
            self.isAvailable = status == .available
        } catch {
            self.accountStatus = .couldNotDetermine
            self.isAvailable = false
        }
    }

    // MARK: - Journal Entry Sync

    func uploadEntry(_ entry: JournalEntry) async throws {
        guard isAvailable else {
            throw CloudKitError.notAvailable
        }

        let record = CKRecord(recordType: "JournalEntry")
        record["content"] = entry.content as CKRecordValue
        record["date"] = entry.date as CKRecordValue
        record["mood"] = entry.mood.rawValue as CKRecordValue
        record["tags"] = entry.tags as CKRecordValue

        if let sentimentScore = entry.sentimentScore {
            record["sentimentScore"] = sentimentScore as CKRecordValue
        }

        do {
            _ = try await privateDatabase.save(record)
        } catch {
            throw CloudKitError.uploadFailed
        }
    }

    func downloadEntries() async throws -> [JournalEntry] {
        guard isAvailable else {
            throw CloudKitError.notAvailable
        }

        let query = CKQuery(recordType: "JournalEntry", predicate: NSPredicate(value: true))
        query.sortDescriptors = [NSSortDescriptor(key: "date", ascending: false)]

        do {
            let (matchResults, _) = try await privateDatabase.records(matching: query)

            var entries: [JournalEntry] = []

            for (_, result) in matchResults {
                switch result {
                case .success(let record):
                    if let entry = journalEntryFromRecord(record) {
                        entries.append(entry)
                    }
                case .failure:
                    continue
                }
            }

            return entries
        } catch {
            throw CloudKitError.downloadFailed
        }
    }

    private func journalEntryFromRecord(_ record: CKRecord) -> JournalEntry? {
        guard let content = record["content"] as? String,
              let date = record["date"] as? Date,
              let moodRaw = record["mood"] as? String,
              let mood = MoodType(rawValue: moodRaw) else {
            return nil
        }

        let entry = JournalEntry(
            content: content,
            date: date,
            mood: mood,
            tags: (record["tags"] as? [String]) ?? []
        )

        entry.sentimentScore = record["sentimentScore"] as? Double

        return entry
    }

    // MARK: - Sharing

    func shareJournal(with userIds: [String]) async throws -> CKShare {
        guard isAvailable else {
            throw CloudKitError.notAvailable
        }

        // Create a shared zone
        let zoneID = CKRecordZone.ID(zoneName: "SharedJournal_\(UUID().uuidString)")
        let zone = CKRecordZone(zoneID: zoneID)

        do {
            _ = try await privateDatabase.save(zone)

            // Create share
            let share = CKShare(rootRecord: CKRecord(recordType: "SharedJournal"))
            share[CKShare.SystemFieldKey.title] = "Shared Gratitude Journal" as CKRecordValue
            share.publicPermission = .none

            // Add participants
            for userId in userIds {
                let participant = CKShare.Participant()
                participant.userIdentity = CKUserIdentity()
                participant.permission = .readWrite
                participant.role = .privateUser

                share.addParticipant(participant)
            }

            _ = try await privateDatabase.save(share)
            return share
        } catch {
            throw CloudKitError.sharingFailed
        }
    }

    func fetchSharedJournals() async throws -> [CKShare] {
        guard isAvailable else {
            throw CloudKitError.notAvailable
        }

        let query = CKQuery(recordType: CKRecordType.share, predicate: NSPredicate(value: true))

        do {
            let (matchResults, _) = try await sharedDatabase.records(matching: query)

            var shares: [CKShare] = []

            for (_, result) in matchResults {
                switch result {
                case .success(let record):
                    if let share = record as? CKShare {
                        shares.append(share)
                    }
                case .failure:
                    continue
                }
            }

            return shares
        } catch {
            throw CloudKitError.downloadFailed
        }
    }

    // MARK: - Family Features

    func createFamilyJournal(familyName: String) async throws -> String {
        guard isAvailable else {
            throw CloudKitError.notAvailable
        }

        let record = CKRecord(recordType: "FamilyJournal")
        record["name"] = familyName as CKRecordValue
        record["createdDate"] = Date() as CKRecordValue
        record["creatorID"] = UUID().uuidString as CKRecordValue

        do {
            let savedRecord = try await privateDatabase.save(record)
            return savedRecord.recordID.recordName
        } catch {
            throw CloudKitError.uploadFailed
        }
    }

    func uploadFamilyEntry(journalId: String, entry: JournalEntry, authorName: String) async throws {
        guard isAvailable else {
            throw CloudKitError.notAvailable
        }

        let record = CKRecord(recordType: "FamilyEntry")
        record["journalID"] = journalId as CKRecordValue
        record["content"] = entry.content as CKRecordValue
        record["date"] = entry.date as CKRecordValue
        record["authorName"] = authorName as CKRecordValue
        record["mood"] = entry.mood.rawValue as CKRecordValue

        do {
            _ = try await sharedDatabase.save(record)
        } catch {
            throw CloudKitError.uploadFailed
        }
    }

    func fetchFamilyEntries(journalId: String) async throws -> [(entry: JournalEntry, author: String)] {
        guard isAvailable else {
            throw CloudKitError.notAvailable
        }

        let predicate = NSPredicate(format: "journalID == %@", journalId)
        let query = CKQuery(recordType: "FamilyEntry", predicate: predicate)
        query.sortDescriptors = [NSSortDescriptor(key: "date", ascending: false)]

        do {
            let (matchResults, _) = try await sharedDatabase.records(matching: query)

            var familyEntries: [(JournalEntry, String)] = []

            for (_, result) in matchResults {
                switch result {
                case .success(let record):
                    if let entry = journalEntryFromRecord(record),
                       let author = record["authorName"] as? String {
                        familyEntries.append((entry, author))
                    }
                case .failure:
                    continue
                }
            }

            return familyEntries
        } catch {
            throw CloudKitError.downloadFailed
        }
    }

    // MARK: - Group Challenges

    func createGroupChallenge(title: String, duration: Int, participantIds: [String]) async throws -> String {
        guard isAvailable else {
            throw CloudKitError.notAvailable
        }

        let record = CKRecord(recordType: "GroupChallenge")
        record["title"] = title as CKRecordValue
        record["duration"] = duration as CKRecordValue
        record["startDate"] = Date() as CKRecordValue
        record["participantIDs"] = participantIds as CKRecordValue
        record["creatorID"] = UUID().uuidString as CKRecordValue

        do {
            let savedRecord = try await publicDatabase.save(record)
            return savedRecord.recordID.recordName
        } catch {
            throw CloudKitError.uploadFailed
        }
    }

    func fetchGroupChallenges() async throws -> [CKRecord] {
        guard isAvailable else {
            throw CloudKitError.notAvailable
        }

        let query = CKQuery(recordType: "GroupChallenge", predicate: NSPredicate(value: true))
        query.sortDescriptors = [NSSortDescriptor(key: "startDate", ascending: false)]

        do {
            let (matchResults, _) = try await publicDatabase.records(matching: query)

            var challenges: [CKRecord] = []

            for (_, result) in matchResults {
                switch result {
                case .success(let record):
                    challenges.append(record)
                case .failure:
                    continue
                }
            }

            return challenges
        } catch {
            throw CloudKitError.downloadFailed
        }
    }

    func updateChallengeProgress(challengeId: String, progress: Int) async throws {
        guard isAvailable else {
            throw CloudKitError.notAvailable
        }

        let recordID = CKRecord.ID(recordName: challengeId)

        do {
            let record = try await publicDatabase.record(for: recordID)
            record["progress"] = progress as CKRecordValue
            record["lastUpdated"] = Date() as CKRecordValue

            _ = try await publicDatabase.save(record)
        } catch {
            throw CloudKitError.uploadFailed
        }
    }

    // MARK: - Community Features

    func uploadPublicGratitude(content: String, isAnonymous: Bool) async throws {
        guard isAvailable else {
            throw CloudKitError.notAvailable
        }

        let record = CKRecord(recordType: "PublicGratitude")
        record["content"] = content as CKRecordValue
        record["date"] = Date() as CKRecordValue
        record["isAnonymous"] = isAnonymous ? 1 : 0 as CKRecordValue

        if !isAnonymous {
            record["userID"] = UUID().uuidString as CKRecordValue
        }

        do {
            _ = try await publicDatabase.save(record)
        } catch {
            throw CloudKitError.uploadFailed
        }
    }

    func fetchCommunityGratitudes(limit: Int = 50) async throws -> [String] {
        guard isAvailable else {
            throw CloudKitError.notAvailable
        }

        let query = CKQuery(recordType: "PublicGratitude", predicate: NSPredicate(value: true))
        query.sortDescriptors = [NSSortDescriptor(key: "date", ascending: false)]

        do {
            let (matchResults, _) = try await publicDatabase.records(matching: query)

            var gratitudes: [String] = []

            for (_, result) in matchResults {
                switch result {
                case .success(let record):
                    if let content = record["content"] as? String {
                        gratitudes.append(content)
                    }
                case .failure:
                    continue
                }
            }

            return Array(gratitudes.prefix(limit))
        } catch {
            throw CloudKitError.downloadFailed
        }
    }

    // MARK: - Sync Status

    func startAutoSync(interval: TimeInterval = 300) {
        Timer.scheduledTimer(withTimeInterval: interval, repeats: true) { [weak self] _ in
            Task {
                await self?.syncAllData()
            }
        }
    }

    func syncAllData() async {
        guard isAvailable, !isSyncing else { return }

        isSyncing = true

        // Sync logic would go here
        // Upload local changes, download remote changes, merge conflicts

        isSyncing = false
    }
}
