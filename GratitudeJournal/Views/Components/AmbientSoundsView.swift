//
//  AmbientSoundsView.swift
//  GratitudeJournal
//
//  Ambient sounds for focused writing
//

import SwiftUI

struct AmbientSoundsView: View {
    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject var themeManager: ThemeManager
    @EnvironmentObject var audioManager: AudioManager

    @Binding var selectedSound: AmbientSound?

    var body: some View {
        NavigationStack {
            List {
                ForEach(AmbientSound.allCases, id: \.self) { sound in
                    Button(action: {
                        toggleSound(sound)
                    }) {
                        HStack(spacing: 16) {
                            ZStack {
                                Circle()
                                    .fill(themeManager.currentTheme.primaryColor.opacity(0.2))
                                    .frame(width: 50, height: 50)

                                Image(systemName: sound.icon)
                                    .font(.title3)
                                    .foregroundColor(themeManager.currentTheme.accentColor)
                            }

                            VStack(alignment: .leading, spacing: 4) {
                                Text(sound.displayName)
                                    .font(.headline)
                                    .foregroundColor(themeManager.currentTheme.textPrimary)

                                Text("Calming ambient sound")
                                    .font(.caption)
                                    .foregroundColor(themeManager.currentTheme.textSecondary)
                            }

                            Spacer()

                            if selectedSound == sound && audioManager.isPlaying {
                                Image(systemName: "speaker.wave.3.fill")
                                    .foregroundColor(themeManager.currentTheme.accentColor)
                                    .symbolEffect(.variableColor.iterative)
                            }
                        }
                        .padding(.vertical, 8)
                    }
                }

                Section {
                    Button(action: stopAllSounds) {
                        HStack {
                            Spacer()
                            Text("Stop All Sounds")
                                .foregroundColor(.red)
                            Spacer()
                        }
                    }
                }
            }
            .navigationTitle("Ambient Sounds")
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

    private func toggleSound(_ sound: AmbientSound) {
        if selectedSound == sound && audioManager.isPlaying {
            audioManager.stopPlayback()
            selectedSound = nil
        } else {
            audioManager.playAmbientSound(sound)
            selectedSound = sound
        }
    }

    private func stopAllSounds() {
        audioManager.stopPlayback()
        selectedSound = nil
    }
}

#Preview {
    AmbientSoundsView(selectedSound: .constant(nil))
        .environmentObject(ThemeManager())
        .environmentObject(AudioManager())
}
