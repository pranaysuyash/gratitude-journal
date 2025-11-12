//
//  MusicService.swift
//  GratitudeJournal
//
//  Music integration using MusicKit
//  © 2024 Gratitude Journal. All Rights Reserved.
//

import Foundation
import MusicKit

@MainActor
class MusicService: ObservableObject {
    static let shared = MusicService()

    @Published var authorizationStatus: MusicAuthorization.Status = .notDetermined
    @Published var isAuthorized = false
    @Published var currentSong: Song?
    @Published var recentlyPlayed: [Song] = []

    enum MusicError: LocalizedError {
        case unauthorized
        case searchFailed
        case playbackFailed

        var errorDescription: String? {
            switch self {
            case .unauthorized:
                return "Apple Music access not authorized"
            case .searchFailed:
                return "Failed to search for music"
            case .playbackFailed:
                return "Failed to play music"
            }
        }
    }

    private init() {
        checkAuthorizationStatus()
    }

    // MARK: - Authorization

    func checkAuthorizationStatus() {
        authorizationStatus = MusicAuthorization.currentStatus
        isAuthorized = authorizationStatus == .authorized
    }

    func requestAuthorization() async throws -> Bool {
        let status = await MusicAuthorization.request()
        checkAuthorizationStatus()
        return status == .authorized
    }

    // MARK: - Search Music

    func searchSongs(query: String, limit: Int = 10) async throws -> [Song] {
        guard isAuthorized else {
            throw MusicError.unauthorized
        }

        do {
            var request = MusicCatalogSearchRequest(term: query, types: [Song.self])
            request.limit = limit

            let response = try await request.response()
            return Array(response.songs)
        } catch {
            throw MusicError.searchFailed
        }
    }

    func searchByMood(mood: MoodType) async throws -> [Song] {
        let moodQuery = moodToMusicQuery(mood)
        return try await searchSongs(query: moodQuery, limit: 20)
    }

    private func moodToMusicQuery(_ mood: MoodType) -> String {
        switch mood {
        case .grateful, .thankful:
            return "grateful peaceful uplifting"
        case .joyful:
            return "happy joyful upbeat"
        case .peaceful, .calm:
            return "peaceful calm relaxing"
        case .hopeful:
            return "hopeful inspiring motivational"
        case .content:
            return "content happy positive"
        case .reflective:
            return "reflective thoughtful contemplative"
        case .inspired:
            return "inspiring energetic motivational"
        case .blessed:
            return "blessed spiritual peaceful"
        }
    }

    // MARK: - Playlists

    func searchPlaylists(query: String, limit: Int = 10) async throws -> [Playlist] {
        guard isAuthorized else {
            throw MusicError.unauthorized
        }

        do {
            var request = MusicCatalogSearchRequest(term: query, types: [Playlist.self])
            request.limit = limit

            let response = try await request.response()
            return Array(response.playlists)
        } catch {
            throw MusicError.searchFailed
        }
    }

    func getGratitudePlaylists() async throws -> [Playlist] {
        return try await searchPlaylists(query: "gratitude meditation peaceful", limit: 15)
    }

    func getMeditationPlaylists() async throws -> [Playlist] {
        return try await searchPlaylists(query: "meditation mindfulness calm", limit: 15)
    }

    // MARK: - Recently Played

    func fetchRecentlyPlayed(limit: Int = 25) async throws -> [Song] {
        guard isAuthorized else {
            throw MusicError.unauthorized
        }

        do {
            var request = MusicRecentlyPlayedRequest()
            request.limit = limit

            let response = try await request.response()
            let songs = response.items.compactMap { item -> Song? in
                switch item {
                case .song(let song):
                    return song
                default:
                    return nil
                }
            }

            self.recentlyPlayed = songs
            return songs
        } catch {
            throw MusicError.searchFailed
        }
    }

    // MARK: - Link Music to Entries

    func linkSongToEntry(song: Song) -> (id: String, title: String, artist: String, artwork: URL?) {
        return (
            id: song.id.rawValue,
            title: song.title,
            artist: song.artistName,
            artwork: song.artwork?.url(width: 300, height: 300)
        )
    }

    func getSongFromEntry(songId: String) async throws -> Song? {
        guard isAuthorized else {
            throw MusicError.unauthorized
        }

        do {
            let id = MusicItemID(songId)
            var request = MusicCatalogResourceRequest<Song>(matching: \.id, equalTo: id)
            let response = try await request.response()
            return response.items.first
        } catch {
            return nil
        }
    }

    // MARK: - Music-Based Prompts

    func generateMusicPrompts(song: Song) -> [String] {
        return [
            "What does '\(song.title)' make you grateful for?",
            "How does \(song.artistName)'s music enhance your life?",
            "What memories does this song bring that fill you with gratitude?",
            "What emotions does this music help you process?"
        ]
    }

    // MARK: - Analytics

    func analyzeMusicGratitudeCorrelation(entries: [JournalEntry]) -> [(genre: String, count: Int, avgSentiment: Double)] {
        // Group entries by music genre
        let musicEntries = entries.filter { $0.musicTrackId != nil }

        // This would require fetching song details for each entry
        // Simplified version:
        let grouped = Dictionary(grouping: musicEntries) { entry in
            entry.musicTrackArtist ?? "Unknown"
        }

        return grouped.map { artist, entries in
            let avgSentiment = entries.compactMap { $0.sentimentScore }.reduce(0, +) / Double(entries.count)
            return (genre: artist, count: entries.count, avgSentiment: avgSentiment)
        }.sorted { $0.avgSentiment > $1.avgSentiment }
    }

    func getMostGratefulSongs(entries: [JournalEntry]) -> [(title: String, artist: String, count: Int)] {
        let musicEntries = entries.filter { $0.musicTrackId != nil }

        let grouped = Dictionary(grouping: musicEntries) { entry in
            (entry.musicTrackTitle ?? "Unknown", entry.musicTrackArtist ?? "Unknown")
        }

        return grouped.map { key, entries in
            (title: key.0, artist: key.1, count: entries.count)
        }.sorted { $0.count > $1.count }
    }

    // MARK: - Playlist Creation

    func createGratitudePlaylist(fromEntries entries: [JournalEntry]) async throws -> [Song] {
        guard isAuthorized else {
            throw MusicError.unauthorized
        }

        var songs: [Song] = []

        for entry in entries {
            if let songId = entry.musicTrackId,
               let song = try await getSongFromEntry(songId: songId) {
                songs.append(song)
            }
        }

        // Remove duplicates
        let uniqueSongs = Array(Set(songs.map { $0.id })).compactMap { id in
            songs.first { $0.id == id }
        }

        return uniqueSongs
    }

    // MARK: - Mood-Based Recommendations

    func getRecommendationsForMood(mood: MoodType) async throws -> [Song] {
        return try await searchByMood(mood: mood)
    }

    func getRecommendationsForJournaling() async throws -> [Song] {
        let queries = [
            "peaceful instrumental focus",
            "lo-fi study calm",
            "ambient peaceful meditation"
        ]

        var allSongs: [Song] = []

        for query in queries {
            let songs = try await searchSongs(query: query, limit: 10)
            allSongs.append(contentsOf: songs)
        }

        return allSongs
    }

    // MARK: - Player Integration

    func playSong(_ song: Song) async throws {
        guard isAuthorized else {
            throw MusicError.unauthorized
        }

        do {
            let player = ApplicationMusicPlayer.shared
            player.queue = ApplicationMusicPlayer.Queue(for: [song])
            try await player.play()
            self.currentSong = song
        } catch {
            throw MusicError.playbackFailed
        }
    }

    func playPlaylist(_ playlist: Playlist) async throws {
        guard isAuthorized else {
            throw MusicError.unauthorized
        }

        do {
            let player = ApplicationMusicPlayer.shared
            player.queue = ApplicationMusicPlayer.Queue(for: playlist)
            try await player.play()
        } catch {
            throw MusicError.playbackFailed
        }
    }

    func pause() {
        ApplicationMusicPlayer.shared.pause()
    }

    func stop() {
        ApplicationMusicPlayer.shared.stop()
    }
}
