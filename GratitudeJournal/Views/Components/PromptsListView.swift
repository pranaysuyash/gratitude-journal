//
//  PromptsListView.swift
//  GratitudeJournal
//
//  Browse and select gratitude writing prompts
//

import SwiftUI

struct PromptsListView: View {
    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject var themeManager: ThemeManager

    @Binding var selectedPrompt: String?

    @State private var searchText = ""
    @State private var selectedCategory: PromptCategory = .all

    private var filteredPrompts: [GratitudePrompt] {
        var prompts = GratitudePrompt.allPrompts

        if selectedCategory != .all {
            prompts = prompts.filter { $0.category == selectedCategory }
        }

        if !searchText.isEmpty {
            prompts = prompts.filter { $0.text.localizedCaseInsensitiveContains(searchText) }
        }

        return prompts
    }

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                // Category filter
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 12) {
                        ForEach(PromptCategory.allCases, id: \.self) { category in
                            CategoryFilterChip(
                                category: category,
                                isSelected: selectedCategory == category,
                                action: { selectedCategory = category }
                            )
                        }
                    }
                    .padding()
                }

                // Prompts list
                List {
                    ForEach(filteredPrompts) { prompt in
                        PromptRow(prompt: prompt) {
                            selectedPrompt = prompt.text
                            dismiss()
                        }
                    }
                }
                .listStyle(.plain)
            }
            .navigationTitle("Writing Prompts")
            .navigationBarTitleDisplayMode(.inline)
            .searchable(text: $searchText, prompt: "Search prompts...")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Cancel") {
                        dismiss()
                    }
                    .foregroundColor(themeManager.currentTheme.accentColor)
                }
            }
        }
    }
}

struct PromptRow: View {
    @EnvironmentObject var themeManager: ThemeManager
    let prompt: GratitudePrompt
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(alignment: .top, spacing: 12) {
                Image(systemName: prompt.category.icon)
                    .font(.title3)
                    .foregroundColor(themeManager.currentTheme.accentColor)
                    .frame(width: 30)

                VStack(alignment: .leading, spacing: 4) {
                    Text(prompt.text)
                        .font(.body)
                        .foregroundColor(themeManager.currentTheme.textPrimary)
                        .multilineTextAlignment(.leading)

                    Text(prompt.category.rawValue)
                        .font(.caption)
                        .foregroundColor(themeManager.currentTheme.textSecondary)
                }

                Spacer()

                Image(systemName: "chevron.right")
                    .font(.caption)
                    .foregroundColor(themeManager.currentTheme.textSecondary)
            }
            .padding(.vertical, 8)
        }
    }
}

struct CategoryFilterChip: View {
    @EnvironmentObject var themeManager: ThemeManager
    let category: PromptCategory
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 6) {
                Image(systemName: category.icon)
                    .font(.caption)
                Text(category.rawValue)
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

// MARK: - Prompt Data

struct GratitudePrompt: Identifiable {
    let id = UUID()
    let text: String
    let category: PromptCategory

    static let allPrompts = [
        // Daily Life
        GratitudePrompt(text: "What made you smile today?", category: .daily),
        GratitudePrompt(text: "What small moment brought you joy today?", category: .daily),
        GratitudePrompt(text: "What is something you often take for granted?", category: .daily),
        GratitudePrompt(text: "What made today unique or special?", category: .daily),
        GratitudePrompt(text: "What comfort did you enjoy today?", category: .daily),

        // Relationships
        GratitudePrompt(text: "Who made a positive impact on your life recently?", category: .relationships),
        GratitudePrompt(text: "What quality do you appreciate most in your best friend?", category: .relationships),
        GratitudePrompt(text: "What act of kindness have you witnessed or received?", category: .relationships),
        GratitudePrompt(text: "Who inspires you and why?", category: .relationships),
        GratitudePrompt(text: "What conversation are you grateful for today?", category: .relationships),

        // Personal Growth
        GratitudePrompt(text: "What challenge helped you grow?", category: .growth),
        GratitudePrompt(text: "What skill or talent are you grateful to have?", category: .growth),
        GratitudePrompt(text: "What lesson did you learn recently?", category: .growth),
        GratitudePrompt(text: "What fear have you overcome?", category: .growth),
        GratitudePrompt(text: "What personal achievement are you proud of?", category: .growth),

        // Nature & Environment
        GratitudePrompt(text: "What in nature fills you with wonder?", category: .nature),
        GratitudePrompt(text: "What season are you most grateful for and why?", category: .nature),
        GratitudePrompt(text: "What sounds of nature bring you peace?", category: .nature),
        GratitudePrompt(text: "What place in nature makes you feel most alive?", category: .nature),

        // Health & Wellness
        GratitudePrompt(text: "What does your body allow you to do that you're grateful for?", category: .health),
        GratitudePrompt(text: "What healthy habit are you thankful you've developed?", category: .health),
        GratitudePrompt(text: "What energy did you have today that you appreciate?", category: .health),

        // Simple Pleasures
        GratitudePrompt(text: "What simple pleasure did you enjoy today?", category: .simple),
        GratitudePrompt(text: "What food or drink are you grateful for?", category: .simple),
        GratitudePrompt(text: "What scent makes you feel happy?", category: .simple),
        GratitudePrompt(text: "What cozy moment did you experience?", category: .simple),

        // Challenges & Difficulties
        GratitudePrompt(text: "What difficult situation taught you something valuable?", category: .challenges),
        GratitudePrompt(text: "What strength did you discover through adversity?", category: .challenges),
        GratitudePrompt(text: "What support did you receive during a tough time?", category: .challenges),

        // Future & Hope
        GratitudePrompt(text: "What are you looking forward to?", category: .future),
        GratitudePrompt(text: "What opportunity are you grateful to have?", category: .future),
        GratitudePrompt(text: "What dream are you grateful to be pursuing?", category: .future),

        // Reflection
        GratitudePrompt(text: "What tradition are you thankful for?", category: .reflection),
        GratitudePrompt(text: "What memory brings you happiness?", category: .reflection),
        GratitudePrompt(text: "What book, movie, or song touched your heart?", category: .reflection),
        GratitudePrompt(text: "What freedom do you have that you're grateful for?", category: .reflection)
    ]
}

enum PromptCategory: String, CaseIterable {
    case all = "All"
    case daily = "Daily Life"
    case relationships = "Relationships"
    case growth = "Personal Growth"
    case nature = "Nature"
    case health = "Health"
    case simple = "Simple Pleasures"
    case challenges = "Challenges"
    case future = "Future"
    case reflection = "Reflection"

    var icon: String {
        switch self {
        case .all: return "sparkles"
        case .daily: return "sun.max.fill"
        case .relationships: return "person.2.fill"
        case .growth: return "chart.line.uptrend.xyaxis"
        case .nature: return "leaf.fill"
        case .health: return "heart.fill"
        case .simple: return "cup.and.saucer.fill"
        case .challenges: return "mountain.2.fill"
        case .future: return "star.fill"
        case .reflection: return "book.closed.fill"
        }
    }
}

#Preview {
    PromptsListView(selectedPrompt: .constant(nil))
        .environmentObject(ThemeManager())
}
