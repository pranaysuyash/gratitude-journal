//
//  ThemeManager.swift
//  GratitudeJournal
//
//  Manages app themes and color schemes with calming palettes
//

import SwiftUI

class ThemeManager: ObservableObject {
    @Published var currentTheme: AppTheme = .sereneBlue
    @Published var colorScheme: ColorScheme? = nil
    @Published var isDarkMode: Bool = false {
        didSet {
            colorScheme = isDarkMode ? .dark : .light
        }
    }

    func setTheme(_ theme: AppTheme) {
        withAnimation(.easeInOut(duration: 0.3)) {
            currentTheme = theme
        }
    }
}

enum AppTheme: String, CaseIterable, Identifiable {
    case sereneBlue = "Serene Blue"
    case calmLavender = "Calm Lavender"
    case peacefulGreen = "Peaceful Green"
    case warmSunset = "Warm Sunset"
    case gentlePink = "Gentle Pink"
    case softMint = "Soft Mint"
    case tranquilSage = "Tranquil Sage"
    case cozyBeige = "Cozy Beige"

    var id: String { rawValue }

    var primaryColor: Color {
        switch self {
        case .sereneBlue: return Color(red: 0.4, green: 0.65, blue: 0.8)
        case .calmLavender: return Color(red: 0.7, green: 0.65, blue: 0.85)
        case .peacefulGreen: return Color(red: 0.5, green: 0.75, blue: 0.6)
        case .warmSunset: return Color(red: 0.95, green: 0.75, blue: 0.65)
        case .gentlePink: return Color(red: 0.95, green: 0.75, blue: 0.8)
        case .softMint: return Color(red: 0.6, green: 0.85, blue: 0.8)
        case .tranquilSage: return Color(red: 0.65, green: 0.75, blue: 0.7)
        case .cozyBeige: return Color(red: 0.85, green: 0.8, blue: 0.75)
        }
    }

    var secondaryColor: Color {
        switch self {
        case .sereneBlue: return Color(red: 0.3, green: 0.5, blue: 0.7)
        case .calmLavender: return Color(red: 0.6, green: 0.5, blue: 0.75)
        case .peacefulGreen: return Color(red: 0.4, green: 0.65, blue: 0.5)
        case .warmSunset: return Color(red: 0.9, green: 0.65, blue: 0.5)
        case .gentlePink: return Color(red: 0.9, green: 0.6, blue: 0.7)
        case .softMint: return Color(red: 0.5, green: 0.75, blue: 0.7)
        case .tranquilSage: return Color(red: 0.55, green: 0.65, blue: 0.6)
        case .cozyBeige: return Color(red: 0.75, green: 0.7, blue: 0.65)
        }
    }

    var accentColor: Color {
        switch self {
        case .sereneBlue: return Color(red: 0.2, green: 0.45, blue: 0.7)
        case .calmLavender: return Color(red: 0.5, green: 0.4, blue: 0.7)
        case .peacefulGreen: return Color(red: 0.3, green: 0.6, blue: 0.4)
        case .warmSunset: return Color(red: 0.9, green: 0.5, blue: 0.3)
        case .gentlePink: return Color(red: 0.85, green: 0.5, blue: 0.6)
        case .softMint: return Color(red: 0.4, green: 0.7, blue: 0.65)
        case .tranquilSage: return Color(red: 0.45, green: 0.6, blue: 0.5)
        case .cozyBeige: return Color(red: 0.7, green: 0.6, blue: 0.5)
        }
    }

    var backgroundColor: Color {
        switch self {
        case .sereneBlue: return Color(red: 0.95, green: 0.97, blue: 1.0)
        case .calmLavender: return Color(red: 0.97, green: 0.95, blue: 1.0)
        case .peacefulGreen: return Color(red: 0.95, green: 0.98, blue: 0.96)
        case .warmSunset: return Color(red: 1.0, green: 0.98, blue: 0.95)
        case .gentlePink: return Color(red: 1.0, green: 0.97, blue: 0.98)
        case .softMint: return Color(red: 0.96, green: 0.99, blue: 0.98)
        case .tranquilSage: return Color(red: 0.96, green: 0.98, blue: 0.97)
        case .cozyBeige: return Color(red: 0.98, green: 0.97, blue: 0.95)
        }
    }

    var cardBackground: Color {
        Color.white.opacity(0.9)
    }

    var textPrimary: Color {
        Color(red: 0.2, green: 0.2, blue: 0.25)
    }

    var textSecondary: Color {
        Color(red: 0.4, green: 0.4, blue: 0.45)
    }

    var gradientColors: [Color] {
        [primaryColor.opacity(0.3), secondaryColor.opacity(0.2)]
    }
}

// Mood Colors
extension Color {
    static let moodJoyful = Color(red: 1.0, green: 0.85, blue: 0.4)
    static let moodPeaceful = Color(red: 0.5, green: 0.75, blue: 0.9)
    static let moodGrateful = Color(red: 0.95, green: 0.7, blue: 0.8)
    static let moodHopeful = Color(red: 0.6, green: 0.85, blue: 0.65)
    static let moodReflective = Color(red: 0.7, green: 0.65, blue: 0.85)
    static let moodContent = Color(red: 0.85, green: 0.8, blue: 0.6)
    static let moodInspired = Color(red: 0.9, green: 0.65, blue: 0.5)
    static let moodCalm = Color(red: 0.6, green: 0.8, blue: 0.75)
}
