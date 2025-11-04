//
//  ExportOptionsView.swift
//  GratitudeJournal
//
//  Export gratitude journal entries in various formats
//

import SwiftUI
import SwiftData

struct ExportOptionsView: View {
    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject var themeManager: ThemeManager

    @Query private var entries: [JournalEntry]

    var body: some View {
        NavigationStack {
            List {
                Section {
                    ExportOptionRow(
                        title: "Export as PDF",
                        description: "Beautiful PDF yearbook of your entries",
                        icon: "doc.fill",
                        color: .red
                    ) {
                        exportAsPDF()
                    }

                    ExportOptionRow(
                        title: "Export as JSON",
                        description: "Machine-readable format with all data",
                        icon: "chevron.left.forwardslash.chevron.right",
                        color: .blue
                    ) {
                        exportAsJSON()
                    }

                    ExportOptionRow(
                        title: "Export as CSV",
                        description: "Spreadsheet-compatible format",
                        icon: "tablecells",
                        color: .green
                    ) {
                        exportAsCSV()
                    }

                    ExportOptionRow(
                        title: "Export as Text",
                        description: "Plain text file of all entries",
                        icon: "doc.text",
                        color: .orange
                    ) {
                        exportAsText()
                    }
                } header: {
                    Text("Export Formats")
                } footer: {
                    Text("Total entries: \(entries.count)")
                }

                Section("Share Options") {
                    ExportOptionRow(
                        title: "Create Yearly Review",
                        description: "Generate a beautiful summary of the year",
                        icon: "calendar.badge.clock",
                        color: .purple
                    ) {
                        createYearlyReview()
                    }

                    ExportOptionRow(
                        title: "Create Photo Collage",
                        description: "Combine photos from your entries",
                        icon: "photo.on.rectangle.angled",
                        color: .pink
                    ) {
                        createPhotoCollage()
                    }
                }
            }
            .navigationTitle("Export Data")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") {
                        dismiss()
                    }
                    .foregroundColor(themeManager.currentTheme.accentColor)
                }
            }
        }
    }

    // MARK: - Export Functions

    private func exportAsPDF() {
        // Implementation for PDF export
        print("Exporting as PDF...")
    }

    private func exportAsJSON() {
        // Implementation for JSON export
        print("Exporting as JSON...")
    }

    private func exportAsCSV() {
        // Implementation for CSV export
        print("Exporting as CSV...")
    }

    private func exportAsText() {
        // Implementation for text export
        print("Exporting as Text...")
    }

    private func createYearlyReview() {
        // Implementation for yearly review
        print("Creating yearly review...")
    }

    private func createPhotoCollage() {
        // Implementation for photo collage
        print("Creating photo collage...")
    }
}

struct ExportOptionRow: View {
    @EnvironmentObject var themeManager: ThemeManager
    let title: String
    let description: String
    let icon: String
    let color: Color
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 16) {
                ZStack {
                    Circle()
                        .fill(color.opacity(0.2))
                        .frame(width: 50, height: 50)

                    Image(systemName: icon)
                        .font(.title3)
                        .foregroundColor(color)
                }

                VStack(alignment: .leading, spacing: 4) {
                    Text(title)
                        .font(.headline)
                        .foregroundColor(themeManager.currentTheme.textPrimary)

                    Text(description)
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

#Preview {
    ExportOptionsView()
        .environmentObject(ThemeManager())
        .modelContainer(for: [JournalEntry.self])
}
