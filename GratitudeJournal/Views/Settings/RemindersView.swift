//
//  RemindersView.swift
//  GratitudeJournal
//
//  Manage gratitude reminders and notifications
//

import SwiftUI
import SwiftData

struct RemindersView: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(\.modelContext) private var modelContext
    @EnvironmentObject var themeManager: ThemeManager
    @EnvironmentObject var notificationManager: NotificationManager

    @Query private var reminders: [Reminder]
    @State private var showAddReminder = false

    var body: some View {
        NavigationStack {
            List {
                if reminders.isEmpty {
                    ContentUnavailableView(
                        "No Reminders",
                        systemImage: "bell.slash",
                        description: Text("Add a reminder to help you stay consistent with your gratitude practice")
                    )
                } else {
                    ForEach(reminders) { reminder in
                        ReminderRow(reminder: reminder)
                    }
                    .onDelete(perform: deleteReminders)
                }
            }
            .navigationTitle("Reminders")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Done") {
                        dismiss()
                    }
                    .foregroundColor(themeManager.currentTheme.accentColor)
                }

                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: { showAddReminder = true }) {
                        Image(systemName: "plus")
                            .foregroundColor(themeManager.currentTheme.accentColor)
                    }
                }
            }
            .sheet(isPresented: $showAddReminder) {
                AddReminderView()
            }
        }
    }

    private func deleteReminders(at offsets: IndexSet) {
        for index in offsets {
            let reminder = reminders[index]
            notificationManager.cancelReminder(reminder)
            modelContext.delete(reminder)
        }
    }
}

struct ReminderRow: View {
    @EnvironmentObject var themeManager: ThemeManager
    @EnvironmentObject var notificationManager: NotificationManager
    let reminder: Reminder

    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text(reminder.title)
                    .font(.headline)
                    .foregroundColor(themeManager.currentTheme.textPrimary)

                Text(reminder.time.formatted(date: .omitted, time: .shortened))
                    .font(.subheadline)
                    .foregroundColor(themeManager.currentTheme.textSecondary)

                Text(reminder.repeatType.rawValue)
                    .font(.caption)
                    .foregroundColor(themeManager.currentTheme.textSecondary)
            }

            Spacer()

            Toggle("", isOn: Binding(
                get: { reminder.isEnabled },
                set: { newValue in
                    reminder.isEnabled = newValue
                    if newValue {
                        notificationManager.scheduleReminder(reminder)
                    } else {
                        notificationManager.cancelReminder(reminder)
                    }
                }
            ))
            .tint(themeManager.currentTheme.accentColor)
        }
    }
}

struct AddReminderView: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(\.modelContext) private var modelContext
    @EnvironmentObject var themeManager: ThemeManager
    @EnvironmentObject var notificationManager: NotificationManager

    @State private var title = "Daily Gratitude Reminder"
    @State private var time = Date()
    @State private var repeatType: RepeatType = .daily

    var body: some View {
        NavigationStack {
            Form {
                Section("Reminder Details") {
                    TextField("Title", text: $title)

                    DatePicker("Time", selection: $time, displayedComponents: .hourAndMinute)

                    Picker("Repeat", selection: $repeatType) {
                        ForEach(RepeatType.allCases, id: \.self) { type in
                            Text(type.rawValue).tag(type)
                        }
                    }
                }
            }
            .navigationTitle("New Reminder")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                }

                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Save") {
                        saveReminder()
                    }
                    .fontWeight(.semibold)
                }
            }
        }
    }

    private func saveReminder() {
        let reminder = Reminder(
            title: title,
            body: "Take a moment to write what you're grateful for today",
            time: time,
            repeatType: repeatType
        )

        modelContext.insert(reminder)
        notificationManager.scheduleReminder(reminder)

        dismiss()
    }
}

#Preview {
    RemindersView()
        .environmentObject(ThemeManager())
        .environmentObject(NotificationManager())
        .modelContainer(for: [Reminder.self])
}
