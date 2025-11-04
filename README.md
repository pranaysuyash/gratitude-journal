# 🙏 Gratitude Journal - iOS App

A beautiful, feature-rich iOS gratitude journal app built with SwiftUI and SwiftData. Cultivate happiness and mindfulness through daily gratitude practice with elegant design, comprehensive features, and soothing themes.

![Swift](https://img.shields.io/badge/Swift-5.9-orange.svg)
![Platform](https://img.shields.io/badge/Platform-iOS%2017.0+-lightgrey.svg)
![SwiftUI](https://img.shields.io/badge/SwiftUI-5.0-blue.svg)
![License](https://img.shields.io/badge/License-MIT-green.svg)

## ✨ Features

### 📝 Core Journaling
- ✅ Write daily gratitude entries with rich text
- ✅ View and edit past entries
- ✅ Add photos to entries (up to 10 per entry)
- ✅ Record voice notes
- ✅ Set mood alongside entries (10+ mood types)
- ✅ Save drafts for later
- ✅ Add custom tags for organization
- ✅ Write gratitude letters to loved ones
- ✅ Pin favorite entries

### 🔍 Search & Organization
- ✅ Full-text search across all entries
- ✅ Filter by date, mood, tags, categories
- ✅ Create custom categories with icons and colors
- ✅ Filter by entry type (regular, letters, drafts, photos, voice)
- ✅ Group entries by month
- ✅ Track people mentioned in entries
- ✅ Organize by emotions and activities

### 🔔 Reminders & Notifications
- ✅ Set daily reminder notifications
- ✅ Customize reminder time
- ✅ Choose repeat frequency (daily, weekly, monthly)
- ✅ Multiple reminder types:
  - Time of day reminders
  - Morning routine reminders
  - Evening reflection reminders
  - Weekly reflection reminders

### 📊 Tracking & Analytics
- ✅ Track writing streaks with flame icons
- ✅ View longest streak achievement
- ✅ Weekly and monthly entry statistics
- ✅ Word count tracking
- ✅ Writing time analytics
- ✅ Mood distribution charts
- ✅ Calendar heatmap visualization
- ✅ Top tags analysis
- ✅ Gratitude score calculation
- ✅ Trend analysis and insights

### 🎨 Customization & Themes
- ✅ 8 beautiful calming color themes:
  - Serene Blue
  - Calm Lavender
  - Peaceful Green
  - Warm Sunset
  - Gentle Pink
  - Soft Mint
  - Tranquil Sage
  - Cozy Beige
- ✅ Dark mode support
- ✅ Customizable categories
- ✅ Personalized goals and challenges

### 🧘 Meditation & Mindfulness
- ✅ Guided gratitude meditation
- ✅ Multiple meditation durations (3, 5, 10, 15 minutes)
- ✅ Ambient sounds for focused writing:
  - Rain
  - Ocean waves
  - Forest sounds
  - Fireplace crackling
  - White noise
  - Café ambiance
  - Meditation music
- ✅ Breathing exercises
- ✅ Gratitude reflection prompts

### 🏆 Gamification & Motivation
- ✅ 20+ achievement badges including:
  - Streak badges (3-day, 7-day, 30-day, 100-day, 365-day)
  - Entry count milestones
  - Word count achievements
  - Special badges for photos, voice notes, letters
  - Morning and evening writing badges
- ✅ Progress tracking for badge completion
- ✅ Badge categories (Streaks, Writing, Creative, Special, Mindfulness, Timing)
- ✅ Visual badge gallery with locked/unlocked states

### 📚 Writing Prompts
- ✅ 35+ curated gratitude prompts across 9 categories:
  - Daily Life
  - Relationships
  - Personal Growth
  - Nature
  - Health & Wellness
  - Simple Pleasures
  - Challenges
  - Future & Hope
  - Reflection
- ✅ Searchable prompt library
- ✅ Category filtering

### 🎯 Goals & Challenges
- ✅ Create custom gratitude goals
- ✅ Multiple goal types:
  - Daily entries
  - Weekly/monthly targets
  - Streak goals
  - Word count targets
  - Writing duration goals
  - Photo entry goals
  - Category-specific goals
  - Gratitude letters
- ✅ Progress tracking with percentages
- ✅ Goal completion celebration

### 📤 Export & Sharing
- ✅ Export as PDF (yearbook format)
- ✅ Export as JSON (machine-readable)
- ✅ Export as CSV (spreadsheet)
- ✅ Export as plain text
- ✅ Share individual entries
- ✅ Create yearly reviews
- ✅ Generate photo collages

### 🔒 Privacy & Security
- ✅ Biometric authentication (Face ID / Touch ID)
- ✅ Local data storage with SwiftData
- ✅ Private vault for sensitive entries
- ✅ Password-protected app access
- ✅ No cloud sync by default (optional in future)

### ♿ Accessibility
- ✅ Dark mode / Light mode toggle
- ✅ Dynamic type support
- ✅ VoiceOver optimization
- ✅ High contrast themes
- ✅ Reduced motion support

## 🎨 Design Philosophy

The app follows **Apple's Human Interface Guidelines** with:
- Clean, minimalist interface
- Calming color palettes inspired by nature
- Smooth animations and transitions
- Intuitive navigation
- Focus on content and user experience

### Color Themes
Each theme uses carefully selected colors for:
- Primary color (main accent)
- Secondary color (supporting elements)
- Accent color (interactive elements)
- Background colors (soft, easy on eyes)
- Text colors (optimal readability)

## 🏗️ Architecture

### Tech Stack
- **SwiftUI** - Modern declarative UI framework
- **SwiftData** - Data persistence (iOS 17+)
- **Combine** - Reactive programming
- **AVFoundation** - Audio recording and playback
- **UserNotifications** - Local notifications
- **PhotosUI** - Photo picker integration

### Project Structure
```
GratitudeJournal/
├── GratitudeJournalApp.swift          # App entry point
├── Models/                             # Data models
│   ├── JournalEntry.swift             # Main entry model
│   ├── Category.swift                 # Custom categories
│   ├── Reminder.swift                 # Notification reminders
│   ├── GratitudeGoal.swift           # Goals and challenges
│   └── Badge.swift                    # Achievement badges
├── Views/                              # SwiftUI views
│   ├── Main/                          # Main app views
│   │   ├── ContentView.swift         # Tab navigation
│   │   ├── HomeView.swift            # Dashboard
│   │   └── OnboardingView.swift      # First-run experience
│   ├── Journal/                       # Journaling views
│   │   ├── NewEntryView.swift        # Write entries
│   │   ├── JournalListView.swift     # Entry list
│   │   └── EntryDetailView.swift     # View entry
│   ├── Analytics/                     # Insights & stats
│   │   ├── AnalyticsView.swift       # Dashboard
│   │   └── BadgesView.swift          # Achievements
│   ├── Meditation/                    # Mindfulness
│   │   └── MeditationView.swift      # Guided meditation
│   ├── Settings/                      # App settings
│   │   ├── SettingsView.swift        # Main settings
│   │   ├── RemindersView.swift       # Manage reminders
│   │   ├── GoalsView.swift           # Manage goals
│   │   ├── CategoriesView.swift      # Manage categories
│   │   ├── ExportOptionsView.swift   # Export data
│   │   └── AboutView.swift           # About app
│   └── Components/                    # Reusable components
│       ├── PromptsListView.swift     # Writing prompts
│       └── AmbientSoundsView.swift   # Sound picker
├── ViewModels/                        # Business logic
├── Services/                          # App services
│   ├── NotificationManager.swift     # Handle notifications
│   ├── AudioManager.swift            # Audio recording/playback
│   └── StreakManager.swift           # Calculate streaks
├── Utilities/                         # Helper functions
└── Resources/                         # Assets and themes
    └── ThemeManager.swift            # Theme management
```

### Data Models

#### JournalEntry
Core model with fields for:
- Content (text)
- Date and timestamps
- Mood and emotions
- Photos and voice notes
- Tags and categories
- Location and weather
- People mentioned
- Writing metadata
- AI analysis (sentiment, themes)
- Special types (letters, time capsules)

#### Category
Custom organization:
- Name, icon, color
- Default vs custom
- Sort order

#### Reminder
Notification settings:
- Title and body
- Time and repeat schedule
- Reminder type (daily, morning, evening, etc.)

#### GratitudeGoal
Progress tracking:
- Goal type and target
- Current progress
- Start and end dates
- Completion status

#### Badge
Achievement system:
- Title and description
- Icon and color
- Badge type and category
- Unlock requirements
- Unlock date

## 🚀 Getting Started

### Requirements
- iOS 17.0+
- Xcode 15.0+
- Swift 5.9+

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/gratitude-journal.git
cd gratitude-journal
```

2. **Open in Xcode**
```bash
open GratitudeJournal.xcodeproj
```

3. **Build and Run**
- Select your target device or simulator
- Press `Cmd + R` to build and run

### First Run
1. Complete the onboarding flow
2. Select your preferred theme
3. Grant notification permissions (optional)
4. Start writing your first gratitude entry!

## 📱 Usage Guide

### Writing an Entry
1. Tap the **Write** tab or the **Write Now** button on Home
2. Choose entry type: Regular or Gratitude Letter
3. Select your current mood
4. Write your gratitude thoughts
5. (Optional) Add:
   - Photos
   - Voice notes
   - Tags
   - Categories
   - People mentioned
6. Tap **Save Entry**

### Setting Reminders
1. Go to **Settings** → **Reminders**
2. Tap the **+** button
3. Set time and repeat frequency
4. Save reminder

### Tracking Progress
1. Navigate to the **Insights** tab
2. View your:
   - Current and longest streaks
   - Entry statistics
   - Mood distribution
   - Calendar heatmap
   - Top tags
   - Unlocked badges

### Creating Goals
1. Go to **Settings** → **Goals**
2. Tap **+** to create a new goal
3. Choose goal type and target
4. Track progress in the Insights tab

### Meditating
1. Tap **Quick Actions** → **Meditation** on Home
2. Select duration (3, 5, 10, or 15 minutes)
3. Tap **Start** to begin guided meditation
4. Follow the breathing prompts

## 🎯 Roadmap

### Planned Features
- [ ] iCloud sync across devices
- [ ] iPad and Mac support
- [ ] Apple Watch app for quick entries
- [ ] Widget for home screen
- [ ] Siri shortcuts integration
- [ ] Share extension for quick captures
- [ ] AI-powered insights and suggestions
- [ ] Social features (shared journals, challenges)
- [ ] Integration with Health app
- [ ] Weather API integration
- [ ] Spotify/Apple Music integration
- [ ] More export formats (EPUB, Blog post)
- [ ] Print-ready journal book
- [ ] Time capsule entries
- [ ] Gratitude jar visualization
- [ ] Vision board creator
- [ ] Advanced analytics and reports

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by the positive psychology research on gratitude journaling
- UI/UX design follows Apple's Human Interface Guidelines
- Icons from SF Symbols
- Gratitude quotes from various authors and philosophers

## 📧 Contact

For questions, feedback, or suggestions:
- Create an issue on GitHub
- Email: support@gratitudejournal.app

## 💖 Support

If you find this app helpful, please:
- ⭐ Star the repository
- 📱 Share with friends and family
- 💬 Leave a review on the App Store
- ☕ Buy me a coffee

---

**Made with 💖 and gratitude**

*"Gratitude turns what we have into enough." - Aesop*
