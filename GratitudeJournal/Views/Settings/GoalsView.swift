//
//  GoalsView.swift
//  GratitudeJournal
//
//  Manage gratitude goals and challenges
//

import SwiftUI
import SwiftData

struct GoalsView: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(\.modelContext) private var modelContext
    @EnvironmentObject var themeManager: ThemeManager

    @Query private var goals: [GratitudeGoal]
    @State private var showAddGoal = false

    private var activeGoals: [GratitudeGoal] {
        goals.filter { !$0.isCompleted }
    }

    private var completedGoals: [GratitudeGoal] {
        goals.filter { $0.isCompleted }
    }

    var body: some View {
        NavigationStack {
            List {
                if !activeGoals.isEmpty {
                    Section("Active Goals") {
                        ForEach(activeGoals) { goal in
                            GoalRowView(goal: goal)
                        }
                        .onDelete(perform: deleteGoals)
                    }
                }

                if !completedGoals.isEmpty {
                    Section("Completed") {
                        ForEach(completedGoals) { goal in
                            GoalRowView(goal: goal)
                        }
                        .onDelete(perform: deleteGoals)
                    }
                }

                if goals.isEmpty {
                    ContentUnavailableView(
                        "No Goals Yet",
                        systemImage: "target",
                        description: Text("Set a goal to stay motivated in your gratitude practice")
                    )
                }
            }
            .navigationTitle("Goals")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Done") {
                        dismiss()
                    }
                    .foregroundColor(themeManager.currentTheme.accentColor)
                }

                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: { showAddGoal = true }) {
                        Image(systemName: "plus")
                            .foregroundColor(themeManager.currentTheme.accentColor)
                    }
                }
            }
            .sheet(isPresented: $showAddGoal) {
                AddGoalView()
            }
        }
    }

    private func deleteGoals(at offsets: IndexSet) {
        for index in offsets {
            let goal = activeGoals.isEmpty ? completedGoals[index] : activeGoals[index]
            modelContext.delete(goal)
        }
    }
}

struct GoalRowView: View {
    @EnvironmentObject var themeManager: ThemeManager
    let goal: GratitudeGoal

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text(goal.title)
                        .font(.headline)
                        .foregroundColor(themeManager.currentTheme.textPrimary)

                    Text(goal.goalType.rawValue)
                        .font(.caption)
                        .foregroundColor(themeManager.currentTheme.textSecondary)
                }

                Spacer()

                if goal.isCompleted {
                    Image(systemName: "checkmark.circle.fill")
                        .foregroundColor(.green)
                } else {
                    Text("\(goal.progressPercentage)%")
                        .font(.headline)
                        .foregroundColor(themeManager.currentTheme.accentColor)
                }
            }

            if !goal.isCompleted {
                ProgressView(value: goal.progress)
                    .tint(themeManager.currentTheme.accentColor)

                Text("\(goal.currentValue) of \(goal.targetValue)")
                    .font(.caption)
                    .foregroundColor(themeManager.currentTheme.textSecondary)
            }
        }
        .padding(.vertical, 4)
    }
}

struct AddGoalView: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(\.modelContext) private var modelContext
    @EnvironmentObject var themeManager: ThemeManager

    @State private var title = ""
    @State private var goalDescription = ""
    @State private var goalType: GoalType = .weeklyEntries
    @State private var targetValue = 7

    var body: some View {
        NavigationStack {
            Form {
                Section("Goal Details") {
                    TextField("Title", text: $title)

                    Picker("Type", selection: $goalType) {
                        ForEach(GoalType.allCases, id: \.self) { type in
                            Text(type.rawValue).tag(type)
                        }
                    }

                    Stepper("Target: \(targetValue)", value: $targetValue, in: 1...365)
                }

                Section("Description") {
                    TextEditor(text: $goalDescription)
                        .frame(height: 100)
                }
            }
            .navigationTitle("New Goal")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                }

                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Save") {
                        saveGoal()
                    }
                    .fontWeight(.semibold)
                    .disabled(title.isEmpty)
                }
            }
        }
    }

    private func saveGoal() {
        let goal = GratitudeGoal(
            title: title,
            description: goalDescription.isEmpty ? "Gratitude goal" : goalDescription,
            goalType: goalType,
            targetValue: targetValue
        )

        modelContext.insert(goal)
        dismiss()
    }
}

#Preview {
    GoalsView()
        .environmentObject(ThemeManager())
        .modelContainer(for: [GratitudeGoal.self])
}
