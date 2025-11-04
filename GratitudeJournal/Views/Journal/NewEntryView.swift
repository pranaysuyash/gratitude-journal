//
//  NewEntryView.swift
//  GratitudeJournal
//
//  Create new gratitude journal entries
//

import SwiftUI
import SwiftData
import PhotosUI

struct NewEntryView: View {
    @Environment(\.modelContext) private var modelContext
    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject var themeManager: ThemeManager
    @EnvironmentObject var audioManager: AudioManager

    @State private var content = ""
    @State private var selectedMood: MoodType = .grateful
    @State private var selectedEmotions: [EmotionType] = []
    @State private var tags: [String] = []
    @State private var currentTag = ""
    @State private var selectedPhotos: [PhotosPickerItem] = []
    @State private var photoURLs: [String] = []
    @State private var showPhotosPicker = false
    @State private var isRecordingVoice = false
    @State private var voiceNoteURL: String?
    @State private var isDraft = false
    @State private var isGratitudeLetter = false
    @State private var letterRecipient = ""
    @State private var showPrompts = false
    @State private var selectedPrompt: String?
    @State private var peopleMentioned: [String] = []
    @State private var currentPerson = ""
    @State private var selectedCategories: [String] = []
    @State private var showCategoryPicker = false
    @State private var startTime = Date()
    @State private var showAmbientSounds = false
    @State private var selectedAmbientSound: AmbientSound?

    @FocusState private var isTextFieldFocused: Bool

    @Query private var categories: [Category]

    private var wordCount: Int {
        content.split(separator: " ").count
    }

    private var writingDuration: TimeInterval {
        Date().timeIntervalSince(startTime)
    }

    var body: some View {
        NavigationStack {
            ZStack {
                // Background
                themeManager.currentTheme.backgroundColor
                    .ignoresSafeArea()

                ScrollView {
                    VStack(spacing: 20) {
                        // Entry Type Selector
                        entryTypeSelector

                        // Gratitude Letter recipient if applicable
                        if isGratitudeLetter {
                            letterRecipientField
                        }

                        // Prompt suggestion
                        if let prompt = selectedPrompt {
                            promptCard(prompt)
                        }

                        // Main text editor
                        textEditorSection

                        // Mood Selector
                        moodSelector

                        // Emotions selector
                        emotionsSelector

                        // Media attachments
                        mediaSection

                        // Tags
                        tagsSection

                        // People mentioned
                        peopleSection

                        // Categories
                        categoriesSection

                        // Stats
                        statsSection
                    }
                    .padding()
                }
            }
            .navigationTitle(isGratitudeLetter ? "Gratitude Letter" : "New Entry")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                    .foregroundColor(themeManager.currentTheme.accentColor)
                }

                ToolbarItem(placement: .navigationBarTrailing) {
                    Menu {
                        Button(action: { showPrompts = true }) {
                            Label("Get Prompt", systemImage: "lightbulb.fill")
                        }

                        Button(action: { showAmbientSounds = true }) {
                            Label("Ambient Sounds", systemImage: "speaker.wave.2.fill")
                        }

                        Button(action: { saveAsDraft() }) {
                            Label("Save as Draft", systemImage: "folder.fill")
                        }
                    } label: {
                        Image(systemName: "ellipsis.circle")
                            .foregroundColor(themeManager.currentTheme.accentColor)
                    }
                }
            }
            .toolbar {
                ToolbarItemGroup(placement: .bottomBar) {
                    Button(action: { saveAsDraft() }) {
                        Label("Draft", systemImage: "folder")
                    }

                    Spacer()

                    Button(action: { saveEntry() }) {
                        Text("Save Entry")
                            .fontWeight(.semibold)
                            .foregroundColor(.white)
                            .padding(.horizontal, 24)
                            .padding(.vertical, 8)
                            .background(themeManager.currentTheme.accentColor)
                            .cornerRadius(20)
                    }
                    .disabled(content.isEmpty)
                }
            }
            .sheet(isPresented: $showPrompts) {
                PromptsListView(selectedPrompt: $selectedPrompt)
            }
            .sheet(isPresented: $showAmbientSounds) {
                AmbientSoundsView(selectedSound: $selectedAmbientSound)
            }
        }
    }

    // MARK: - View Components

    private var entryTypeSelector: some View {
        HStack(spacing: 12) {
            EntryTypeButton(
                title: "Journal Entry",
                icon: "book.fill",
                isSelected: !isGratitudeLetter,
                action: { isGratitudeLetter = false }
            )

            EntryTypeButton(
                title: "Gratitude Letter",
                icon: "envelope.fill",
                isSelected: isGratitudeLetter,
                action: { isGratitudeLetter = true }
            )
        }
    }

    private var letterRecipientField: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("To:")
                .font(.subheadline)
                .fontWeight(.medium)
                .foregroundColor(themeManager.currentTheme.textPrimary)

            TextField("Who are you grateful for?", text: $letterRecipient)
                .padding()
                .background(themeManager.currentTheme.cardBackground)
                .cornerRadius(12)
        }
    }

    private func promptCard(_ prompt: String) -> some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text("Writing Prompt")
                    .font(.caption)
                    .fontWeight(.medium)
                    .foregroundColor(themeManager.currentTheme.accentColor)

                Text(prompt)
                    .font(.subheadline)
                    .foregroundColor(themeManager.currentTheme.textPrimary)
            }

            Spacer()

            Button(action: { selectedPrompt = nil }) {
                Image(systemName: "xmark.circle.fill")
                    .foregroundColor(themeManager.currentTheme.textSecondary)
            }
        }
        .padding()
        .background(themeManager.currentTheme.primaryColor.opacity(0.1))
        .cornerRadius(12)
    }

    private var textEditorSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            ZStack(alignment: .topLeading) {
                if content.isEmpty {
                    Text(isGratitudeLetter ? "Dear \(letterRecipient.isEmpty ? "someone special" : letterRecipient),\n\nI want to express my gratitude for..." : "What are you grateful for today?")
                        .foregroundColor(themeManager.currentTheme.textSecondary.opacity(0.5))
                        .padding(.top, 8)
                        .padding(.leading, 4)
                }

                TextEditor(text: $content)
                    .frame(minHeight: 200)
                    .focused($isTextFieldFocused)
                    .scrollContentBackground(.hidden)
            }
            .padding()
            .background(themeManager.currentTheme.cardBackground)
            .cornerRadius(12)
            .shadow(color: .black.opacity(0.05), radius: 4, x: 0, y: 2)
        }
    }

    private var moodSelector: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("How are you feeling?")
                .font(.subheadline)
                .fontWeight(.medium)
                .foregroundColor(themeManager.currentTheme.textPrimary)

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 12) {
                    ForEach(MoodType.allCases, id: \.self) { mood in
                        MoodButton(
                            mood: mood,
                            isSelected: selectedMood == mood,
                            action: { selectedMood = mood }
                        )
                    }
                }
            }
        }
    }

    private var emotionsSelector: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Emotions (tap to select)")
                .font(.subheadline)
                .fontWeight(.medium)
                .foregroundColor(themeManager.currentTheme.textPrimary)

            FlowLayout(spacing: 8) {
                ForEach(EmotionType.allCases, id: \.self) { emotion in
                    EmotionTag(
                        emotion: emotion,
                        isSelected: selectedEmotions.contains(emotion),
                        action: { toggleEmotion(emotion) }
                    )
                }
            }
        }
    }

    private var mediaSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Media")
                .font(.subheadline)
                .fontWeight(.medium)
                .foregroundColor(themeManager.currentTheme.textPrimary)

            HStack(spacing: 12) {
                // Photo picker button
                PhotosPicker(selection: $selectedPhotos, maxSelectionCount: 10, matching: .images) {
                    MediaButton(icon: "photo.fill", title: "Photos", count: photoURLs.count)
                }
                .onChange(of: selectedPhotos) { _, newValue in
                    handlePhotoSelection(newValue)
                }

                // Voice note button
                Button(action: toggleVoiceRecording) {
                    MediaButton(
                        icon: isRecordingVoice ? "stop.circle.fill" : "mic.fill",
                        title: isRecordingVoice ? "Recording..." : "Voice",
                        count: voiceNoteURL != nil ? 1 : 0,
                        isActive: isRecordingVoice
                    )
                }
            }
        }
    }

    private var tagsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Tags")
                .font(.subheadline)
                .fontWeight(.medium)
                .foregroundColor(themeManager.currentTheme.textPrimary)

            HStack {
                TextField("Add tag...", text: $currentTag)
                    .padding(.vertical, 8)
                    .padding(.horizontal, 12)
                    .background(themeManager.currentTheme.cardBackground)
                    .cornerRadius(8)
                    .onSubmit {
                        addTag()
                    }

                Button(action: addTag) {
                    Image(systemName: "plus.circle.fill")
                        .font(.title3)
                        .foregroundColor(themeManager.currentTheme.accentColor)
                }
            }

            if !tags.isEmpty {
                FlowLayout(spacing: 8) {
                    ForEach(tags, id: \.self) { tag in
                        TagChip(tag: tag) {
                            removeTag(tag)
                        }
                    }
                }
            }
        }
    }

    private var peopleSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("People Mentioned")
                .font(.subheadline)
                .fontWeight(.medium)
                .foregroundColor(themeManager.currentTheme.textPrimary)

            HStack {
                TextField("Add person...", text: $currentPerson)
                    .padding(.vertical, 8)
                    .padding(.horizontal, 12)
                    .background(themeManager.currentTheme.cardBackground)
                    .cornerRadius(8)
                    .onSubmit {
                        addPerson()
                    }

                Button(action: addPerson) {
                    Image(systemName: "plus.circle.fill")
                        .font(.title3)
                        .foregroundColor(themeManager.currentTheme.accentColor)
                }
            }

            if !peopleMentioned.isEmpty {
                FlowLayout(spacing: 8) {
                    ForEach(peopleMentioned, id: \.self) { person in
                        PersonChip(person: person) {
                            removePerson(person)
                        }
                    }
                }
            }
        }
    }

    private var categoriesSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Categories")
                .font(.subheadline)
                .fontWeight(.medium)
                .foregroundColor(themeManager.currentTheme.textPrimary)

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 8) {
                    ForEach(categories) { category in
                        CategoryChip(
                            category: category,
                            isSelected: selectedCategories.contains(category.name),
                            action: { toggleCategory(category.name) }
                        )
                    }
                }
            }
        }
    }

    private var statsSection: some View {
        HStack(spacing: 20) {
            StatItem(icon: "character.cursor.ibeam", value: "\(wordCount)", label: "Words")
            StatItem(icon: "clock.fill", value: formatDuration(writingDuration), label: "Time")
            StatItem(icon: "photo.fill", value: "\(photoURLs.count)", label: "Photos")
        }
        .padding()
        .background(themeManager.currentTheme.cardBackground.opacity(0.5))
        .cornerRadius(12)
    }

    // MARK: - Actions

    private func toggleEmotion(_ emotion: EmotionType) {
        if selectedEmotions.contains(emotion) {
            selectedEmotions.removeAll { $0 == emotion }
        } else {
            selectedEmotions.append(emotion)
        }
    }

    private func addTag() {
        let trimmed = currentTag.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty, !tags.contains(trimmed) else { return }
        tags.append(trimmed)
        currentTag = ""
    }

    private func removeTag(_ tag: String) {
        tags.removeAll { $0 == tag }
    }

    private func addPerson() {
        let trimmed = currentPerson.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty, !peopleMentioned.contains(trimmed) else { return }
        peopleMentioned.append(trimmed)
        currentPerson = ""
    }

    private func removePerson(_ person: String) {
        peopleMentioned.removeAll { $0 == person }
    }

    private func toggleCategory(_ categoryName: String) {
        if selectedCategories.contains(categoryName) {
            selectedCategories.removeAll { $0 == categoryName }
        } else {
            selectedCategories.append(categoryName)
        }
    }

    private func handlePhotoSelection(_ items: [PhotosPickerItem]) {
        // In a real app, save photos to document directory and store URLs
        // For now, simulate with count
        photoURLs = items.enumerated().map { index, _ in "photo_\(index).jpg" }
    }

    private func toggleVoiceRecording() {
        if isRecordingVoice {
            voiceNoteURL = audioManager.stopRecording()
            isRecordingVoice = false
        } else {
            audioManager.startRecording(for: UUID())
            isRecordingVoice = true
        }
    }

    private func saveEntry() {
        let entry = JournalEntry(
            content: content,
            mood: selectedMood,
            emotions: selectedEmotions,
            photoURLs: photoURLs,
            tags: tags,
            categories: selectedCategories,
            peopleMentioned: peopleMentioned,
            season: Season.current()
        )

        entry.voiceNoteURL = voiceNoteURL
        entry.writingDuration = writingDuration
        entry.promptUsed = selectedPrompt
        entry.isGratitudeLetter = isGratitudeLetter
        entry.letterRecipient = isGratitudeLetter ? letterRecipient : nil

        modelContext.insert(entry)

        do {
            try modelContext.save()
            dismiss()
        } catch {
            print("Error saving entry: \(error)")
        }
    }

    private func saveAsDraft() {
        let entry = JournalEntry(
            content: content,
            mood: selectedMood,
            emotions: selectedEmotions,
            photoURLs: photoURLs,
            tags: tags,
            categories: selectedCategories,
            peopleMentioned: peopleMentioned,
            isDraft: true
        )

        modelContext.insert(entry)

        do {
            try modelContext.save()
            dismiss()
        } catch {
            print("Error saving draft: \(error)")
        }
    }

    private func formatDuration(_ duration: TimeInterval) -> String {
        let minutes = Int(duration) / 60
        let seconds = Int(duration) % 60
        return String(format: "%d:%02d", minutes, seconds)
    }
}

// MARK: - Supporting Views

struct EntryTypeButton: View {
    @EnvironmentObject var themeManager: ThemeManager
    let title: String
    let icon: String
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack {
                Image(systemName: icon)
                Text(title)
                    .font(.subheadline)
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 10)
            .background(isSelected ? themeManager.currentTheme.accentColor : themeManager.currentTheme.cardBackground)
            .foregroundColor(isSelected ? .white : themeManager.currentTheme.textPrimary)
            .cornerRadius(20)
        }
    }
}

struct MoodButton: View {
    let mood: MoodType
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            VStack(spacing: 6) {
                Text(mood.emoji)
                    .font(.system(size: 32))

                Text(mood.rawValue)
                    .font(.caption)
                    .fontWeight(isSelected ? .semibold : .regular)
            }
            .padding()
            .background(isSelected ? Color(mood.color).opacity(0.3) : Color.white.opacity(0.5))
            .cornerRadius(12)
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(isSelected ? Color(mood.color) : Color.clear, lineWidth: 2)
            )
        }
    }
}

struct EmotionTag: View {
    @EnvironmentObject var themeManager: ThemeManager
    let emotion: EmotionType
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Text(emotion.rawValue.capitalized)
                .font(.caption)
                .padding(.horizontal, 12)
                .padding(.vertical, 6)
                .background(isSelected ? themeManager.currentTheme.accentColor : themeManager.currentTheme.cardBackground)
                .foregroundColor(isSelected ? .white : themeManager.currentTheme.textPrimary)
                .cornerRadius(16)
        }
    }
}

struct MediaButton: View {
    @EnvironmentObject var themeManager: ThemeManager
    let icon: String
    let title: String
    var count: Int = 0
    var isActive: Bool = false

    var body: some View {
        VStack(spacing: 8) {
            ZStack(alignment: .topTrailing) {
                Image(systemName: icon)
                    .font(.title2)
                    .foregroundColor(isActive ? .red : themeManager.currentTheme.accentColor)

                if count > 0 {
                    Text("\(count)")
                        .font(.caption2)
                        .fontWeight(.bold)
                        .foregroundColor(.white)
                        .padding(4)
                        .background(Color.red)
                        .clipShape(Circle())
                }
            }

            Text(title)
                .font(.caption)
                .foregroundColor(themeManager.currentTheme.textPrimary)
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(themeManager.currentTheme.cardBackground)
        .cornerRadius(12)
    }
}

struct TagChip: View {
    @EnvironmentObject var themeManager: ThemeManager
    let tag: String
    let onRemove: () -> Void

    var body: some View {
        HStack(spacing: 4) {
            Text("#\(tag)")
                .font(.caption)

            Button(action: onRemove) {
                Image(systemName: "xmark.circle.fill")
                    .font(.caption)
            }
        }
        .padding(.horizontal, 10)
        .padding(.vertical, 6)
        .background(themeManager.currentTheme.primaryColor.opacity(0.2))
        .foregroundColor(themeManager.currentTheme.accentColor)
        .cornerRadius(16)
    }
}

struct PersonChip: View {
    @EnvironmentObject var themeManager: ThemeManager
    let person: String
    let onRemove: () -> Void

    var body: some View {
        HStack(spacing: 4) {
            Image(systemName: "person.fill")
                .font(.caption2)
            Text(person)
                .font(.caption)

            Button(action: onRemove) {
                Image(systemName: "xmark.circle.fill")
                    .font(.caption)
            }
        }
        .padding(.horizontal, 10)
        .padding(.vertical, 6)
        .background(themeManager.currentTheme.secondaryColor.opacity(0.2))
        .foregroundColor(themeManager.currentTheme.accentColor)
        .cornerRadius(16)
    }
}

struct CategoryChip: View {
    let category: Category
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 6) {
                Image(systemName: category.icon)
                    .font(.caption)
                Text(category.name)
                    .font(.caption)
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 8)
            .background(isSelected ? Color(hex: category.colorHex) : Color(hex: category.colorHex).opacity(0.2))
            .foregroundColor(isSelected ? .white : Color(hex: category.colorHex))
            .cornerRadius(16)
        }
    }
}

struct StatItem: View {
    @EnvironmentObject var themeManager: ThemeManager
    let icon: String
    let value: String
    let label: String

    var body: some View {
        HStack(spacing: 8) {
            Image(systemName: icon)
                .foregroundColor(themeManager.currentTheme.accentColor)
            VStack(alignment: .leading, spacing: 2) {
                Text(value)
                    .font(.subheadline)
                    .fontWeight(.semibold)
                Text(label)
                    .font(.caption2)
                    .foregroundColor(themeManager.currentTheme.textSecondary)
            }
        }
    }
}

// Flow Layout for wrapping tags
struct FlowLayout: Layout {
    var spacing: CGFloat = 8

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let result = FlowResult(in: proposal.replacingUnspecifiedDimensions().width, subviews: subviews, spacing: spacing)
        return result.size
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        let result = FlowResult(in: bounds.width, subviews: subviews, spacing: spacing)
        for (index, subview) in subviews.enumerated() {
            subview.place(at: CGPoint(x: bounds.minX + result.positions[index].x, y: bounds.minY + result.positions[index].y), proposal: .unspecified)
        }
    }

    struct FlowResult {
        var size: CGSize
        var positions: [CGPoint]

        init(in maxWidth: CGFloat, subviews: Subviews, spacing: CGFloat) {
            var positions: [CGPoint] = []
            var size: CGSize = .zero
            var currentX: CGFloat = 0
            var currentY: CGFloat = 0
            var lineHeight: CGFloat = 0

            for subview in subviews {
                let subviewSize = subview.sizeThatFits(.unspecified)

                if currentX + subviewSize.width > maxWidth && currentX > 0 {
                    currentX = 0
                    currentY += lineHeight + spacing
                    lineHeight = 0
                }

                positions.append(CGPoint(x: currentX, y: currentY))
                currentX += subviewSize.width + spacing
                lineHeight = max(lineHeight, subviewSize.height)
                size.width = max(size.width, currentX)
                size.height = currentY + lineHeight
            }

            self.size = size
            self.positions = positions
        }
    }
}

#Preview {
    NewEntryView()
        .environmentObject(ThemeManager())
        .environmentObject(NotificationManager())
        .environmentObject(AudioManager())
        .modelContainer(for: [JournalEntry.self, Category.self])
}
