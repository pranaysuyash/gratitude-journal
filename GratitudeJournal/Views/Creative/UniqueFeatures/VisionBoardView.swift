//
//  VisionBoardView.swift
//  GratitudeJournal
//
//  Vision board for goals and gratitude visualization
//

import SwiftUI
import SwiftData

struct VisionBoardView: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(\.modelContext) private var modelContext
    @EnvironmentObject var themeManager: ThemeManager

    @Query private var boards: [VisionBoard]
    @State private var selectedBoard: VisionBoard?
    @State private var showCreateBoard = false

    var body: some View {
        NavigationStack {
            ZStack {
                themeManager.currentTheme.backgroundColor
                    .ignoresSafeArea()

                if boards.isEmpty {
                    emptyState
                } else {
                    ScrollView {
                        VStack(spacing: 20) {
                            ForEach(boards) { board in
                                BoardCard(board: board) {
                                    selectedBoard = board
                                }
                            }
                        }
                        .padding()
                    }
                }
            }
            .navigationTitle("Vision Board")
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Done") { dismiss() }
                }

                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: { showCreateBoard = true }) {
                        Image(systemName: "plus")
                    }
                }
            }
            .sheet(isPresented: $showCreateBoard) {
                CreateBoardView()
            }
            .sheet(item: $selectedBoard) { board in
                BoardDetailView(board: board)
            }
        }
    }

    private var emptyState: some View {
        VStack(spacing: 20) {
            Text("🎯")
                .font(.system(size: 80))

            Text("Create Your Vision Board")
                .font(.title2)
                .fontWeight(.semibold)

            Text("Visualize your goals, dreams, and gratitude with a personalized vision board")
                .font(.body)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 40)

            Button(action: { showCreateBoard = true }) {
                Text("Create Vision Board")
                    .fontWeight(.semibold)
                    .foregroundColor(.white)
                    .frame(maxWidth: 200)
                    .padding()
                    .background(themeManager.currentTheme.accentColor)
                    .cornerRadius(12)
            }
        }
    }
}

struct BoardCard: View {
    @EnvironmentObject var themeManager: ThemeManager
    let board: VisionBoard
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            VStack(alignment: .leading, spacing: 12) {
                HStack {
                    Text(board.title)
                        .font(.title3)
                        .fontWeight(.semibold)
                        .foregroundColor(themeManager.currentTheme.textPrimary)

                    Spacer()

                    Image(systemName: "chevron.right")
                        .foregroundColor(themeManager.currentTheme.textSecondary)
                }

                Text(board.theme)
                    .font(.subheadline)
                    .foregroundColor(themeManager.currentTheme.accentColor)

                HStack {
                    Label("\(board.items.count) items", systemImage: "square.grid.2x2")
                        .font(.caption)
                        .foregroundColor(themeManager.currentTheme.textSecondary)

                    Spacer()

                    Text(board.createdDate.formatted(date: .abbreviated, time: .omitted))
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

struct CreateBoardView: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(\.modelContext) private var modelContext
    @EnvironmentObject var themeManager: ThemeManager

    @State private var title = ""
    @State private var theme = "Gratitude"

    let themeOptions = [
        "Gratitude", "Goals & Dreams", "Career", "Health & Wellness",
        "Relationships", "Personal Growth", "Travel", "Creativity"
    ]

    var body: some View {
        NavigationStack {
            Form {
                Section("Board Details") {
                    TextField("Title", text: $title)

                    Picker("Theme", selection: $theme) {
                        ForEach(themeOptions, id: \.self) { option in
                            Text(option).tag(option)
                        }
                    }
                }

                Section {
                    Button(action: createBoard) {
                        Text("Create Board")
                            .frame(maxWidth: .infinity)
                            .foregroundColor(.white)
                            .padding()
                            .background(themeManager.currentTheme.accentColor)
                            .cornerRadius(12)
                    }
                    .disabled(title.isEmpty)
                }
                .listRowBackground(Color.clear)
            }
            .navigationTitle("New Vision Board")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") { dismiss() }
                }
            }
        }
    }

    private func createBoard() {
        let board = VisionBoard(title: title, theme: theme)
        modelContext.insert(board)
        dismiss()
    }
}

struct BoardDetailView: View {
    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject var themeManager: ThemeManager

    @Bindable var board: VisionBoard
    @State private var showAddItem = false
    @State private var selectedItemType: VisionBoardItem.ItemType = .text
    @State private var newItemContent = ""
    @State private var draggedItem: VisionBoardItem?

    var body: some View {
        NavigationStack {
            ZStack {
                themeManager.currentTheme.backgroundColor
                    .ignoresSafeArea()

                ScrollView {
                    VStack(spacing: 20) {
                        // Board info
                        VStack(alignment: .leading, spacing: 8) {
                            Text(board.theme)
                                .font(.subheadline)
                                .foregroundColor(themeManager.currentTheme.accentColor)

                            Text("\(board.items.count) items")
                                .font(.caption)
                                .foregroundColor(themeManager.currentTheme.textSecondary)
                        }
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding()

                        // Canvas area
                        if board.items.isEmpty {
                            VStack(spacing: 16) {
                                Image(systemName: "square.dashed")
                                    .font(.system(size: 60))
                                    .foregroundColor(themeManager.currentTheme.textSecondary)

                                Text("Your vision board is empty")
                                    .font(.headline)

                                Text("Add goals, affirmations, or images to bring your vision to life")
                                    .font(.subheadline)
                                    .foregroundColor(.secondary)
                                    .multilineTextAlignment(.center)
                            }
                            .padding(40)
                        } else {
                            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 16) {
                                ForEach(board.items, id: \.id) { item in
                                    BoardItemView(item: item)
                                }
                            }
                            .padding()
                        }

                        // Add item button
                        Button(action: { showAddItem = true }) {
                            HStack {
                                Image(systemName: "plus.circle.fill")
                                Text("Add Item")
                            }
                            .font(.headline)
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(themeManager.currentTheme.accentColor)
                            .cornerRadius(12)
                        }
                        .padding(.horizontal)
                    }
                }
            }
            .navigationTitle(board.title)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") { dismiss() }
                }
            }
            .sheet(isPresented: $showAddItem) {
                AddItemSheet(board: board)
            }
        }
    }
}

struct BoardItemView: View {
    @EnvironmentObject var themeManager: ThemeManager
    let item: VisionBoardItem

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                itemIcon
                    .font(.title3)
                Spacer()
            }

            Text(item.content)
                .font(.body)
                .foregroundColor(themeManager.currentTheme.textPrimary)
                .lineLimit(4)
        }
        .padding()
        .frame(height: 150)
        .background(themeManager.currentTheme.cardBackground)
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.05), radius: 4, x: 0, y: 2)
    }

    @ViewBuilder
    private var itemIcon: some View {
        switch item.type {
        case .text:
            Image(systemName: "text.alignleft")
                .foregroundColor(.blue)
        case .image:
            Image(systemName: "photo")
                .foregroundColor(.purple)
        case .affirmation:
            Image(systemName: "sparkles")
                .foregroundColor(.orange)
        case .goal:
            Image(systemName: "target")
                .foregroundColor(.green)
        }
    }
}

struct AddItemSheet: View {
    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject var themeManager: ThemeManager

    @Bindable var board: VisionBoard
    @State private var selectedType: VisionBoardItem.ItemType = .text
    @State private var content = ""

    var body: some View {
        NavigationStack {
            Form {
                Section("Item Type") {
                    Picker("Type", selection: $selectedType) {
                        HStack {
                            Image(systemName: "text.alignleft")
                            Text("Text")
                        }
                        .tag(VisionBoardItem.ItemType.text)

                        HStack {
                            Image(systemName: "target")
                            Text("Goal")
                        }
                        .tag(VisionBoardItem.ItemType.goal)

                        HStack {
                            Image(systemName: "sparkles")
                            Text("Affirmation")
                        }
                        .tag(VisionBoardItem.ItemType.affirmation)

                        HStack {
                            Image(systemName: "photo")
                            Text("Image")
                        }
                        .tag(VisionBoardItem.ItemType.image)
                    }
                    .pickerStyle(.segmented)
                }

                Section("Content") {
                    TextEditor(text: $content)
                        .frame(minHeight: 100)

                    if selectedType == .image {
                        Text("Note: Photo picker integration coming soon")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }

                Section {
                    Button(action: addItem) {
                        Text("Add to Board")
                            .frame(maxWidth: .infinity)
                            .foregroundColor(.white)
                            .padding()
                            .background(themeManager.currentTheme.accentColor)
                            .cornerRadius(12)
                    }
                    .disabled(content.isEmpty)
                }
                .listRowBackground(Color.clear)
            }
            .navigationTitle("Add Item")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") { dismiss() }
                }
            }
        }
    }

    private func addItem() {
        let item = VisionBoardItem(type: selectedType, content: content, x: 0, y: 0)
        board.addItem(item)
        dismiss()
    }
}

#Preview {
    VisionBoardView()
        .environmentObject(ThemeManager())
        .modelContainer(for: [VisionBoard.self])
}
