//
//  ExportService.swift
//  GratitudeJournal
//
//  Complete export functionality for all formats
//

import Foundation
import UIKit
import PDFKit

class ExportService {
    static let shared = ExportService()

    private init() {}

    // MARK: - PDF Export

    func exportAsPDF(entries: [JournalEntry], title: String = "My Gratitude Journal") -> URL? {
        let pdfMetaData = [
            kCGPDFContextCreator: "Gratitude Journal",
            kCGPDFContextAuthor: "Gratitude Journal App",
            kCGPDFContextTitle: title
        ]

        let format = UIGraphicsPDFRendererFormat()
        format.documentInfo = pdfMetaData as [String: Any]

        let pageWidth = 8.5 * 72.0
        let pageHeight = 11 * 72.0
        let pageRect = CGRect(x: 0, y: 0, width: pageWidth, height: pageHeight)

        let renderer = UIGraphicsPDFRenderer(bounds: pageRect, format: format)

        let data = renderer.pdfData { context in
            // Cover page
            context.beginPage()
            drawCoverPage(in: pageRect, title: title, entryCount: entries.count)

            // Entry pages
            for (index, entry) in entries.enumerated() {
                context.beginPage()
                drawEntryPage(entry: entry, pageNumber: index + 1, in: pageRect)
            }
        }

        // Save to file
        let filename = "GratitudeJournal_\(Date().formatted(date: .numeric, time: .omitted)).pdf"
        let url = getDocumentsDirectory().appendingPathComponent(filename)

        do {
            try data.write(to: url)
            return url
        } catch {
            print("Error saving PDF: \(error)")
            return nil
        }
    }

    private func drawCoverPage(in rect: CGRect, title: String, entryCount: Int) {
        // Title
        let titleFont = UIFont.systemFont(ofSize: 48, weight: .bold)
        let titleAttributes: [NSAttributedString.Key: Any] = [
            .font: titleFont,
            .foregroundColor: UIColor.systemBlue
        ]

        let titleString = title as NSString
        let titleSize = titleString.size(withAttributes: titleAttributes)
        let titleRect = CGRect(
            x: (rect.width - titleSize.width) / 2,
            y: rect.height / 3,
            width: titleSize.width,
            height: titleSize.height
        )
        titleString.draw(in: titleRect, withAttributes: titleAttributes)

        // Subtitle
        let subtitle = "\(entryCount) Gratitude Entries" as NSString
        let subtitleFont = UIFont.systemFont(ofSize: 24)
        let subtitleAttributes: [NSAttributedString.Key: Any] = [
            .font: subtitleFont,
            .foregroundColor: UIColor.gray
        ]
        let subtitleSize = subtitle.size(withAttributes: subtitleAttributes)
        let subtitleRect = CGRect(
            x: (rect.width - subtitleSize.width) / 2,
            y: titleRect.maxY + 20,
            width: subtitleSize.width,
            height: subtitleSize.height
        )
        subtitle.draw(in: subtitleRect, withAttributes: subtitleAttributes)

        // Date range
        let dateText = Date().formatted(date: .long, time: .omitted) as NSString
        let dateFont = UIFont.systemFont(ofSize: 18)
        let dateAttributes: [NSAttributedString.Key: Any] = [
            .font: dateFont,
            .foregroundColor: UIColor.darkGray
        ]
        let dateSize = dateText.size(withAttributes: dateAttributes)
        let dateRect = CGRect(
            x: (rect.width - dateSize.width) / 2,
            y: rect.height - 100,
            width: dateSize.width,
            height: dateSize.height
        )
        dateText.draw(in: dateRect, withAttributes: dateAttributes)
    }

    private func drawEntryPage(entry: JournalEntry, pageNumber: Int, in rect: CGRect) {
        let margin: CGFloat = 50
        var yPosition: CGFloat = margin

        // Date
        let dateText = entry.date.formatted(date: .long, time: .omitted) + " - " + entry.mood.emoji as NSString
        let dateFont = UIFont.systemFont(ofSize: 14, weight: .medium)
        let dateAttributes: [NSAttributedString.Key: Any] = [
            .font: dateFont,
            .foregroundColor: UIColor.gray
        ]
        dateText.draw(at: CGPoint(x: margin, y: yPosition), withAttributes: dateAttributes)
        yPosition += 30

        // Content
        let contentFont = UIFont.systemFont(ofSize: 12)
        let contentAttributes: [NSAttributedString.Key: Any] = [
            .font: contentFont,
            .foregroundColor: UIColor.black
        ]

        let contentRect = CGRect(
            x: margin,
            y: yPosition,
            width: rect.width - (margin * 2),
            height: rect.height - yPosition - margin
        )

        let contentText = entry.content as NSString
        contentText.draw(in: contentRect, withAttributes: contentAttributes)

        // Tags (if any)
        if !entry.tags.isEmpty {
            let tagsText = entry.tags.map { "#\($0)" }.joined(separator: " ") as NSString
            let tagsFont = UIFont.systemFont(ofSize: 10, weight: .light)
            let tagsAttributes: [NSAttributedString.Key: Any] = [
                .font: tagsFont,
                .foregroundColor: UIColor.systemBlue
            ]

            let tagsRect = CGRect(
                x: margin,
                y: rect.height - 60,
                width: rect.width - (margin * 2),
                height: 20
            )
            tagsText.draw(in: tagsRect, withAttributes: tagsAttributes)
        }

        // Page number
        let pageText = "Page \(pageNumber)" as NSString
        let pageFont = UIFont.systemFont(ofSize: 10)
        let pageAttributes: [NSAttributedString.Key: Any] = [
            .font: pageFont,
            .foregroundColor: UIColor.lightGray
        ]
        let pageSize = pageText.size(withAttributes: pageAttributes)
        pageText.draw(at: CGPoint(x: rect.width - pageSize.width - margin, y: rect.height - 40), withAttributes: pageAttributes)
    }

    // MARK: - CSV Export

    func exportAsCSV(entries: [JournalEntry]) -> URL? {
        var csvText = "Date,Mood,Content,Tags,Categories,Word Count,Writing Duration\n"

        for entry in entries {
            let date = entry.date.formatted(date: .numeric, time: .omitted)
            let mood = entry.mood.rawValue
            let content = entry.content.replacingOccurrences(of: "\"", with: "\"\"")
            let tags = entry.tags.joined(separator: "; ")
            let categories = entry.categories.joined(separator: "; ")
            let wordCount = String(entry.wordCount)
            let duration = String(format: "%.0f", entry.writingDuration)

            csvText += "\"\(date)\",\"\(mood)\",\"\(content)\",\"\(tags)\",\"\(categories)\",\(wordCount),\(duration)\n"
        }

        let filename = "GratitudeJournal_\(Date().formatted(date: .numeric, time: .omitted)).csv"
        let url = getDocumentsDirectory().appendingPathComponent(filename)

        do {
            try csvText.write(to: url, atomically: true, encoding: .utf8)
            return url
        } catch {
            print("Error saving CSV: \(error)")
            return nil
        }
    }

    // MARK: - JSON Export

    func exportAsJSON(entries: [JournalEntry]) -> URL? {
        let exportData = entries.map { entry -> [String: Any] in
            [
                "id": entry.id.uuidString,
                "date": ISO8601DateFormatter().string(from: entry.date),
                "content": entry.content,
                "mood": entry.mood.rawValue,
                "emotions": entry.emotions.map { $0.rawValue },
                "tags": entry.tags,
                "categories": entry.categories,
                "people": entry.peopleMentioned,
                "wordCount": entry.wordCount,
                "writingDuration": entry.writingDuration,
                "isPinned": entry.isPinned,
                "isGratitudeLetter": entry.isGratitudeLetter,
                "photoCount": entry.photoURLs.count,
                "hasVoiceNote": entry.voiceNoteURL != nil
            ]
        }

        let jsonObject: [String: Any] = [
            "exportDate": ISO8601DateFormatter().string(from: Date()),
            "entryCount": entries.count,
            "entries": exportData
        ]

        do {
            let jsonData = try JSONSerialization.data(withJSONObject: jsonObject, options: .prettyPrinted)
            let filename = "GratitudeJournal_\(Date().formatted(date: .numeric, time: .omitted)).json"
            let url = getDocumentsDirectory().appendingPathComponent(filename)

            try jsonData.write(to: url)
            return url
        } catch {
            print("Error saving JSON: \(error)")
            return nil
        }
    }

    // MARK: - Text Export

    func exportAsText(entries: [JournalEntry]) -> URL? {
        var textContent = "MY GRATITUDE JOURNAL\n"
        textContent += "====================\n\n"
        textContent += "Total Entries: \(entries.count)\n"
        textContent += "Exported: \(Date().formatted(date: .long, time: .shortened))\n\n"
        textContent += "====================\n\n"

        for entry in entries {
            textContent += "📅 \(entry.date.formatted(date: .long, time: .omitted))\n"
            textContent += "\(entry.mood.emoji) Mood: \(entry.mood.rawValue)\n\n"
            textContent += entry.content
            textContent += "\n\n"

            if !entry.tags.isEmpty {
                textContent += "Tags: \(entry.tags.map { "#\($0)" }.joined(separator: " "))\n"
            }

            if !entry.peopleMentioned.isEmpty {
                textContent += "People: \(entry.peopleMentioned.joined(separator: ", "))\n"
            }

            textContent += "\n" + String(repeating: "-", count: 50) + "\n\n"
        }

        let filename = "GratitudeJournal_\(Date().formatted(date: .numeric, time: .omitted)).txt"
        let url = getDocumentsDirectory().appendingPathComponent(filename)

        do {
            try textContent.write(to: url, atomically: true, encoding: .utf8)
            return url
        } catch {
            print("Error saving text file: \(error)")
            return nil
        }
    }

    // MARK: - Blog Post Export

    func exportAsBlogPost(entries: [JournalEntry]) -> URL? {
        var blogHTML = """
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>My Gratitude Journey</title>
            <style>
                body {
                    font-family: 'Georgia', serif;
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 20px;
                    line-height: 1.6;
                    color: #333;
                }
                .header {
                    text-align: center;
                    padding: 40px 0;
                    border-bottom: 2px solid #eee;
                }
                .entry {
                    margin: 40px 0;
                    padding: 20px;
                    background: #f9f9f9;
                    border-radius: 8px;
                }
                .entry-date {
                    color: #666;
                    font-size: 0.9em;
                    margin-bottom: 10px;
                }
                .entry-mood {
                    font-size: 2em;
                    margin: 10px 0;
                }
                .entry-content {
                    margin: 20px 0;
                }
                .tags {
                    margin-top: 15px;
                    color: #007bff;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>My Gratitude Journey</h1>
                <p>\(entries.count) Moments of Gratitude</p>
            </div>
        """

        for entry in entries {
            blogHTML += """
            <div class="entry">
                <div class="entry-date">\(entry.date.formatted(date: .long, time: .omitted))</div>
                <div class="entry-mood">\(entry.mood.emoji)</div>
                <div class="entry-content">
                    <p>\(entry.content.replacingOccurrences(of: "\n", with: "</p><p>"))</p>
                </div>
            """

            if !entry.tags.isEmpty {
                blogHTML += "<div class=\"tags\">\(entry.tags.map { "#\($0)" }.joined(separator: " "))</div>"
            }

            blogHTML += "</div>"
        }

        blogHTML += """
        </body>
        </html>
        """

        let filename = "GratitudeJournal_Blog_\(Date().formatted(date: .numeric, time: .omitted)).html"
        let url = getDocumentsDirectory().appendingPathComponent(filename)

        do {
            try blogHTML.write(to: url, atomically: true, encoding: .utf8)
            return url
        } catch {
            print("Error saving blog HTML: \(error)")
            return nil
        }
    }

    // MARK: - Printable Calendar

    func createPrintableCalendar(entries: [JournalEntry], year: Int, month: Int) -> URL? {
        // Create a simple calendar HTML that can be printed
        let calendar = Calendar.current
        var dateComponents = DateComponents(year: year, month: month)
        guard let monthDate = calendar.date(from: dateComponents) else { return nil }

        let range = calendar.range(of: .day, in: .month, for: monthDate)!
        let numDays = range.count

        let monthName = monthDate.formatted(.dateTime.month(.wide).year())

        var calendarHTML = """
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Gratitude Calendar - \(monthName)</title>
            <style>
                @media print {
                    body { margin: 0; }
                }
                body {
                    font-family: Arial, sans-serif;
                    padding: 20px;
                }
                .calendar {
                    width: 100%;
                    border-collapse: collapse;
                }
                .calendar th {
                    background: #4a90e2;
                    color: white;
                    padding: 10px;
                }
                .calendar td {
                    border: 1px solid #ddd;
                    padding: 10px;
                    height: 100px;
                    vertical-align: top;
                    width: 14.28%;
                }
                .day-number {
                    font-weight: bold;
                    font-size: 1.2em;
                }
                .has-entry {
                    background: #e8f4f8;
                }
                .entry-marker {
                    font-size: 0.8em;
                    color: #4a90e2;
                    margin-top: 5px;
                }
            </style>
        </head>
        <body>
            <h1 style="text-align: center;">Gratitude Calendar - \(monthName)</h1>
            <table class="calendar">
                <tr>
                    <th>Sun</th><th>Mon</th><th>Tue</th><th>Wed</th><th>Thu</th><th>Fri</th><th>Sat</th>
                </tr>
        """

        // Build calendar grid
        let firstWeekday = calendar.component(.weekday, from: monthDate)
        var day = 1
        var weekHTML = "<tr>"

        // Empty cells before first day
        for _ in 1..<firstWeekday {
            weekHTML += "<td></td>"
        }

        // Fill in days
        for dayOfWeek in firstWeekday...7 {
            let hasEntry = entries.contains { calendar.isDate($0.date, inSameDayAs: calendar.date(byAdding: .day, value: day - 1, to: monthDate)!) }
            let cellClass = hasEntry ? "has-entry" : ""

            weekHTML += "<td class=\"\(cellClass)\"><div class=\"day-number\">\(day)</div>"
            if hasEntry {
                weekHTML += "<div class=\"entry-marker\">✓ Entry</div>"
            }
            weekHTML += "</td>"

            day += 1
        }

        weekHTML += "</tr>"
        calendarHTML += weekHTML

        // Continue with remaining weeks
        while day <= numDays {
            weekHTML = "<tr>"
            for _ in 1...7 {
                if day <= numDays {
                    let hasEntry = entries.contains { calendar.isDate($0.date, inSameDayAs: calendar.date(byAdding: .day, value: day - 1, to: monthDate)!) }
                    let cellClass = hasEntry ? "has-entry" : ""

                    weekHTML += "<td class=\"\(cellClass)\"><div class=\"day-number\">\(day)</div>"
                    if hasEntry {
                        weekHTML += "<div class=\"entry-marker\">✓ Entry</div>"
                    }
                    weekHTML += "</td>"
                    day += 1
                } else {
                    weekHTML += "<td></td>"
                }
            }
            weekHTML += "</tr>"
            calendarHTML += weekHTML
        }

        calendarHTML += """
            </table>
        </body>
        </html>
        """

        let filename = "GratitudeCalendar_\(monthName.replacingOccurrences(of: " ", with: "_")).html"
        let url = getDocumentsDirectory().appendingPathComponent(filename)

        do {
            try calendarHTML.write(to: url, atomically: true, encoding: .utf8)
            return url
        } catch {
            print("Error saving calendar: \(error)")
            return nil
        }
    }

    // MARK: - Helper

    private func getDocumentsDirectory() -> URL {
        FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
    }
}
