//
//  ScavengerHuntView.swift
//  GratitudeJournal
//
//  Interactive gratitude scavenger hunts
//

import SwiftUI
import SwiftData

struct ScavengerHuntView: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(\.modelContext) private var modelContext
    @EnvironmentObject var themeManager: ThemeManager

    @Query private var hunts: [GratitudeScavengerHunt]
    @State private var selectedHunt: GratitudeScavengerHunt?
    @State private var showCreateHunt = false

    var body: some View {
        NavigationStack {
            ZStack {
                themeManager.currentTheme.backgroundColor
                    .ignoresSafeArea()

                if hunts.isEmpty {
                    emptyState
                } else {
                    ScrollView {
                        VStack(spacing: 24) {
                            // Active hunts
                            if !activeHunts.isEmpty {
                                sectionHeader(title: "Active Hunts", icon: "scope")

                                ForEach(activeHunts) { hunt in
                                    HuntCard(hunt: hunt) {
                                        selectedHunt = hunt
                                    }
                                }
                            }

                            // Completed hunts
                            if !completedHunts.isEmpty {
                                sectionHeader(title: "Completed", icon: "checkmark.circle")

                                ForEach(completedHunts) { hunt in
                                    HuntCard(hunt: hunt) {
                                        selectedHunt = hunt
                                    }
                                }
                            }
                        }
                        .padding()
                    }
                }
            }
            .navigationTitle("Scavenger Hunts")
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Done") { dismiss() }
                }

                ToolbarItem(placement: .navigationBarTrailing) {
                    Menu {
                        Button(action: { showCreateHunt = true }) {
                            Label("Create Custom Hunt", systemImage: "plus")
                        }

                        Button(action: createDefaultHunt) {
                            Label("Start Default Hunt", systemImage: "sparkles")
                        }
                    } label: {
                        Image(systemName: "ellipsis.circle")
                    }
                }
            }
            .sheet(isPresented: $showCreateHunt) {
                CreateHuntView()
            }
            .sheet(item: $selectedHunt) { hunt in
                HuntDetailView(hunt: hunt)
            }
        }
    }

    private var emptyState: some View {
        VStack(spacing: 20) {
            Text("🔍")
                .font(.system(size: 80))

            Text("Start a Gratitude Hunt")
                .font(.title2)
                .fontWeight(.semibold)

            Text("Find moments of gratitude in your daily life with fun, guided scavenger hunts")
                .font(.body)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 40)

            VStack(spacing: 12) {
                Button(action: createDefaultHunt) {
                    Text("Start Default Hunt")
                        .fontWeight(.semibold)
                        .foregroundColor(.white)
                        .frame(maxWidth: 200)
                        .padding()
                        .background(themeManager.currentTheme.accentColor)
                        .cornerRadius(12)
                }

                Button(action: { showCreateHunt = true }) {
                    Text("Create Custom Hunt")
                        .fontWeight(.medium)
                        .foregroundColor(themeManager.currentTheme.accentColor)
                }
            }
        }
    }

    private func sectionHeader(title: String, icon: String) -> some View {
        HStack {
            Image(systemName: icon)
                .foregroundColor(themeManager.currentTheme.accentColor)
            Text(title)
                .font(.title3)
                .fontWeight(.semibold)
                .foregroundColor(themeManager.currentTheme.textPrimary)
            Spacer()
        }
    }

    private var activeHunts: [GratitudeScavengerHunt] {
        hunts.filter { $0.isActive && $0.progress < 1.0 }
    }

    private var completedHunts: [GratitudeScavengerHunt] {
        hunts.filter { $0.progress >= 1.0 }
    }

    private func createDefaultHunt() {
        let defaultPrompts = [
            "Find something in nature that brings you peace",
            "Notice an act of kindness from a stranger",
            "Appreciate something you often take for granted",
            "Find beauty in something ordinary",
            "Recognize a personal strength you used today",
            "Notice something that made you smile",
            "Find gratitude in a challenge you're facing",
            "Appreciate a comfort or convenience in your life"
        ]

        let items = defaultPrompts.map { ScavengerItem(prompt: $0) }
        let hunt = GratitudeScavengerHunt(
            title: "Daily Gratitude Hunt",
            items: items
        )
        modelContext.insert(hunt)
        selectedHunt = hunt
    }
}

struct HuntCard: View {
    @EnvironmentObject var themeManager: ThemeManager
    let hunt: GratitudeScavengerHunt
    let action: () -> Void

    private var completedCount: Int {
        hunt.items.filter { $0.isFound }.count
    }

    var body: some View {
        Button(action: action) {
            VStack(alignment: .leading, spacing: 16) {
                HStack {
                    VStack(alignment: .leading, spacing: 4) {
                        Text(hunt.title)
                            .font(.title3)
                            .fontWeight(.semibold)
                            .foregroundColor(themeManager.currentTheme.textPrimary)

                        Text("\(completedCount) of \(hunt.items.count) found")
                            .font(.subheadline)
                            .foregroundColor(themeManager.currentTheme.textSecondary)
                    }

                    Spacer()

                    if hunt.progress >= 1.0 {
                        Image(systemName: "checkmark.circle.fill")
                            .font(.title2)
                            .foregroundColor(.green)
                    } else {
                        Image(systemName: "chevron.right")
                            .foregroundColor(themeManager.currentTheme.textSecondary)
                    }
                }

                // Progress bar
                GeometryReader { geometry in
                    ZStack(alignment: .leading) {
                        RoundedRectangle(cornerRadius: 4)
                            .fill(themeManager.currentTheme.textSecondary.opacity(0.2))
                            .frame(height: 8)

                        RoundedRectangle(cornerRadius: 4)
                            .fill(themeManager.currentTheme.accentColor)
                            .frame(width: geometry.size.width * hunt.progress, height: 8)
                    }
                }
                .frame(height: 8)

                HStack {
                    Text("\(Int(hunt.progress * 100))% complete")
                        .font(.caption)
                        .foregroundColor(themeManager.currentTheme.textSecondary)

                    Spacer()

                    Text(hunt.startDate.formatted(date: .abbreviated, time: .omitted))
                        .font(.caption)
                        .foregroundColor(themeManager.currentTheme.textSecondary)
                }
            }
            .padding()
            .background(themeManager.currentTheme.cardBackground)
            .cornerRadius(16)
            .shadow(color: .black.opacity(0.05), radius: 8, x: 0, y: 4)
        }
    }
}

struct HuntDetailView: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(\.modelContext) private var modelContext
    @EnvironmentObject var themeManager: ThemeManager

    @Bindable var hunt: GratitudeScavengerHunt
    @State private var selectedItemIndex: Int?
    @State private var showCompleteAlert = false

    var body: some View {
        NavigationStack {
            ZStack {
                themeManager.currentTheme.backgroundColor
                    .ignoresSafeArea()

                ScrollView {
                    VStack(spacing: 24) {
                        // Progress header
                        progressHeader

                        // Items list
                        VStack(spacing: 12) {
                            ForEach(Array(hunt.items.enumerated()), id: \.element.id) { index, item in
                                HuntItemRow(item: item, index: index + 1) {
                                    selectedItemIndex = index
                                }
                            }
                        }

                        // Complete hunt button
                        if hunt.progress >= 1.0 && hunt.isActive {
                            Button(action: { showCompleteAlert = true }) {
                                HStack {
                                    Image(systemName: "checkmark.circle.fill")
                                    Text("Complete Hunt")
                                }
                                .font(.headline)
                                .foregroundColor(.white)
                                .frame(maxWidth: .infinity)
                                .padding()
                                .background(Color.green)
                                .cornerRadius(12)
                            }
                        }
                    }
                    .padding()
                }
            }
            .navigationTitle(hunt.title)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") { dismiss() }
                }
            }
            .sheet(item: Binding(
                get: { selectedItemIndex.map { hunt.items[$0] } },
                set: { _ in selectedItemIndex = nil }
            )) { _ in
                if let index = selectedItemIndex {
                    MarkItemFoundView(hunt: hunt, itemIndex: index)
                }
            }
            .alert("Complete Hunt?", isPresented: $showCompleteAlert) {
                Button("Complete") { completeHunt() }
                Button("Cancel", role: .cancel) { }
            } message: {
                Text("Congratulations on completing this gratitude scavenger hunt! This will mark the hunt as complete.")
            }
        }
    }

    private var progressHeader: some View {
        VStack(spacing: 16) {
            // Progress circle
            ZStack {
                Circle()
                    .stroke(themeManager.currentTheme.textSecondary.opacity(0.2), lineWidth: 12)
                    .frame(width: 120, height: 120)

                Circle()
                    .trim(from: 0, to: hunt.progress)
                    .stroke(themeManager.currentTheme.accentColor, style: StrokeStyle(lineWidth: 12, lineCap: .round))
                    .frame(width: 120, height: 120)
                    .rotationEffect(.degrees(-90))

                VStack(spacing: 4) {
                    Text("\(Int(hunt.progress * 100))%")
                        .font(.title2)
                        .fontWeight(.bold)
                        .foregroundColor(themeManager.currentTheme.textPrimary)

                    Text("\(hunt.items.filter { $0.isFound }.count)/\(hunt.items.count)")
                        .font(.caption)
                        .foregroundColor(themeManager.currentTheme.textSecondary)
                }
            }

            if hunt.progress >= 1.0 {
                Text("🎉 Hunt Complete!")
                    .font(.headline)
                    .foregroundColor(.green)
            }
        }
        .padding()
        .frame(maxWidth: .infinity)
        .background(themeManager.currentTheme.cardBackground)
        .cornerRadius(16)
    }

    private func completeHunt() {
        hunt.isActive = false
        hunt.endDate = Date()
    }
}

struct HuntItemRow: View {
    @EnvironmentObject var themeManager: ThemeManager
    let item: ScavengerItem
    let index: Int
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 16) {
                // Number badge
                ZStack {
                    Circle()
                        .fill(item.isFound ? Color.green : themeManager.currentTheme.textSecondary.opacity(0.2))
                        .frame(width: 40, height: 40)

                    if item.isFound {
                        Image(systemName: "checkmark")
                            .foregroundColor(.white)
                            .fontWeight(.bold)
                    } else {
                        Text("\(index)")
                            .font(.headline)
                            .foregroundColor(themeManager.currentTheme.textPrimary)
                    }
                }

                VStack(alignment: .leading, spacing: 4) {
                    Text(item.prompt)
                        .font(.body)
                        .foregroundColor(themeManager.currentTheme.textPrimary)
                        .strikethrough(item.isFound)

                    if let note = item.note, !note.isEmpty {
                        Text(note)
                            .font(.caption)
                            .foregroundColor(themeManager.currentTheme.textSecondary)
                            .lineLimit(2)
                    }

                    if let foundDate = item.foundDate {
                        Text("Found \(foundDate.formatted(date: .abbreviated, time: .omitted))")
                            .font(.caption)
                            .foregroundColor(.green)
                    }
                }

                Spacer()

                if !item.isFound {
                    Image(systemName: "chevron.right")
                        .foregroundColor(themeManager.currentTheme.textSecondary)
                        .font(.caption)
                }
            }
            .padding()
            .background(themeManager.currentTheme.cardBackground)
            .cornerRadius(12)
        }
        .disabled(item.isFound)
    }
}

struct MarkItemFoundView: View {
    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject var themeManager: ThemeManager

    @Bindable var hunt: GratitudeScavengerHunt
    let itemIndex: Int

    @State private var note = ""

    var body: some View {
        NavigationStack {
            ZStack {
                themeManager.currentTheme.backgroundColor
                    .ignoresSafeArea()

                VStack(spacing: 24) {
                    Text("🎯")
                        .font(.system(size: 80))

                    Text(hunt.items[itemIndex].prompt)
                        .font(.title3)
                        .fontWeight(.semibold)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal)

                    VStack(alignment: .leading, spacing: 8) {
                        Text("Add a Note (Optional)")
                            .font(.subheadline)
                            .foregroundColor(themeManager.currentTheme.textSecondary)

                        TextEditor(text: $note)
                            .frame(height: 120)
                            .padding(8)
                            .background(themeManager.currentTheme.cardBackground)
                            .cornerRadius(8)
                    }
                    .padding(.horizontal)

                    Spacer()

                    Button(action: markAsFound) {
                        Text("Mark as Found")
                            .fontWeight(.semibold)
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color.green)
                            .cornerRadius(12)
                    }
                    .padding(.horizontal)
                }
                .padding(.vertical, 40)
            }
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") { dismiss() }
                }
            }
        }
    }

    private func markAsFound() {
        hunt.items[itemIndex].markFound(note: note.isEmpty ? nil : note)
        dismiss()
    }
}

struct CreateHuntView: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(\.modelContext) private var modelContext
    @EnvironmentObject var themeManager: ThemeManager

    @State private var title = ""
    @State private var prompts: [String] = ["", "", "", ""]

    var body: some View {
        NavigationStack {
            Form {
                Section("Hunt Title") {
                    TextField("Title", text: $title)
                }

                Section("Prompts") {
                    ForEach(prompts.indices, id: \.self) { index in
                        HStack {
                            Text("\(index + 1).")
                                .foregroundColor(themeManager.currentTheme.textSecondary)
                            TextField("What to find...", text: $prompts[index])
                        }
                    }

                    Button(action: addPrompt) {
                        Label("Add Prompt", systemImage: "plus.circle")
                    }
                }

                Section {
                    Button(action: createHunt) {
                        Text("Create Hunt")
                            .frame(maxWidth: .infinity)
                            .foregroundColor(.white)
                            .padding()
                            .background(themeManager.currentTheme.accentColor)
                            .cornerRadius(12)
                    }
                    .disabled(!isValid)
                }
                .listRowBackground(Color.clear)
            }
            .navigationTitle("New Hunt")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") { dismiss() }
                }
            }
        }
    }

    private var isValid: Bool {
        !title.isEmpty && prompts.filter { !$0.isEmpty }.count >= 3
    }

    private func addPrompt() {
        prompts.append("")
    }

    private func createHunt() {
        let validPrompts = prompts.filter { !$0.isEmpty }
        let items = validPrompts.map { ScavengerItem(prompt: $0) }
        let hunt = GratitudeScavengerHunt(title: title, items: items)
        modelContext.insert(hunt)
        dismiss()
    }
}

#Preview {
    ScavengerHuntView()
        .environmentObject(ThemeManager())
        .modelContainer(for: [GratitudeScavengerHunt.self])
}
