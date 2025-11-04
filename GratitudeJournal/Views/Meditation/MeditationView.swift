//
//  MeditationView.swift
//  GratitudeJournal
//
//  Guided gratitude meditation and mindfulness
//

import SwiftUI

struct MeditationView: View {
    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject var themeManager: ThemeManager
    @EnvironmentObject var audioManager: AudioManager

    @State private var selectedDuration: MeditationDuration = .fiveMinutes
    @State private var isMediating = false
    @State private var timeRemaining: TimeInterval = 300
    @State private var timer: Timer?

    var body: some View {
        NavigationStack {
            ZStack {
                // Background gradient
                LinearGradient(
                    colors: [Color.moodPeaceful, Color.moodCalm],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
                .ignoresSafeArea()

                ScrollView {
                    VStack(spacing: 32) {
                        Spacer()

                        // Meditation circle
                        meditationCircle

                        // Duration selector
                        if !isMediating {
                            durationSelector
                        }

                        // Controls
                        controlButtons

                        // Meditation prompts
                        if !isMediating {
                            meditationPrompts
                        }

                        Spacer()
                    }
                    .padding()
                }
            }
            .navigationTitle("Meditation")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") {
                        stopMeditation()
                        dismiss()
                    }
                    .foregroundColor(.white)
                }
            }
        }
    }

    // MARK: - View Components

    private var meditationCircle: some View {
        ZStack {
            // Outer circle
            Circle()
                .stroke(Color.white.opacity(0.3), lineWidth: 2)
                .frame(width: 200, height: 200)

            // Progress circle
            Circle()
                .trim(from: 0, to: isMediating ? progressValue : 1)
                .stroke(Color.white, style: StrokeStyle(lineWidth: 4, lineCap: .round))
                .frame(width: 200, height: 200)
                .rotationEffect(.degrees(-90))
                .animation(.linear(duration: 1), value: timeRemaining)

            // Inner content
            VStack(spacing: 8) {
                if isMediating {
                    Text(formatTime(timeRemaining))
                        .font(.system(size: 48, weight: .thin))
                        .foregroundColor(.white)

                    Text("Breathe...")
                        .font(.subheadline)
                        .foregroundColor(.white.opacity(0.8))
                } else {
                    Image(systemName: "sparkles")
                        .font(.system(size: 60))
                        .foregroundColor(.white)

                    Text("Begin")
                        .font(.title3)
                        .foregroundColor(.white.opacity(0.8))
                }
            }
        }
        .scaleEffect(isMediating ? 1.05 : 1.0)
        .animation(.easeInOut(duration: 3).repeatForever(autoreverses: true), value: isMediating)
    }

    private var durationSelector: some View {
        VStack(spacing: 16) {
            Text("Select Duration")
                .font(.headline)
                .foregroundColor(.white)

            HStack(spacing: 12) {
                ForEach(MeditationDuration.allCases, id: \.self) { duration in
                    DurationButton(
                        duration: duration,
                        isSelected: selectedDuration == duration,
                        action: {
                            selectedDuration = duration
                            timeRemaining = duration.seconds
                        }
                    )
                }
            }
        }
    }

    private var controlButtons: some View {
        VStack(spacing: 16) {
            Button(action: toggleMeditation) {
                HStack {
                    Image(systemName: isMediating ? "pause.fill" : "play.fill")
                    Text(isMediating ? "Pause" : "Start")
                }
                .font(.title3)
                .fontWeight(.semibold)
                .foregroundColor(Color.moodPeaceful)
                .frame(width: 200)
                .padding()
                .background(.white)
                .cornerRadius(25)
            }

            if isMediating {
                Button(action: stopMeditation) {
                    Text("Stop")
                        .font(.subheadline)
                        .foregroundColor(.white)
                }
            }
        }
    }

    private var meditationPrompts: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Gratitude Meditation")
                .font(.headline)
                .foregroundColor(.white)

            VStack(alignment: .leading, spacing: 12) {
                PromptStep(number: 1, text: "Find a comfortable position and close your eyes")
                PromptStep(number: 2, text: "Take deep, slow breaths")
                PromptStep(number: 3, text: "Think of three things you're grateful for")
                PromptStep(number: 4, text: "Feel the warmth of gratitude in your heart")
                PromptStep(number: 5, text: "Let that feeling spread throughout your body")
            }
        }
        .padding()
        .background(.white.opacity(0.2))
        .cornerRadius(16)
    }

    // MARK: - Actions

    private func toggleMeditation() {
        isMediating.toggle()

        if isMediating {
            startMeditation()
        } else {
            pauseMeditation()
        }
    }

    private func startMeditation() {
        // Play ambient sound
        audioManager.playAmbientSound(.meditation)

        // Start timer
        timer = Timer.scheduledTimer(withTimeInterval: 1, repeats: true) { _ in
            if timeRemaining > 0 {
                timeRemaining -= 1
            } else {
                completeMeditation()
            }
        }
    }

    private func pauseMeditation() {
        timer?.invalidate()
        audioManager.stopPlayback()
    }

    private func stopMeditation() {
        isMediating = false
        timer?.invalidate()
        timeRemaining = selectedDuration.seconds
        audioManager.stopPlayback()
    }

    private func completeMeditation() {
        stopMeditation()
        // Could show completion animation or save meditation session
    }

    private var progressValue: Double {
        let total = selectedDuration.seconds
        return 1 - (timeRemaining / total)
    }

    private func formatTime(_ time: TimeInterval) -> String {
        let minutes = Int(time) / 60
        let seconds = Int(time) % 60
        return String(format: "%d:%02d", minutes, seconds)
    }
}

// MARK: - Supporting Views

struct DurationButton: View {
    let duration: MeditationDuration
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            VStack(spacing: 4) {
                Text("\(duration.minutes)")
                    .font(.title3)
                    .fontWeight(.semibold)
                Text("min")
                    .font(.caption)
            }
            .foregroundColor(isSelected ? Color.moodPeaceful : .white)
            .frame(width: 70, height: 70)
            .background(isSelected ? .white : .white.opacity(0.2))
            .cornerRadius(16)
        }
    }
}

struct PromptStep: View {
    let number: Int
    let text: String

    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            Text("\(number)")
                .font(.caption)
                .fontWeight(.bold)
                .foregroundColor(Color.moodPeaceful)
                .frame(width: 24, height: 24)
                .background(.white)
                .clipShape(Circle())

            Text(text)
                .font(.subheadline)
                .foregroundColor(.white)
        }
    }
}

enum MeditationDuration: CaseIterable {
    case threeMinutes
    case fiveMinutes
    case tenMinutes
    case fifteenMinutes

    var minutes: Int {
        switch self {
        case .threeMinutes: return 3
        case .fiveMinutes: return 5
        case .tenMinutes: return 10
        case .fifteenMinutes: return 15
        }
    }

    var seconds: TimeInterval {
        TimeInterval(minutes * 60)
    }
}

#Preview {
    MeditationView()
        .environmentObject(ThemeManager())
        .environmentObject(AudioManager())
}
