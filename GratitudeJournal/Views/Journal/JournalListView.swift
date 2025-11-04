//
//  JournalListView.swift
//  GratitudeJournal
//
//  View all gratitude journal entries with search and filters
//

import SwiftUI
import SwiftData

struct JournalListView: View {
    @Environment(\.modelContext) private var modelContext
    @EnvironmentObject var themeManager: ThemeManager

    @Query(sort: \JournalEntry.date, order: .reverse) private var allEntries: [JournalEntry]

    @State private var searchText = ""
    @State private var selectedFilter: EntryFilter = .all
    @State private var selectedMoodFilter: MoodType?
    @State private var showFilterSheet = false
    @State private var selectedEntry: JournalEntry?

    private var filteredEntries: [JournalEntry] {
        var entries = allEntries

        // Apply search filter
        if !searchText.isEmpty {
            entries = entries.filter { entry in
                entry.content.localizedCaseInsensitiveContains(searchText) ||
                entry.tags.contains(where: { $0.localizedCaseInsensitiveContains(searchText) }) ||
                entry.peopleMentioned.contains(where: { $0.localizedCaseInsensitiveContains(searchText) })
            }
        }

        // Apply category filter
        switch selectedFilter {
        case .all:
            break
        case .favorites:
            entries = entries.filter { $0.isPinned }
        case .drafts:
            entries = entries.filter { $0.isDraft }
        case .letters:
            entries = entries.filter { $0.isGratitudeLetter }
        case .photos:
            entries = entries.filter { !$0.photoURLs.isEmpty }
        case .voice:
            entries = entries.filter { $0.voiceNoteURL != nil }
        }

        // Apply mood filter
        if let moodFilter = selectedMoodFilter {
            entries = entries.filter { $0.mood == moodFilter }
        }

        return entries
    }

    private var groupedEntries: [String: [JournalEntry]] {
        Dictionary(grouping: filteredEntries) { entry in
            let formatter = DateFormatter()
            formatter.dateFormat = "MMMM yyyy"
            return formatter.string(from: entry.date)
        }
    }

    private var sortedMonths: [String] {
        groupedEntries.keys.sorted { month1, month2 in
            let formatter = DateFormatter()
            formatter.dateFormat = "MMMM yyyy"
            guard let date1 = formatter.date(from: month1),
                  let date2 = formatter.date(from: month2) else {
                return false
            }
            return date1 > date2
        }
    }

    var body: some View {
        NavigationStack {
            ZStack {
                themeManager.currentTheme.backgroundColor
                    .ignoresSafeArea()

                if filteredEntries.isEmpty {
                    emptyStateView
                } else {
                    ScrollView {
                        VStack(spacing: 20) {
                            // Filter chips
                            filterChipsSection

                            // Grouped entries by month
                            ForEach(sortedMonths, id: \.self) { month in
                                VStack(alignment: .leading, spacing: 12) {
                                    Text(month)
                                        .font(.headline)
                                        .foregroundColor(themeManager.currentTheme.textPrimary)
                                        .padding(.horizontal)

                                    ForEach(groupedEntries[month] ?? []) { entry in
                                        EntryCard(entry: entry)
                                            .onTapGesture {
                                                selectedEntry = entry
                                            }
                                            .contextMenu {
                                                Button(action: { togglePin(entry) }) {
                                                    Label(entry.isPinned ? "Unpin" : "Pin", systemImage: entry.isPinned ? "pin.slash" : "pin")
                                                }

                                                Button(action: { shareEntry(entry) }) {
                                                    Label("Share", systemImage: "square.and.arrow.up")
                                                }

                                                Button(role: .destructive, action: { deleteEntry(entry) }) {
                                                    Label("Delete", systemImage: "trash")
                                                }
                                            }
                                    }
                                }
                            }
                        }
                        .padding(.vertical)
                    }
                }
            }
            .navigationTitle("Journal")
            .searchable(text: $searchText, prompt: "Search entries, tags, people...")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: { showFilterSheet = true }) {
                        Image(systemName: "line.3.horizontal.decrease.circle")
                            .foregroundColor(themeManager.currentTheme.accentColor)
                    }
                }
            }
            .sheet(item: $selectedEntry) { entry in
                EntryDetailView(entry: entry)
            }
            .sheet(isPresented: $showFilterSheet) {
                FilterSheetView(selectedFilter: $selectedFilter, selectedMood: $selectedMoodFilter)
            }
        }
    }

    // MARK: - View Components

    private var filterChipsSection: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 10) {
                ForEach(EntryFilter.allCases, id: \.self) { filter in
                    FilterChip(
                        filter: filter,
                        isSelected: selectedFilter == filter,
                        action: { selectedFilter = filter }
                    )
                }
            }
            .padding(.horizontal)
        }
    }

    private var emptyStateView: some View {
        VStack(spacing: 20) {
            Image(systemName: "book.closed")
                .font(.system(size: 60))
                .foregroundColor(themeManager.currentTheme.textSecondary.opacity(0.5))

            Text(searchText.isEmpty ? "No entries yet" : "No entries found")
                .font(.title3)
                .fontWeight(.medium)
                .foregroundColor(themeManager.currentTheme.textPrimary)

            Text(searchText.isEmpty ? "Start writing your first gratitude entry!" : "Try adjusting your search or filters")
                .font(.subheadline)
                .foregroundColor(themeManager.currentTheme.textSecondary)
                .multilineTextAlignment(.center)
        }
        .padding()
    }

    // MARK: - Actions

    private func togglePin(_ entry: JournalEntry) {
        entry.isPinned.toggle()
        try? modelContext.save()
    }

    private func deleteEntry(_ entry: JournalEntry) {
        modelContext.delete(entry)
        try? modelContext.save()
    }

    private func shareEntry(_ entry: JournalEntry) {
        // Implement share functionality
        let shareText = """
        \(entry.mood.emoji) \(entry.date.formatted(date: .long, time: .omitted))

        \(entry.content)
        """

        let activityVC = UIActivityViewController(activityItems: [shareText], applicationActivities: nil)
        if let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
           let window = windowScene.windows.first,
           let rootVC = window.rootViewController {
            rootVC.present(activityVC, animated: true)
        }
    }
}

// MARK: - Supporting Views

struct EntryCard: View {
    @EnvironmentObject var themeManager: ThemeManager
    let entry: JournalEntry

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            // Header with date and mood
            HStack {
                Text(entry.mood.emoji)
                    .font(.title2)

                VStack(alignment: .leading, spacing: 2) {
                    Text(entry.date.formatted(date: .abbreviated, time: .omitted))
                        .font(.subheadline)
                        .fontWeight(.medium)
                        .foregroundColor(themeManager.currentTheme.textPrimary)

                    if let locationName = entry.locationName {
                        HStack(spacing: 4) {
                            Image(systemName: "location.fill")
                                .font(.caption2)
                            Text(locationName)
                                .font(.caption)
                        }
                        .foregroundColor(themeManager.currentTheme.textSecondary)
                    }
                }

                Spacer()

                if entry.isPinned {
                    Image(systemName: "pin.fill")
                        .foregroundColor(themeManager.currentTheme.accentColor)
                }

                if entry.isDraft {
                    Text("DRAFT")
                        .font(.caption2)
                        .fontWeight(.semibold)
                        .foregroundColor(.white)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                        .background(Color.orange)
                        .cornerRadius(4)
                }
            }

            // Content preview
            Text(entry.content)
                .font(.body)
                .foregroundColor(themeManager.currentTheme.textPrimary)
                .lineLimit(3)

            // Tags and media indicators
            HStack {
                if !entry.tags.isEmpty {
                    HStack(spacing: 4) {
                        Image(systemName: "tag.fill")
                            .font(.caption)
                        Text(entry.tags.prefix(3).joined(separator: ", "))
                            .font(.caption)
                            .lineLimit(1)
                    }
                    .foregroundColor(themeManager.currentTheme.accentColor)
                }

                Spacer()

                HStack(spacing: 12) {
                    if !entry.photoURLs.isEmpty {
                        HStack(spacing: 4) {
                            Image(systemName: "photo.fill")
                                .font(.caption)
                            Text("\(entry.photoURLs.count)")
                                .font(.caption)
                        }
                        .foregroundColor(themeManager.currentTheme.textSecondary)
                    }

                    if entry.voiceNoteURL != nil {
                        Image(systemName: "mic.fill")
                            .font(.caption)
                            .foregroundColor(themeManager.currentTheme.textSecondary)
                    }

                    if entry.isGratitudeLetter {
                        Image(systemName: "envelope.fill")
                            .font(.caption)
                            .foregroundColor(themeManager.currentTheme.textSecondary)
                    }
                }
            }
        }
        .padding()
        .background(themeManager.currentTheme.cardBackground)
        .cornerRadius(16)
        .shadow(color: .black.opacity(0.05), radius: 8, x: 0, y: 4)
        .padding(.horizontal)
    }
}

struct FilterChip: View {
    @EnvironmentObject var themeManager: ThemeManager
    let filter: EntryFilter
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 6) {
                Image(systemName: filter.icon)
                    .font(.caption)
                Text(filter.title)
                    .font(.subheadline)
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 8)
            .background(isSelected ? themeManager.currentTheme.accentColor : themeManager.currentTheme.cardBackground)
            .foregroundColor(isSelected ? .white : themeManager.currentTheme.textPrimary)
            .cornerRadius(20)
            .shadow(color: .black.opacity(0.05), radius: 4, x: 0, y: 2)
        }
    }
}

enum EntryFilter: String, CaseIterable {
    case all = "All"
    case favorites = "Favorites"
    case drafts = "Drafts"
    case letters = "Letters"
    case photos = "Photos"
    case voice = "Voice Notes"

    var title: String { rawValue }

    var icon: String {
        switch self {
        case .all: return "list.bullet"
        case .favorites: return "star.fill"
        case .drafts: return "folder.fill"
        case .letters: return "envelope.fill"
        case .photos: return "photo.fill"
        case .voice: return "mic.fill"
        }
    }
}

struct FilterSheetView: View {
    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject var themeManager: ThemeManager

    @Binding var selectedFilter: EntryFilter
    @Binding var selectedMood: MoodType?

    var body: some View {
        NavigationStack {
            List {
                Section("Entry Type") {
                    ForEach(EntryFilter.allCases, id: \.self) { filter in
                        Button(action: {
                            selectedFilter = filter
                        }) {
                            HStack {
                                Image(systemName: filter.icon)
                                Text(filter.title)
                                Spacer()
                                if selectedFilter == filter {
                                    Image(systemName: "checkmark")
                                        .foregroundColor(themeManager.currentTheme.accentColor)
                                }
                            }
                        }
                        .foregroundColor(themeManager.currentTheme.textPrimary)
                    }
                }

                Section("Mood") {
                    Button(action: { selectedMood = nil }) {
                        HStack {
                            Text("All Moods")
                            Spacer()
                            if selectedMood == nil {
                                Image(systemName: "checkmark")
                                    .foregroundColor(themeManager.currentTheme.accentColor)
                            }
                        }
                    }
                    .foregroundColor(themeManager.currentTheme.textPrimary)

                    ForEach(MoodType.allCases, id: \.self) { mood in
                        Button(action: { selectedMood = mood }) {
                            HStack {
                                Text(mood.emoji)
                                Text(mood.rawValue)
                                Spacer()
                                if selectedMood == mood {
                                    Image(systemName: "checkmark")
                                        .foregroundColor(themeManager.currentTheme.accentColor)
                                }
                            }
                        }
                        .foregroundColor(themeManager.currentTheme.textPrimary)
                    }
                }
            }
            .navigationTitle("Filters")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") {
                        dismiss()
                    }
                    .foregroundColor(themeManager.currentTheme.accentColor)
                }
            }
        }
    }
}

#Preview {
    JournalListView()
        .environmentObject(ThemeManager())
        .modelContainer(for: [JournalEntry.self])
}
