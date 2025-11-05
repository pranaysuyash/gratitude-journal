//
//  TimeCapsuleView.swift
//  GratitudeJournal
//
//  Time capsule entries that unlock after a specified date
//

import SwiftUI
import SwiftData

struct TimeCapsuleView: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(\.modelContext) private var modelContext
    @EnvironmentObject var themeManager: ThemeManager

    @Query private var capsules: [TimeCapsule]
    @State private var showCreateCapsule = false

    private var lockedCapsules: [TimeCapsule] {
        capsules.filter { !$0.isUnlocked && !$0.isReady }
    }

    private var readyToUnlock: [TimeCapsule] {
        capsules.filter { $0.isReady && !$0.isUnlocked }
    }

    private var unlockedCapsules: [TimeCapsule] {
        capsules.filter { $0.isUnlocked }
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 24) {
                    // Header
                    VStack(spacing: 12) {
                        Text("⏳")
                            .font(.system(size: 60))

                        Text("Time Capsules")
                            .font(.title)
                            .fontWeight(.bold)

                        Text("Create messages to your future self")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                    }
                    .padding()

                    // Ready to unlock
                    if !readyToUnlock.isEmpty {
                        VStack(alignment: .leading, spacing: 12) {
                            Text("Ready to Unlock! 🎉")
                                .font(.headline)
                                .padding(.horizontal)

                            ForEach(readyToUnlock) { capsule in
                                CapsuleCard(capsule: capsule, isReady: true) {
                                    unlockCapsule(capsule)
                                }
                            }
                        }
                    }

                    // Locked capsules
                    if !lockedCapsules.isEmpty {
                        VStack(alignment: .leading, spacing: 12) {
                            Text("Locked")
                                .font(.headline)
                                .padding(.horizontal)

                            ForEach(lockedCapsules) { capsule in
                                CapsuleCard(capsule: capsule, isReady: false)
                            }
                        }
                    }

                    // Unlocked capsules
                    if !unlockedCapsules.isEmpty {
                        VStack(alignment: .leading, spacing: 12) {
                            Text("Opened")
                                .font(.headline)
                                .padding(.horizontal)

                            ForEach(unlockedCapsules) { capsule in
                                CapsuleCard(capsule: capsule, isReady: false)
                            }
                        }
                    }

                    if capsules.isEmpty {
                        emptyState
                    }
                }
                .padding()
            }
            .background(themeManager.currentTheme.backgroundColor.ignoresSafeArea())
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Done") { dismiss() }
                }

                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: { showCreateCapsule = true }) {
                        Image(systemName: "plus")
                    }
                }
            }
            .sheet(isPresented: $showCreateCapsule) {
                CreateTimeCapsuleView()
            }
        }
    }

    private var emptyState: some View {
        VStack(spacing: 20) {
            Text("Create your first time capsule")
                .font(.title3)
                .fontWeight(.semibold)

            Text("Write a message to your future self and lock it until a future date")
                .font(.body)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 40)

            Button(action: { showCreateCapsule = true }) {
                Text("Create Time Capsule")
                    .fontWeight(.semibold)
                    .foregroundColor(.white)
                    .frame(maxWidth: 250)
                    .padding()
                    .background(themeManager.currentTheme.accentColor)
                    .cornerRadius(12)
            }
        }
        .padding()
    }

    private func unlockCapsule(_ capsule: TimeCapsule) {
        capsule.unlock()
    }
}

struct CapsuleCard: View {
    @EnvironmentObject var themeManager: ThemeManager
    let capsule: TimeCapsule
    let isReady: Bool
    var unlockAction: (() -> Void)?

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                if capsule.isUnlocked {
                    Text("📬")
                        .font(.system(size: 40))
                } else if isReady {
                    Text("✨")
                        .font(.system(size: 40))
                } else {
                    Text("🔒")
                        .font(.system(size: 40))
                }

                VStack(alignment: .leading, spacing: 4) {
                    Text(capsule.title)
                        .font(.headline)

                    if capsule.isUnlocked {
                        Text("Opened \(capsule.unlockedDate?.formatted(date: .abbreviated, time: .omitted) ?? "")")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    } else if isReady {
                        Text("Ready to unlock!")
                            .font(.caption)
                            .foregroundColor(.green)
                    } else {
                        Text("Unlocks in \(capsule.daysUntilUnlock) days")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }

                Spacer()
            }

            if capsule.isUnlocked {
                Text(capsule.message)
                    .font(.body)
                    .foregroundColor(themeManager.currentTheme.textPrimary)
                    .padding()
                    .background(themeManager.currentTheme.primaryColor.opacity(0.1))
                    .cornerRadius(8)

                if let future = capsule.futureMessage {
                    Text(future)
                        .font(.subheadline)
                        .italic()
                        .foregroundColor(themeManager.currentTheme.textSecondary)
                        .padding()
                        .background(themeManager.currentTheme.secondaryColor.opacity(0.1))
                        .cornerRadius(8)
                }
            }

            if isReady && !capsule.isUnlocked {
                Button(action: { unlockAction?() }) {
                    HStack {
                        Spacer()
                        Image(systemName: "lock.open.fill")
                        Text("Unlock Now")
                        Spacer()
                    }
                    .font(.headline)
                    .foregroundColor(.white)
                    .padding()
                    .background(themeManager.currentTheme.accentColor)
                    .cornerRadius(12)
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

struct CreateTimeCapsuleView: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(\.modelContext) private var modelContext
    @EnvironmentObject var themeManager: ThemeManager

    @State private var title = ""
    @State private var message = ""
    @State private var futureMessage = ""
    @State private var unlockDate = Calendar.current.date(byAdding: .year, value: 1, to: Date()) ?? Date()

    var body: some View {
        NavigationStack {
            Form {
                Section("Time Capsule Details") {
                    TextField("Title", text: $title)

                    DatePicker("Unlock Date", selection: $unlockDate, in: Date()..., displayedComponents: .date)
                }

                Section("Message to Future Self") {
                    TextEditor(text: $message)
                        .frame(height: 150)
                }

                Section("What do you hope to achieve by then?") {
                    TextEditor(text: $futureMessage)
                        .frame(height: 100)
                }
            }
            .navigationTitle("New Time Capsule")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") { dismiss() }
                }

                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Create") {
                        createCapsule()
                    }
                    .disabled(title.isEmpty || message.isEmpty)
                }
            }
        }
    }

    private func createCapsule() {
        // Create a journal entry first (required for TimeCapsule)
        let entry = JournalEntry(content: message, isDraft: false)
        modelContext.insert(entry)

        let capsule = TimeCapsule(
            entryID: entry.id,
            unlockDate: unlockDate,
            title: title,
            message: message
        )
        capsule.futureMessage = futureMessage.isEmpty ? nil : futureMessage

        modelContext.insert(capsule)
        dismiss()
    }
}

#Preview {
    TimeCapsuleView()
        .environmentObject(ThemeManager())
        .modelContainer(for: [TimeCapsule.self, JournalEntry.self])
}
