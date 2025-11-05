//
//  GratitudeJarView.swift
//  GratitudeJournal
//
//  Virtual gratitude jar with notes
//

import SwiftUI
import SwiftData

struct GratitudeJarView: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(\.modelContext) private var modelContext
    @EnvironmentObject var themeManager: ThemeManager

    @Query private var jars: [GratitudeJar]
    @State private var showAddNote = false
    @State private var newNoteText = ""
    @State private var selectedJar: GratitudeJar?
    @State private var showRandomNote = false
    @State private var randomNote: JarNote?

    var body: some View {
        NavigationStack {
            ZStack {
                themeManager.currentTheme.backgroundColor
                    .ignoresSafeArea()

                if jars.isEmpty {
                    emptyState
                } else {
                    ScrollView {
                        VStack(spacing: 24) {
                            ForEach(jars) { jar in
                                JarCard(jar: jar) {
                                    selectedJar = jar
                                }
                            }
                        }
                        .padding()
                    }
                }
            }
            .navigationTitle("Gratitude Jar")
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Done") { dismiss() }
                }

                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: createJar) {
                        Image(systemName: "plus")
                    }
                }
            }
            .sheet(item: $selectedJar) { jar in
                JarDetailView(jar: jar)
            }
        }
    }

    private var emptyState: some View {
        VStack(spacing: 20) {
            Text("🏺")
                .font(.system(size: 80))

            Text("Create Your Gratitude Jar")
                .font(.title2)
                .fontWeight(.semibold)

            Text("Add grateful moments throughout the day and revisit them whenever you need a boost")
                .font(.body)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 40)

            Button(action: createJar) {
                Text("Create Jar")
                    .fontWeight(.semibold)
                    .foregroundColor(.white)
                    .frame(maxWidth: 200)
                    .padding()
                    .background(themeManager.currentTheme.accentColor)
                    .cornerRadius(12)
            }
        }
    }

    private func createJar() {
        let jar = GratitudeJar(name: "My Gratitude Jar", type: .personal)
        modelContext.insert(jar)
        selectedJar = jar
    }
}

struct JarCard: View {
    @EnvironmentObject var themeManager: ThemeManager
    let jar: GratitudeJar
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack {
                Text("🏺")
                    .font(.system(size: 50))

                VStack(alignment: .leading, spacing: 8) {
                    Text(jar.name)
                        .font(.title3)
                        .fontWeight(.semibold)
                        .foregroundColor(themeManager.currentTheme.textPrimary)

                    Text("\(jar.noteCount) grateful moments")
                        .font(.subheadline)
                        .foregroundColor(themeManager.currentTheme.textSecondary)

                    Text(jar.type.rawValue)
                        .font(.caption)
                        .foregroundColor(themeManager.currentTheme.accentColor)
                }

                Spacer()

                Image(systemName: "chevron.right")
                    .foregroundColor(themeManager.currentTheme.textSecondary)
            }
            .padding()
            .background(themeManager.currentTheme.cardBackground)
            .cornerRadius(16)
            .shadow(color: .black.opacity(0.05), radius: 8, x: 0, y: 4)
        }
    }
}

struct JarDetailView: View {
    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject var themeManager: ThemeManager

    @Bindable var jar: GratitudeJar
    @State private var newNoteText = ""
    @State private var showRandomNote = false
    @State private var randomNote: JarNote?

    var body: some View {
        NavigationStack {
            VStack(spacing: 20) {
                // Jar visualization
                Text("🏺")
                    .font(.system(size: 100))
                    .padding()

                Text("\(jar.noteCount) Notes")
                    .font(.title2)
                    .fontWeight(.semibold)

                // Add note field
                HStack {
                    TextField("Add a grateful moment...", text: $newNoteText)
                        .textFieldStyle(.roundedBorder)

                    Button(action: addNote) {
                        Image(systemName: "plus.circle.fill")
                            .font(.title2)
                            .foregroundColor(themeManager.currentTheme.accentColor)
                    }
                    .disabled(newNoteText.isEmpty)
                }
                .padding(.horizontal)

                // Random note button
                Button(action: pullRandomNote) {
                    HStack {
                        Image(systemName: "sparkles")
                        Text("Pull a Random Note")
                    }
                    .font(.headline)
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(themeManager.currentTheme.accentColor)
                    .cornerRadius(12)
                }
                .padding(.horizontal)
                .disabled(jar.notes.isEmpty)

                // Notes list
                if !jar.notes.isEmpty {
                    List {
                        ForEach(jar.notes.sorted(by: { $0.date > $1.date }), id: \.id) { note in
                            VStack(alignment: .leading, spacing: 4) {
                                Text(note.content)
                                    .font(.body)

                                Text(note.date.formatted(date: .abbreviated, time: .omitted))
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                            }
                            .padding(.vertical, 4)
                        }
                    }
                }

                Spacer()
            }
            .navigationTitle(jar.name)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") { dismiss() }
                }
            }
            .alert("Grateful Moment", isPresented: $showRandomNote) {
                Button("OK") { }
            } message: {
                if let note = randomNote {
                    Text(note.content)
                }
            }
        }
    }

    private func addNote() {
        jar.addNote(newNoteText)
        newNoteText = ""
    }

    private func pullRandomNote() {
        randomNote = jar.notes.randomElement()
        showRandomNote = true
    }
}

#Preview {
    GratitudeJarView()
        .environmentObject(ThemeManager())
        .modelContainer(for: [GratitudeJar.self])
}
