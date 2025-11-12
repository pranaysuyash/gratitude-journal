//
//  CollectionsView.swift
//  GratitudeJournal
//
//  Organize entries into custom collections and themes
//

import SwiftUI
import SwiftData

struct CollectionsView: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(\.modelContext) private var modelContext
    @EnvironmentObject var themeManager: ThemeManager

    @Query private var collections: [EntryCollection]
    @Query private var entries: [JournalEntry]

    @State private var selectedCollection: EntryCollection?
    @State private var showCreateCollection = false
    @State private var showDefaultCollections = false

    var body: some View {
        NavigationStack {
            ZStack {
                themeManager.currentTheme.backgroundColor
                    .ignoresSafeArea()

                if collections.isEmpty {
                    emptyState
                } else {
                    ScrollView {
                        VStack(spacing: 20) {
                            // Favorites section
                            if !favoriteCollections.isEmpty {
                                VStack(alignment: .leading, spacing: 12) {
                                    Text("Favorites")
                                        .font(.headline)
                                        .foregroundColor(themeManager.currentTheme.textPrimary)
                                        .padding(.horizontal)

                                    ForEach(favoriteCollections) { collection in
                                        CollectionCard(collection: collection, entries: entries) {
                                            selectedCollection = collection
                                        }
                                        .padding(.horizontal)
                                    }
                                }
                            }

                            // All collections
                            VStack(alignment: .leading, spacing: 12) {
                                Text("All Collections")
                                    .font(.headline)
                                    .foregroundColor(themeManager.currentTheme.textPrimary)
                                    .padding(.horizontal)

                                ForEach(collections.filter { !$0.isFavorite }) { collection in
                                    CollectionCard(collection: collection, entries: entries) {
                                        selectedCollection = collection
                                    }
                                    .padding(.horizontal)
                                }
                            }
                        }
                        .padding(.vertical)
                    }
                }
            }
            .navigationTitle("Collections")
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Done") { dismiss() }
                }

                ToolbarItem(placement: .navigationBarTrailing) {
                    Menu {
                        Button(action: { showCreateCollection = true }) {
                            Label("New Collection", systemImage: "plus")
                        }

                        if collections.isEmpty {
                            Button(action: { showDefaultCollections = true }) {
                                Label("Add Default Collections", systemImage: "square.stack.3d.up")
                            }
                        }
                    } label: {
                        Image(systemName: "ellipsis.circle")
                    }
                }
            }
            .sheet(isPresented: $showCreateCollection) {
                CreateCollectionView()
            }
            .sheet(item: $selectedCollection) { collection in
                CollectionDetailView(collection: collection, allEntries: entries)
            }
            .alert("Add Default Collections?", isPresented: $showDefaultCollections) {
                Button("Add") { addDefaultCollections() }
                Button("Cancel", role: .cancel) { }
            } message: {
                Text("This will add 4 starter collections to help organize your entries")
            }
        }
    }

    private var emptyState: some View {
        VStack(spacing: 20) {
            Text("📚")
                .font(.system(size: 80))

            Text("Create Your First Collection")
                .font(.title2)
                .fontWeight(.semibold)

            Text("Organize your entries into themed collections for easy browsing and reflection")
                .font(.body)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 40)

            VStack(spacing: 12) {
                Button(action: { showCreateCollection = true }) {
                    Text("Create Collection")
                        .fontWeight(.semibold)
                        .foregroundColor(.white)
                        .frame(maxWidth: 200)
                        .padding()
                        .background(themeManager.currentTheme.accentColor)
                        .cornerRadius(12)
                }

                Button(action: { showDefaultCollections = true }) {
                    Text("Use Default Collections")
                        .fontWeight(.medium)
                        .foregroundColor(themeManager.currentTheme.accentColor)
                }
            }
        }
    }

    private var favoriteCollections: [EntryCollection] {
        collections.filter { $0.isFavorite }
    }

    private func addDefaultCollections() {
        for collection in EntryCollection.defaultCollections {
            modelContext.insert(collection)
        }
    }
}

struct CollectionCard: View {
    @EnvironmentObject var themeManager: ThemeManager
    let collection: EntryCollection
    let entries: [JournalEntry]
    let action: () -> Void

    private var collectionEntries: [JournalEntry] {
        entries.filter { collection.entryIDs.contains($0.id) }
    }

    var body: some View {
        Button(action: action) {
            HStack(spacing: 16) {
                // Color indicator
                RoundedRectangle(cornerRadius: 8)
                    .fill(Color(hex: collection.color) ?? themeManager.currentTheme.accentColor)
                    .frame(width: 8)

                VStack(alignment: .leading, spacing: 8) {
                    HStack {
                        Text(collection.name)
                            .font(.title3)
                            .fontWeight(.semibold)
                            .foregroundColor(themeManager.currentTheme.textPrimary)

                        if collection.isFavorite {
                            Image(systemName: "star.fill")
                                .font(.caption)
                                .foregroundColor(.yellow)
                        }

                        Spacer()

                        Image(systemName: "chevron.right")
                            .foregroundColor(themeManager.currentTheme.textSecondary)
                    }

                    if !collection.collectionDescription.isEmpty {
                        Text(collection.collectionDescription)
                            .font(.subheadline)
                            .foregroundColor(themeManager.currentTheme.textSecondary)
                            .lineLimit(2)
                    }

                    HStack {
                        Label("\(collection.entryCount) entries", systemImage: "doc.text")
                            .font(.caption)
                            .foregroundColor(themeManager.currentTheme.textSecondary)

                        Spacer()

                        Text(collection.theme)
                            .font(.caption)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 4)
                            .background(Color(hex: collection.color)?.opacity(0.2) ?? themeManager.currentTheme.accentColor.opacity(0.2))
                            .foregroundColor(Color(hex: collection.color) ?? themeManager.currentTheme.accentColor)
                            .cornerRadius(6)
                    }
                }
                .padding(.vertical, 12)
            }
            .padding(.horizontal, 12)
            .background(themeManager.currentTheme.cardBackground)
            .cornerRadius(16)
            .shadow(color: .black.opacity(0.05), radius: 8, x: 0, y: 4)
        }
    }
}

struct CreateCollectionView: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(\.modelContext) private var modelContext
    @EnvironmentObject var themeManager: ThemeManager

    @State private var name = ""
    @State private var description = ""
    @State private var theme = "General"
    @State private var selectedColor = "#007AFF"

    let themes = ["General", "Memories", "Growth", "People", "Health", "Travel", "Work", "Creativity"]
    let colors = [
        "#007AFF", "#FF6B6B", "#4ECDC4", "#FFE66D",
        "#95E1D3", "#A8E6CF", "#FF8B94", "#C7CEEA"
    ]

    var body: some View {
        NavigationStack {
            Form {
                Section("Collection Details") {
                    TextField("Name", text: $name)

                    TextField("Description (optional)", text: $description, axis: .vertical)
                        .lineLimit(2...4)

                    Picker("Theme", selection: $theme) {
                        ForEach(themes, id: \.self) { theme in
                            Text(theme).tag(theme)
                        }
                    }
                }

                Section("Color") {
                    LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 8), spacing: 12) {
                        ForEach(colors, id: \.self) { color in
                            Circle()
                                .fill(Color(hex: color) ?? .blue)
                                .frame(width: 32, height: 32)
                                .overlay(
                                    Circle()
                                        .strokeBorder(Color.white, lineWidth: selectedColor == color ? 3 : 0)
                                )
                                .onTapGesture {
                                    selectedColor = color
                                }
                        }
                    }
                    .padding(.vertical, 8)
                }

                Section {
                    Button(action: createCollection) {
                        Text("Create Collection")
                            .frame(maxWidth: .infinity)
                            .foregroundColor(.white)
                            .padding()
                            .background(themeManager.currentTheme.accentColor)
                            .cornerRadius(12)
                    }
                    .disabled(name.isEmpty)
                }
                .listRowBackground(Color.clear)
            }
            .navigationTitle("New Collection")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") { dismiss() }
                }
            }
        }
    }

    private func createCollection() {
        let collection = EntryCollection(name: name, description: description, theme: theme, color: selectedColor)
        modelContext.insert(collection)
        dismiss()
    }
}

struct CollectionDetailView: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(\.modelContext) private var modelContext
    @EnvironmentObject var themeManager: ThemeManager

    @Bindable var collection: EntryCollection
    let allEntries: [JournalEntry]

    @State private var showAddEntries = false
    @State private var showEditCollection = false
    @State private var selectedEntry: JournalEntry?

    private var collectionEntries: [JournalEntry] {
        allEntries.filter { collection.entryIDs.contains($0.id) }
    }

    var body: some View {
        NavigationStack {
            ZStack {
                themeManager.currentTheme.backgroundColor
                    .ignoresSafeArea()

                ScrollView {
                    VStack(spacing: 20) {
                        // Collection header
                        VStack(spacing: 12) {
                            HStack {
                                Circle()
                                    .fill(Color(hex: collection.color) ?? themeManager.currentTheme.accentColor)
                                    .frame(width: 60, height: 60)

                                VStack(alignment: .leading, spacing: 4) {
                                    Text(collection.theme)
                                        .font(.subheadline)
                                        .foregroundColor(themeManager.currentTheme.textSecondary)

                                    Text("\(collection.entryCount) entries")
                                        .font(.caption)
                                        .foregroundColor(themeManager.currentTheme.textSecondary)
                                }

                                Spacer()

                                Button(action: toggleFavorite) {
                                    Image(systemName: collection.isFavorite ? "star.fill" : "star")
                                        .foregroundColor(.yellow)
                                        .font(.title3)
                                }
                            }

                            if !collection.collectionDescription.isEmpty {
                                Text(collection.collectionDescription)
                                    .font(.body)
                                    .foregroundColor(themeManager.currentTheme.textSecondary)
                                    .frame(maxWidth: .infinity, alignment: .leading)
                            }
                        }
                        .padding()
                        .background(themeManager.currentTheme.cardBackground)
                        .cornerRadius(16)
                        .padding(.horizontal)

                        // Entries list
                        if collectionEntries.isEmpty {
                            VStack(spacing: 16) {
                                Image(systemName: "doc.text.magnifyingglass")
                                    .font(.system(size: 50))
                                    .foregroundColor(themeManager.currentTheme.textSecondary)

                                Text("No entries in this collection")
                                    .font(.headline)

                                Button(action: { showAddEntries = true }) {
                                    Text("Add Entries")
                                        .foregroundColor(.white)
                                        .padding(.horizontal, 24)
                                        .padding(.vertical, 12)
                                        .background(themeManager.currentTheme.accentColor)
                                        .cornerRadius(10)
                                }
                            }
                            .padding(40)
                        } else {
                            VStack(alignment: .leading, spacing: 12) {
                                Text("Entries")
                                    .font(.headline)
                                    .padding(.horizontal)

                                ForEach(collectionEntries.sorted(by: { $0.date > $1.date })) { entry in
                                    EntryRowView(entry: entry)
                                        .onTapGesture {
                                            selectedEntry = entry
                                        }
                                        .swipeActions(edge: .trailing, allowsFullSwipe: false) {
                                            Button(role: .destructive) {
                                                collection.removeEntry(entry.id)
                                            } label: {
                                                Label("Remove", systemImage: "trash")
                                            }
                                        }
                                        .padding(.horizontal)
                                }
                            }
                        }
                    }
                    .padding(.vertical)
                }
            }
            .navigationTitle(collection.name)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Done") { dismiss() }
                }

                ToolbarItem(placement: .navigationBarTrailing) {
                    Menu {
                        Button(action: { showAddEntries = true }) {
                            Label("Add Entries", systemImage: "plus")
                        }

                        Button(action: { showEditCollection = true }) {
                            Label("Edit Collection", systemImage: "pencil")
                        }

                        Button(role: .destructive, action: deleteCollection) {
                            Label("Delete Collection", systemImage: "trash")
                        }
                    } label: {
                        Image(systemName: "ellipsis.circle")
                    }
                }
            }
            .sheet(isPresented: $showAddEntries) {
                AddEntriesToCollectionView(collection: collection, availableEntries: availableEntries)
            }
            .sheet(isPresented: $showEditCollection) {
                EditCollectionView(collection: collection)
            }
            .sheet(item: $selectedEntry) { entry in
                NavigationStack {
                    EntryDetailView(entry: entry)
                }
            }
        }
    }

    private var availableEntries: [JournalEntry] {
        allEntries.filter { !collection.entryIDs.contains($0.id) }
    }

    private func toggleFavorite() {
        collection.isFavorite.toggle()
    }

    private func deleteCollection() {
        modelContext.delete(collection)
        dismiss()
    }
}

struct EntryRowView: View {
    @EnvironmentObject var themeManager: ThemeManager
    let entry: JournalEntry

    var body: some View {
        HStack(spacing: 12) {
            Text(entry.mood.emoji)
                .font(.title2)

            VStack(alignment: .leading, spacing: 4) {
                Text(entry.content)
                    .font(.body)
                    .foregroundColor(themeManager.currentTheme.textPrimary)
                    .lineLimit(2)

                Text(entry.date.formatted(date: .abbreviated, time: .omitted))
                    .font(.caption)
                    .foregroundColor(themeManager.currentTheme.textSecondary)
            }

            Spacer()
        }
        .padding()
        .background(themeManager.currentTheme.cardBackground)
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.03), radius: 4, x: 0, y: 2)
    }
}

struct AddEntriesToCollectionView: View {
    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject var themeManager: ThemeManager

    @Bindable var collection: EntryCollection
    let availableEntries: [JournalEntry]

    @State private var selectedEntryIDs: Set<UUID> = []

    var body: some View {
        NavigationStack {
            ZStack {
                themeManager.currentTheme.backgroundColor
                    .ignoresSafeArea()

                if availableEntries.isEmpty {
                    VStack(spacing: 16) {
                        Image(systemName: "checkmark.circle")
                            .font(.system(size: 60))
                            .foregroundColor(.green)

                        Text("All entries are already in this collection")
                            .font(.headline)
                            .multilineTextAlignment(.center)
                    }
                } else {
                    ScrollView {
                        VStack(spacing: 12) {
                            ForEach(availableEntries.sorted(by: { $0.date > $1.date })) { entry in
                                Button(action: { toggleSelection(entry.id) }) {
                                    HStack(spacing: 12) {
                                        Image(systemName: selectedEntryIDs.contains(entry.id) ? "checkmark.circle.fill" : "circle")
                                            .foregroundColor(selectedEntryIDs.contains(entry.id) ? .green : .gray)
                                            .font(.title3)

                                        Text(entry.mood.emoji)
                                            .font(.title3)

                                        VStack(alignment: .leading, spacing: 4) {
                                            Text(entry.content)
                                                .font(.body)
                                                .foregroundColor(themeManager.currentTheme.textPrimary)
                                                .lineLimit(2)
                                                .frame(maxWidth: .infinity, alignment: .leading)

                                            Text(entry.date.formatted(date: .abbreviated, time: .omitted))
                                                .font(.caption)
                                                .foregroundColor(themeManager.currentTheme.textSecondary)
                                        }
                                    }
                                    .padding()
                                    .background(themeManager.currentTheme.cardBackground)
                                    .cornerRadius(12)
                                }
                                .buttonStyle(.plain)
                            }
                        }
                        .padding()
                    }
                }
            }
            .navigationTitle("Add Entries")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") { dismiss() }
                }

                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Add (\(selectedEntryIDs.count))") {
                        addSelectedEntries()
                    }
                    .disabled(selectedEntryIDs.isEmpty)
                }
            }
        }
    }

    private func toggleSelection(_ id: UUID) {
        if selectedEntryIDs.contains(id) {
            selectedEntryIDs.remove(id)
        } else {
            selectedEntryIDs.insert(id)
        }
    }

    private func addSelectedEntries() {
        for id in selectedEntryIDs {
            collection.addEntry(id)
        }
        dismiss()
    }
}

struct EditCollectionView: View {
    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject var themeManager: ThemeManager

    @Bindable var collection: EntryCollection

    @State private var name: String
    @State private var description: String
    @State private var theme: String
    @State private var selectedColor: String

    let themes = ["General", "Memories", "Growth", "People", "Health", "Travel", "Work", "Creativity"]
    let colors = [
        "#007AFF", "#FF6B6B", "#4ECDC4", "#FFE66D",
        "#95E1D3", "#A8E6CF", "#FF8B94", "#C7CEEA"
    ]

    init(collection: EntryCollection) {
        self.collection = collection
        _name = State(initialValue: collection.name)
        _description = State(initialValue: collection.collectionDescription)
        _theme = State(initialValue: collection.theme)
        _selectedColor = State(initialValue: collection.color)
    }

    var body: some View {
        NavigationStack {
            Form {
                Section("Collection Details") {
                    TextField("Name", text: $name)

                    TextField("Description (optional)", text: $description, axis: .vertical)
                        .lineLimit(2...4)

                    Picker("Theme", selection: $theme) {
                        ForEach(themes, id: \.self) { theme in
                            Text(theme).tag(theme)
                        }
                    }
                }

                Section("Color") {
                    LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 8), spacing: 12) {
                        ForEach(colors, id: \.self) { color in
                            Circle()
                                .fill(Color(hex: color) ?? .blue)
                                .frame(width: 32, height: 32)
                                .overlay(
                                    Circle()
                                        .strokeBorder(Color.white, lineWidth: selectedColor == color ? 3 : 0)
                                )
                                .onTapGesture {
                                    selectedColor = color
                                }
                        }
                    }
                    .padding(.vertical, 8)
                }

                Section {
                    Button(action: saveChanges) {
                        Text("Save Changes")
                            .frame(maxWidth: .infinity)
                            .foregroundColor(.white)
                            .padding()
                            .background(themeManager.currentTheme.accentColor)
                            .cornerRadius(12)
                    }
                    .disabled(name.isEmpty)
                }
                .listRowBackground(Color.clear)
            }
            .navigationTitle("Edit Collection")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") { dismiss() }
                }
            }
        }
    }

    private func saveChanges() {
        collection.name = name
        collection.collectionDescription = description
        collection.theme = theme
        collection.color = selectedColor
        dismiss()
    }
}

// Helper extension for hex color
extension Color {
    init?(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            return nil
        }
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}

#Preview {
    CollectionsView()
        .environmentObject(ThemeManager())
        .modelContainer(for: [EntryCollection.self, JournalEntry.self])
}
