//
//  TemplateSelectionView.swift
//  GratitudeJournal
//
//  Select and use writing templates
//

import SwiftUI
import SwiftData

struct TemplateSelectionView: View {
    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject var themeManager: ThemeManager

    @Binding var selectedTemplate: WritingTemplate?

    @State private var selectedDifficulty: DifficultyLevel?
    @State private var selectedType: TemplateType?

    private let templates = WritingTemplate.defaultTemplates

    private var filteredTemplates: [WritingTemplate] {
        templates.filter { template in
            let difficultyMatch = selectedDifficulty == nil || template.difficultyLevel == selectedDifficulty
            let typeMatch = selectedType == nil || template.type == selectedType
            return difficultyMatch && typeMatch && template.isUnlocked
        }
    }

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                // Filters
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 12) {
                        FilterChipButton(
                            title: "All",
                            isSelected: selectedDifficulty == nil && selectedType == nil
                        ) {
                            selectedDifficulty = nil
                            selectedType = nil
                        }

                        Divider().frame(height: 20)

                        ForEach(DifficultyLevel.allCases, id: \.self) { difficulty in
                            FilterChipButton(
                                title: difficulty.rawValue,
                                isSelected: selectedDifficulty == difficulty
                            ) {
                                selectedDifficulty = difficulty
                                selectedType = nil
                            }
                        }
                    }
                    .padding()
                }

                // Templates list
                ScrollView {
                    VStack(spacing: 16) {
                        ForEach(filteredTemplates, id: \.id) { template in
                            TemplateCard(template: template) {
                                selectedTemplate = template
                                dismiss()
                            }
                        }
                    }
                    .padding()
                }
            }
            .background(themeManager.currentTheme.backgroundColor.ignoresSafeArea())
            .navigationTitle("Choose Template")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") { dismiss() }
                }

                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Free-Form") {
                        selectedTemplate = nil
                        dismiss()
                    }
                }
            }
        }
    }
}

struct TemplateCard: View {
    @EnvironmentObject var themeManager: ThemeManager
    let template: WritingTemplate
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            VStack(alignment: .leading, spacing: 12) {
                HStack {
                    VStack(alignment: .leading, spacing: 4) {
                        Text(template.name)
                            .font(.headline)
                            .foregroundColor(themeManager.currentTheme.textPrimary)

                        HStack(spacing: 8) {
                            Image(systemName: template.difficultyLevel.icon)
                                .font(.caption)
                            Text(template.difficultyLevel.rawValue)
                                .font(.caption)

                            Text("•")
                                .font(.caption)

                            Text("\(template.estimatedDuration) min")
                                .font(.caption)
                        }
                        .foregroundColor(themeManager.currentTheme.textSecondary)
                    }

                    Spacer()

                    if !template.isUnlocked {
                        Image(systemName: "lock.fill")
                            .foregroundColor(.gray)
                    }
                }

                Text(template.templateDescription)
                    .font(.subheadline)
                    .foregroundColor(themeManager.currentTheme.textSecondary)

                Text("\(template.prompts.count) prompts")
                    .font(.caption)
                    .foregroundColor(themeManager.currentTheme.accentColor)
            }
            .padding()
            .background(themeManager.currentTheme.cardBackground)
            .cornerRadius(16)
            .shadow(color: .black.opacity(0.05), radius: 8, x: 0, y: 4)
            .opacity(template.isUnlocked ? 1.0 : 0.6)
        }
        .disabled(!template.isUnlocked)
    }
}

struct FilterChipButton: View {
    @EnvironmentObject var themeManager: ThemeManager
    let title: String
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Text(title)
                .font(.subheadline)
                .fontWeight(isSelected ? .semibold : .regular)
                .foregroundColor(isSelected ? .white : themeManager.currentTheme.textPrimary)
                .padding(.horizontal, 16)
                .padding(.vertical, 8)
                .background(isSelected ? themeManager.currentTheme.accentColor : themeManager.currentTheme.cardBackground)
                .cornerRadius(20)
        }
    }
}

#Preview {
    TemplateSelectionView(selectedTemplate: .constant(nil))
        .environmentObject(ThemeManager())
}
