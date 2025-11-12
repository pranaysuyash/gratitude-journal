//
//  AffirmationsView.swift
//  GratitudeJournal
//
//  Display and manage gratitude affirmations
//

import SwiftUI
import SwiftData

struct AffirmationsView: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(\.modelContext) private var modelContext
    @EnvironmentObject var themeManager: ThemeManager

    @Query private var affirmations: [GratitudeAffirmation]
    @Query private var entries: [JournalEntry]

    @State private var selectedCategory: String = "All"
    @State private var showAddAffirmation = false
    @State private var showDailyAffirmation = false
    @State private var dailyAffirmation: GratitudeAffirmation?

    var body: some View {
        NavigationStack {
            ZStack {
                themeManager.currentTheme.backgroundColor
                    .ignoresSafeArea()

                ScrollView {
                    VStack(spacing: 24) {
                        // Daily Affirmation Card
                        dailyAffirmationCard

                        // Category Filter
                        categoryPicker

                        // Affirmations Grid
                        if filteredAffirmations.isEmpty {
                            emptyState
                        } else {
                            affirmationsList
                        }
                    }
                    .padding()
                }
            }
            .navigationTitle("Affirmations")
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Done") { dismiss() }
                }

                ToolbarItem(placement: .navigationBarTrailing) {
                    Menu {
                        Button(action: { showAddAffirmation = true }) {
                            Label("Create Custom", systemImage: "plus")
                        }

                        Button(action: generateFromEntries) {
                            Label("Generate from Entries", systemImage: "sparkles")
                        }
                    } label: {
                        Image(systemName: "ellipsis.circle")
                    }
                }
            }
            .sheet(isPresented: $showAddAffirmation) {
                CreateAffirmationView()
            }
            .sheet(isPresented: $showDailyAffirmation) {
                if let affirmation = dailyAffirmation {
                    DailyAffirmationSheet(affirmation: affirmation)
                }
            }
            .onAppear {
                if affirmations.isEmpty && !entries.isEmpty {
                    generateFromEntries()
                }
            }
        }
    }

    private var dailyAffirmationCard: some View {
        Button(action: showTodaysAffirmation) {
            VStack(spacing: 16) {
                HStack {
                    Image(systemName: "sparkles")
                        .font(.title2)
                        .foregroundColor(.orange)

                    Text("Daily Affirmation")
                        .font(.headline)
                        .foregroundColor(themeManager.currentTheme.textPrimary)

                    Spacer()

                    Image(systemName: "chevron.right")
                        .foregroundColor(themeManager.currentTheme.textSecondary)
                }

                if let todaysAffirmation = getTodaysAffirmation() {
                    Text(todaysAffirmation.text)
                        .font(.body)
                        .foregroundColor(themeManager.currentTheme.textSecondary)
                        .multilineTextAlignment(.center)
                        .lineLimit(3)
                        .padding()
                        .frame(maxWidth: .infinity)
                        .background(themeManager.currentTheme.accentColor.opacity(0.1))
                        .cornerRadius(12)
                } else {
                    Text("Tap to reveal your daily affirmation")
                        .font(.body)
                        .foregroundColor(themeManager.currentTheme.textSecondary)
                        .italic()
                }
            }
            .padding()
            .background(themeManager.currentTheme.cardBackground)
            .cornerRadius(16)
            .shadow(color: .black.opacity(0.05), radius: 8, x: 0, y: 4)
        }
        .buttonStyle(.plain)
    }

    private var categoryPicker: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 12) {
                ForEach(categories, id: \.self) { category in
                    Button(action: { selectedCategory = category }) {
                        Text(category)
                            .font(.subheadline)
                            .fontWeight(.medium)
                            .padding(.horizontal, 16)
                            .padding(.vertical, 8)
                            .background(selectedCategory == category ? themeManager.currentTheme.accentColor : themeManager.currentTheme.cardBackground)
                            .foregroundColor(selectedCategory == category ? .white : themeManager.currentTheme.textPrimary)
                            .cornerRadius(20)
                    }
                }
            }
        }
    }

    private var affirmationsList: some View {
        LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 16) {
            ForEach(filteredAffirmations) { affirmation in
                AffirmationCard(affirmation: affirmation)
            }
        }
    }

    private var emptyState: some View {
        VStack(spacing: 16) {
            Image(systemName: "sparkles")
                .font(.system(size: 60))
                .foregroundColor(themeManager.currentTheme.textSecondary)

            Text("No affirmations yet")
                .font(.headline)

            Text("Create custom affirmations or generate them from your gratitude entries")
                .font(.subheadline)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)

            Button(action: generateFromEntries) {
                Text("Generate Now")
                    .foregroundColor(.white)
                    .padding(.horizontal, 24)
                    .padding(.vertical, 12)
                    .background(themeManager.currentTheme.accentColor)
                    .cornerRadius(10)
            }
        }
        .padding(40)
    }

    private var categories: [String] {
        var cats = Set(affirmations.map { $0.category })
        cats.insert("All")
        return Array(cats).sorted()
    }

    private var filteredAffirmations: [GratitudeAffirmation] {
        if selectedCategory == "All" {
            return affirmations.sorted(by: { $0.createdDate > $1.createdDate })
        }
        return affirmations.filter { $0.category == selectedCategory }.sorted(by: { $0.createdDate > $1.createdDate })
    }

    private func getTodaysAffirmation() -> GratitudeAffirmation? {
        guard !affirmations.isEmpty else { return nil }
        let dayOfYear = Calendar.current.ordinality(of: .day, in: .year, for: Date()) ?? 0
        let index = dayOfYear % affirmations.count
        return Array(affirmations)[index]
    }

    private func showTodaysAffirmation() {
        dailyAffirmation = getTodaysAffirmation()
        showDailyAffirmation = true
    }

    private func generateFromEntries() {
        // Generate affirmations from recent entries
        let recentEntries = entries.sorted(by: { $0.date > $1.date }).prefix(10)
        for entry in recentEntries {
            let affirmation = GratitudeAffirmation.generateFromEntry(entry)
            modelContext.insert(affirmation)
        }
    }
}

struct AffirmationCard: View {
    @Environment(\.modelContext) private var modelContext
    @EnvironmentObject var themeManager: ThemeManager

    @Bindable var affirmation: GratitudeAffirmation
    @State private var showFullText = false

    var body: some View {
        Button(action: { showFullText = true }) {
            VStack(spacing: 12) {
                HStack {
                    Image(systemName: affirmation.isFavorite ? "star.fill" : "star")
                        .foregroundColor(.yellow)
                        .font(.caption)

                    Spacer()

                    Text(affirmation.category)
                        .font(.caption2)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                        .background(themeManager.currentTheme.accentColor.opacity(0.2))
                        .foregroundColor(themeManager.currentTheme.accentColor)
                        .cornerRadius(6)
                }

                Text(affirmation.text)
                    .font(.body)
                    .foregroundColor(themeManager.currentTheme.textPrimary)
                    .multilineTextAlignment(.center)
                    .lineLimit(4)
                    .frame(maxWidth: .infinity, alignment: .center)

                Spacer()
            }
            .padding()
            .frame(height: 180)
            .background(themeManager.currentTheme.cardBackground)
            .cornerRadius(16)
            .shadow(color: .black.opacity(0.05), radius: 4, x: 0, y: 2)
        }
        .buttonStyle(.plain)
        .contextMenu {
            Button(action: { affirmation.isFavorite.toggle() }) {
                Label(affirmation.isFavorite ? "Unfavorite" : "Favorite", systemImage: affirmation.isFavorite ? "star.slash" : "star")
            }

            Button(action: { /* Share action */ }) {
                Label("Share", systemImage: "square.and.arrow.up")
            }

            Button(role: .destructive, action: { modelContext.delete(affirmation) }) {
                Label("Delete", systemImage: "trash")
            }
        }
        .sheet(isPresented: $showFullText) {
            AffirmationDetailSheet(affirmation: affirmation)
        }
    }
}

struct CreateAffirmationView: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(\.modelContext) private var modelContext
    @EnvironmentObject var themeManager: ThemeManager

    @State private var text = ""
    @State private var category = "General"

    let categories = ["General", "Self-Love", "Gratitude", "Growth", "Peace", "Joy", "Strength"]

    var body: some View {
        NavigationStack {
            Form {
                Section("Affirmation Text") {
                    TextEditor(text: $text)
                        .frame(minHeight: 120)
                }

                Section("Category") {
                    Picker("Category", selection: $category) {
                        ForEach(categories, id: \.self) { cat in
                            Text(cat).tag(cat)
                        }
                    }
                }

                Section {
                    Button(action: createAffirmation) {
                        Text("Create Affirmation")
                            .frame(maxWidth: .infinity)
                            .foregroundColor(.white)
                            .padding()
                            .background(themeManager.currentTheme.accentColor)
                            .cornerRadius(12)
                    }
                    .disabled(text.isEmpty)
                }
                .listRowBackground(Color.clear)
            }
            .navigationTitle("New Affirmation")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") { dismiss() }
                }
            }
        }
    }

    private func createAffirmation() {
        let affirmation = GratitudeAffirmation(text: text, category: category)
        modelContext.insert(affirmation)
        dismiss()
    }
}

struct DailyAffirmationSheet: View {
    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject var themeManager: ThemeManager

    let affirmation: GratitudeAffirmation

    var body: some View {
        NavigationStack {
            ZStack {
                LinearGradient(
                    colors: [
                        themeManager.currentTheme.accentColor.opacity(0.3),
                        themeManager.currentTheme.backgroundColor
                    ],
                    startPoint: .top,
                    endPoint: .bottom
                )
                .ignoresSafeArea()

                VStack(spacing: 32) {
                    Spacer()

                    Image(systemName: "sparkles")
                        .font(.system(size: 60))
                        .foregroundColor(themeManager.currentTheme.accentColor)

                    VStack(spacing: 16) {
                        Text("Today's Affirmation")
                            .font(.title3)
                            .fontWeight(.semibold)
                            .foregroundColor(themeManager.currentTheme.textSecondary)

                        Text(affirmation.text)
                            .font(.title2)
                            .fontWeight(.medium)
                            .foregroundColor(themeManager.currentTheme.textPrimary)
                            .multilineTextAlignment(.center)
                            .padding(.horizontal, 32)
                    }

                    Spacer()

                    Button(action: { dismiss() }) {
                        Text("Close")
                            .fontWeight(.semibold)
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(themeManager.currentTheme.accentColor)
                            .cornerRadius(12)
                    }
                    .padding(.horizontal, 32)
                }
                .padding(.vertical, 40)
            }
            .navigationBarTitleDisplayMode(.inline)
        }
    }
}

struct AffirmationDetailSheet: View {
    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject var themeManager: ThemeManager

    @Bindable var affirmation: GratitudeAffirmation

    var body: some View {
        NavigationStack {
            ZStack {
                themeManager.currentTheme.backgroundColor
                    .ignoresSafeArea()

                VStack(spacing: 24) {
                    Image(systemName: "sparkles")
                        .font(.system(size: 50))
                        .foregroundColor(themeManager.currentTheme.accentColor)

                    Text(affirmation.text)
                        .font(.title3)
                        .fontWeight(.medium)
                        .foregroundColor(themeManager.currentTheme.textPrimary)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, 32)

                    VStack(spacing: 12) {
                        HStack {
                            Text("Category")
                                .font(.subheadline)
                                .foregroundColor(themeManager.currentTheme.textSecondary)
                            Spacer()
                            Text(affirmation.category)
                                .font(.subheadline)
                                .fontWeight(.medium)
                        }

                        HStack {
                            Text("Created")
                                .font(.subheadline)
                                .foregroundColor(themeManager.currentTheme.textSecondary)
                            Spacer()
                            Text(affirmation.createdDate.formatted(date: .abbreviated, time: .omitted))
                                .font(.subheadline)
                                .fontWeight(.medium)
                        }
                    }
                    .padding()
                    .background(themeManager.currentTheme.cardBackground)
                    .cornerRadius(12)
                    .padding(.horizontal)

                    Button(action: { affirmation.isFavorite.toggle() }) {
                        HStack {
                            Image(systemName: affirmation.isFavorite ? "star.fill" : "star")
                            Text(affirmation.isFavorite ? "Remove from Favorites" : "Add to Favorites")
                        }
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.yellow)
                        .cornerRadius(12)
                    }
                    .padding(.horizontal)

                    Spacer()
                }
                .padding(.top, 40)
            }
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") { dismiss() }
                }
            }
        }
    }
}

#Preview {
    AffirmationsView()
        .environmentObject(ThemeManager())
        .modelContainer(for: [GratitudeAffirmation.self, JournalEntry.self])
}
