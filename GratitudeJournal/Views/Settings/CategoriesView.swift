//
//  CategoriesView.swift
//  GratitudeJournal
//
//  Manage custom categories for entries
//

import SwiftUI
import SwiftData

struct CategoriesView: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(\.modelContext) private var modelContext
    @EnvironmentObject var themeManager: ThemeManager

    @Query private var categories: [Category]
    @State private var showAddCategory = false

    var body: some View {
        NavigationStack {
            List {
                ForEach(categories) { category in
                    HStack {
                        Image(systemName: category.icon)
                            .foregroundColor(Color(hex: category.colorHex))
                            .frame(width: 30)

                        Text(category.name)
                            .foregroundColor(themeManager.currentTheme.textPrimary)

                        Spacer()

                        if category.isDefault {
                            Text("Default")
                                .font(.caption)
                                .foregroundColor(themeManager.currentTheme.textSecondary)
                        }
                    }
                }
                .onDelete(perform: deleteCategories)
            }
            .navigationTitle("Categories")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Done") {
                        dismiss()
                    }
                    .foregroundColor(themeManager.currentTheme.accentColor)
                }

                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: { showAddCategory = true }) {
                        Image(systemName: "plus")
                            .foregroundColor(themeManager.currentTheme.accentColor)
                    }
                }
            }
            .sheet(isPresented: $showAddCategory) {
                AddCategoryView()
            }
            .onAppear {
                if categories.isEmpty {
                    addDefaultCategories()
                }
            }
        }
    }

    private func deleteCategories(at offsets: IndexSet) {
        for index in offsets {
            let category = categories[index]
            if !category.isDefault {
                modelContext.delete(category)
            }
        }
    }

    private func addDefaultCategories() {
        for category in Category.defaultCategories {
            modelContext.insert(category)
        }
    }
}

struct AddCategoryView: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(\.modelContext) private var modelContext
    @EnvironmentObject var themeManager: ThemeManager

    @State private var name = ""
    @State private var selectedIcon = "star.fill"
    @State private var selectedColor = "#FF6B9D"

    private let icons = ["star.fill", "heart.fill", "leaf.fill", "sun.max.fill", "moon.fill", "sparkles", "bolt.fill", "flame.fill"]
    private let colors = ["#FF6B9D", "#4ECDC4", "#95E1D3", "#FFB6C1", "#90EE90", "#DDA0DD", "#FFD700", "#F4A460"]

    var body: some View {
        NavigationStack {
            Form {
                Section("Category Name") {
                    TextField("Name", text: $name)
                }

                Section("Icon") {
                    LazyVGrid(columns: [GridItem(.adaptive(minimum: 60))], spacing: 16) {
                        ForEach(icons, id: \.self) { icon in
                            Button(action: { selectedIcon = icon }) {
                                Image(systemName: icon)
                                    .font(.title2)
                                    .foregroundColor(Color(hex: selectedColor))
                                    .frame(width: 60, height: 60)
                                    .background(selectedIcon == icon ? Color(hex: selectedColor).opacity(0.2) : Color.gray.opacity(0.1))
                                    .cornerRadius(12)
                            }
                        }
                    }
                }

                Section("Color") {
                    LazyVGrid(columns: [GridItem(.adaptive(minimum: 60))], spacing: 16) {
                        ForEach(colors, id: \.self) { color in
                            Button(action: { selectedColor = color }) {
                                Circle()
                                    .fill(Color(hex: color))
                                    .frame(width: 50, height: 50)
                                    .overlay(
                                        Circle()
                                            .stroke(selectedColor == color ? Color.white : Color.clear, lineWidth: 3)
                                    )
                            }
                        }
                    }
                }
            }
            .navigationTitle("New Category")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                }

                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Save") {
                        saveCategory()
                    }
                    .fontWeight(.semibold)
                    .disabled(name.isEmpty)
                }
            }
        }
    }

    private func saveCategory() {
        let category = Category(name: name, icon: selectedIcon, colorHex: selectedColor)
        modelContext.insert(category)
        dismiss()
    }
}

#Preview {
    CategoriesView()
        .environmentObject(ThemeManager())
        .modelContainer(for: [Category.self])
}
