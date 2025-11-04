//
//  Category.swift
//  GratitudeJournal
//
//  Custom categories for organizing gratitude entries
//

import Foundation
import SwiftData

@Model
final class Category {
    var id: UUID
    var name: String
    var icon: String
    var colorHex: String
    var createdAt: Date
    var sortOrder: Int
    var isDefault: Bool

    init(name: String, icon: String, colorHex: String, isDefault: Bool = false) {
        self.id = UUID()
        self.name = name
        self.icon = icon
        self.colorHex = colorHex
        self.createdAt = Date()
        self.sortOrder = 0
        self.isDefault = isDefault
    }

    static var defaultCategories: [Category] {
        [
            Category(name: "Family", icon: "heart.fill", colorHex: "#FF6B9D", isDefault: true),
            Category(name: "Friends", icon: "person.2.fill", colorHex: "#4ECDC4", isDefault: true),
            Category(name: "Health", icon: "heart.circle.fill", colorHex: "#95E1D3", isDefault: true),
            Category(name: "Career", icon: "briefcase.fill", colorHex: "#FFB6C1", isDefault: true),
            Category(name: "Nature", icon: "leaf.fill", colorHex: "#90EE90", isDefault: true),
            Category(name: "Personal Growth", icon: "chart.line.uptrend.xyaxis", colorHex: "#DDA0DD", isDefault: true),
            Category(name: "Achievements", icon: "star.fill", colorHex: "#FFD700", isDefault: true),
            Category(name: "Simple Pleasures", icon: "cup.and.saucer.fill", colorHex: "#F4A460", isDefault: true),
            Category(name: "Love & Relationships", icon: "heart.circle", colorHex: "#FFB6C1", isDefault: true),
            Category(name: "Learning", icon: "book.fill", colorHex: "#87CEEB", isDefault: true)
        ]
    }
}
