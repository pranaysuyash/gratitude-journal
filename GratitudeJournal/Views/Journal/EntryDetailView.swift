//
//  EntryDetailView.swift
//  GratitudeJournal
//
//  Detailed view of a single journal entry
//

import SwiftUI
import SwiftData

struct EntryDetailView: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(\.modelContext) private var modelContext
    @EnvironmentObject var themeManager: ThemeManager
    @EnvironmentObject var audioManager: AudioManager

    let entry: JournalEntry

    @State private var showEditView = false
    @State private var isPlayingVoiceNote = false

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 24) {
                    // Date and mood header
                    headerSection

                    // Content
                    contentSection

                    // Photos
                    if !entry.photoURLs.isEmpty {
                        photosSection
                    }

                    // Voice note
                    if let voiceNote = entry.voiceNoteURL {
                        voiceNoteSection(voiceNote)
                    }

                    // Metadata
                    metadataSection

                    // Tags
                    if !entry.tags.isEmpty {
                        tagsSection
                    }

                    // People mentioned
                    if !entry.peopleMentioned.isEmpty {
                        peopleSection
                    }

                    // Categories
                    if !entry.categories.isEmpty {
                        categoriesSection
                    }

                    // Emotions
                    if !entry.emotions.isEmpty {
                        emotionsSection
                    }

                    // Letter recipient
                    if entry.isGratitudeLetter, let recipient = entry.letterRecipient {
                        letterSection(recipient)
                    }

                    // Time capsule
                    if entry.isTimeCapsule {
                        timeCapsuleSection
                    }
                }
                .padding()
            }
            .background(
                LinearGradient(
                    colors: themeManager.currentTheme.gradientColors,
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
                .ignoresSafeArea()
            )
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Close") {
                        dismiss()
                    }
                    .foregroundColor(themeManager.currentTheme.accentColor)
                }

                ToolbarItem(placement: .navigationBarTrailing) {
                    Menu {
                        Button(action: { showEditView = true }) {
                            Label("Edit", systemImage: "pencil")
                        }

                        Button(action: shareEntry) {
                            Label("Share", systemImage: "square.and.arrow.up")
                        }

                        Button(action: togglePin) {
                            Label(entry.isPinned ? "Unpin" : "Pin", systemImage: entry.isPinned ? "pin.slash" : "pin")
                        }

                        Divider()

                        Button(role: .destructive, action: deleteEntry) {
                            Label("Delete", systemImage: "trash")
                        }
                    } label: {
                        Image(systemName: "ellipsis.circle")
                            .foregroundColor(themeManager.currentTheme.accentColor)
                    }
                }
            }
        }
    }

    // MARK: - View Components

    private var headerSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text(entry.mood.emoji)
                    .font(.system(size: 50))

                VStack(alignment: .leading, spacing: 4) {
                    Text(entry.date.formatted(date: .complete, time: .shortened))
                        .font(.headline)
                        .foregroundColor(themeManager.currentTheme.textPrimary)

                    Text(entry.mood.rawValue)
                        .font(.subheadline)
                        .foregroundColor(themeManager.currentTheme.textSecondary)

                    if let locationName = entry.locationName {
                        HStack(spacing: 4) {
                            Image(systemName: "location.fill")
                            Text(locationName)
                        }
                        .font(.caption)
                        .foregroundColor(themeManager.currentTheme.textSecondary)
                    }
                }

                Spacer()

                if entry.isPinned {
                    VStack {
                        Image(systemName: "pin.fill")
                            .font(.title3)
                            .foregroundColor(themeManager.currentTheme.accentColor)
                        Spacer()
                    }
                }
            }
        }
        .padding()
        .background(themeManager.currentTheme.cardBackground)
        .cornerRadius(16)
        .shadow(color: .black.opacity(0.05), radius: 8, x: 0, y: 4)
    }

    private var contentSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(entry.content)
                .font(.body)
                .foregroundColor(themeManager.currentTheme.textPrimary)
                .lineSpacing(6)
        }
        .padding()
        .background(themeManager.currentTheme.cardBackground)
        .cornerRadius(16)
        .shadow(color: .black.opacity(0.05), radius: 8, x: 0, y: 4)
    }

    private var photosSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Photos")
                .font(.headline)
                .foregroundColor(themeManager.currentTheme.textPrimary)

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 12) {
                    ForEach(entry.photoURLs, id: \.self) { photoURL in
                        RoundedRectangle(cornerRadius: 12)
                            .fill(themeManager.currentTheme.primaryColor.opacity(0.2))
                            .frame(width: 150, height: 150)
                            .overlay(
                                Image(systemName: "photo")
                                    .font(.largeTitle)
                                    .foregroundColor(themeManager.currentTheme.accentColor)
                            )
                    }
                }
            }
        }
    }

    private func voiceNoteSection(_ voiceNoteURL: String) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Voice Note")
                .font(.headline)
                .foregroundColor(themeManager.currentTheme.textPrimary)

            HStack {
                Button(action: toggleVoiceNotePlayback) {
                    Image(systemName: isPlayingVoiceNote ? "pause.circle.fill" : "play.circle.fill")
                        .font(.system(size: 40))
                        .foregroundColor(themeManager.currentTheme.accentColor)
                }

                VStack(alignment: .leading, spacing: 4) {
                    Text("Voice Note")
                        .font(.subheadline)
                        .fontWeight(.medium)

                    if let duration = entry.voiceNoteDuration {
                        Text(formatDuration(duration))
                            .font(.caption)
                            .foregroundColor(themeManager.currentTheme.textSecondary)
                    }
                }

                Spacer()

                if audioManager.isPlaying {
                    ProgressView(value: audioManager.playbackProgress)
                        .frame(width: 100)
                        .tint(themeManager.currentTheme.accentColor)
                }
            }
            .padding()
            .background(themeManager.currentTheme.cardBackground)
            .cornerRadius(12)
            .shadow(color: .black.opacity(0.05), radius: 4, x: 0, y: 2)
        }
    }

    private var metadataSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Details")
                .font(.headline)
                .foregroundColor(themeManager.currentTheme.textPrimary)

            VStack(spacing: 10) {
                MetadataRow(icon: "character.cursor.ibeam", label: "Word Count", value: "\(entry.wordCount)")
                MetadataRow(icon: "clock.fill", label: "Writing Time", value: formatDuration(entry.writingDuration))
                MetadataRow(icon: "calendar", label: "Season", value: entry.season.rawValue.capitalized)

                if let weather = entry.weatherCondition {
                    MetadataRow(icon: "cloud.fill", label: "Weather", value: weather.rawValue.capitalized)
                }
            }
            .padding()
            .background(themeManager.currentTheme.cardBackground)
            .cornerRadius(12)
            .shadow(color: .black.opacity(0.05), radius: 4, x: 0, y: 2)
        }
    }

    private var tagsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Tags")
                .font(.headline)
                .foregroundColor(themeManager.currentTheme.textPrimary)

            FlowLayout(spacing: 8) {
                ForEach(entry.tags, id: \.self) { tag in
                    Text("#\(tag)")
                        .font(.caption)
                        .padding(.horizontal, 10)
                        .padding(.vertical, 6)
                        .background(themeManager.currentTheme.primaryColor.opacity(0.2))
                        .foregroundColor(themeManager.currentTheme.accentColor)
                        .cornerRadius(16)
                }
            }
        }
    }

    private var peopleSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("People Mentioned")
                .font(.headline)
                .foregroundColor(themeManager.currentTheme.textPrimary)

            FlowLayout(spacing: 8) {
                ForEach(entry.peopleMentioned, id: \.self) { person in
                    HStack(spacing: 4) {
                        Image(systemName: "person.fill")
                            .font(.caption2)
                        Text(person)
                            .font(.caption)
                    }
                    .padding(.horizontal, 10)
                    .padding(.vertical, 6)
                    .background(themeManager.currentTheme.secondaryColor.opacity(0.2))
                    .foregroundColor(themeManager.currentTheme.accentColor)
                    .cornerRadius(16)
                }
            }
        }
    }

    private var categoriesSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Categories")
                .font(.headline)
                .foregroundColor(themeManager.currentTheme.textPrimary)

            FlowLayout(spacing: 8) {
                ForEach(entry.categories, id: \.self) { category in
                    Text(category)
                        .font(.caption)
                        .padding(.horizontal, 10)
                        .padding(.vertical, 6)
                        .background(themeManager.currentTheme.accentColor.opacity(0.2))
                        .foregroundColor(themeManager.currentTheme.accentColor)
                        .cornerRadius(16)
                }
            }
        }
    }

    private var emotionsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Emotions")
                .font(.headline)
                .foregroundColor(themeManager.currentTheme.textPrimary)

            FlowLayout(spacing: 8) {
                ForEach(entry.emotions, id: \.self) { emotion in
                    Text(emotion.rawValue.capitalized)
                        .font(.caption)
                        .padding(.horizontal, 10)
                        .padding(.vertical, 6)
                        .background(Color.moodPeaceful.opacity(0.2))
                        .foregroundColor(themeManager.currentTheme.accentColor)
                        .cornerRadius(16)
                }
            }
        }
    }

    private func letterSection(_ recipient: String) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Image(systemName: "envelope.fill")
                    .foregroundColor(themeManager.currentTheme.accentColor)
                Text("Gratitude Letter to \(recipient)")
                    .font(.headline)
                    .foregroundColor(themeManager.currentTheme.textPrimary)
            }
        }
        .padding()
        .background(themeManager.currentTheme.primaryColor.opacity(0.1))
        .cornerRadius(12)
    }

    private var timeCapsuleSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Image(systemName: "lock.fill")
                    .foregroundColor(themeManager.currentTheme.accentColor)
                VStack(alignment: .leading, spacing: 4) {
                    Text("Time Capsule")
                        .font(.headline)
                        .foregroundColor(themeManager.currentTheme.textPrimary)

                    if let unlockDate = entry.unlockDate {
                        Text("Unlocks on \(unlockDate.formatted(date: .long, time: .omitted))")
                            .font(.caption)
                            .foregroundColor(themeManager.currentTheme.textSecondary)
                    }
                }
            }
        }
        .padding()
        .background(themeManager.currentTheme.secondaryColor.opacity(0.1))
        .cornerRadius(12)
    }

    // MARK: - Actions

    private func toggleVoiceNotePlayback() {
        guard let voiceNoteURL = entry.voiceNoteURL else { return }

        if isPlayingVoiceNote {
            audioManager.stopPlayback()
        } else {
            audioManager.playAudio(filename: voiceNoteURL)
        }

        isPlayingVoiceNote.toggle()
    }

    private func togglePin() {
        entry.isPinned.toggle()
        try? modelContext.save()
    }

    private func deleteEntry() {
        modelContext.delete(entry)
        try? modelContext.save()
        dismiss()
    }

    private func shareEntry() {
        let shareText = """
        \(entry.mood.emoji) \(entry.date.formatted(date: .long, time: .omitted))

        \(entry.content)

        \(entry.tags.map { "#\($0)" }.joined(separator: " "))
        """

        let activityVC = UIActivityViewController(activityItems: [shareText], applicationActivities: nil)
        if let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
           let window = windowScene.windows.first,
           let rootVC = window.rootViewController {
            rootVC.present(activityVC, animated: true)
        }
    }

    private func formatDuration(_ duration: TimeInterval) -> String {
        let minutes = Int(duration) / 60
        let seconds = Int(duration) % 60
        return String(format: "%d:%02d", minutes, seconds)
    }
}

struct MetadataRow: View {
    @EnvironmentObject var themeManager: ThemeManager
    let icon: String
    let label: String
    let value: String

    var body: some View {
        HStack {
            Image(systemName: icon)
                .font(.caption)
                .foregroundColor(themeManager.currentTheme.accentColor)
                .frame(width: 20)

            Text(label)
                .font(.subheadline)
                .foregroundColor(themeManager.currentTheme.textSecondary)

            Spacer()

            Text(value)
                .font(.subheadline)
                .fontWeight(.medium)
                .foregroundColor(themeManager.currentTheme.textPrimary)
        }
    }
}

#Preview {
    EntryDetailView(entry: JournalEntry(
        content: "Today I'm grateful for the beautiful weather and time spent with family. It was a wonderful day filled with laughter and love.",
        mood: .joyful,
        tags: ["family", "weather", "love"]
    ))
    .environmentObject(ThemeManager())
    .environmentObject(AudioManager())
    .modelContainer(for: [JournalEntry.self])
}
