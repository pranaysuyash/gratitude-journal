//
//  AudioManager.swift
//  GratitudeJournal
//
//  Manages audio recording and playback for voice notes and meditation
//

import Foundation
import AVFoundation
import SwiftUI

class AudioManager: NSObject, ObservableObject {
    @Published var isRecording = false
    @Published var isPlaying = false
    @Published var recordingDuration: TimeInterval = 0
    @Published var playbackProgress: Double = 0

    private var audioRecorder: AVAudioRecorder?
    private var audioPlayer: AVAudioPlayer?
    private var recordingTimer: Timer?
    private var playbackTimer: Timer?

    func startRecording(for entryId: UUID) {
        let audioSession = AVAudioSession.sharedInstance()

        do {
            try audioSession.setCategory(.playAndRecord, mode: .default)
            try audioSession.setActive(true)

            let documentsPath = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
            let audioFilename = documentsPath.appendingPathComponent("\(entryId.uuidString).m4a")

            let settings = [
                AVFormatIDKey: Int(kAudioFormatMPEG4AAC),
                AVSampleRateKey: 12000,
                AVNumberOfChannelsKey: 1,
                AVEncoderAudioQualityKey: AVAudioQuality.high.rawValue
            ]

            audioRecorder = try AVAudioRecorder(url: audioFilename, settings: settings)
            audioRecorder?.record()

            isRecording = true
            recordingDuration = 0

            recordingTimer = Timer.scheduledTimer(withTimeInterval: 0.1, repeats: true) { [weak self] _ in
                self?.recordingDuration += 0.1
            }
        } catch {
            print("Failed to start recording: \(error.localizedDescription)")
        }
    }

    func stopRecording() -> String? {
        audioRecorder?.stop()
        recordingTimer?.invalidate()
        isRecording = false

        return audioRecorder?.url.lastPathComponent
    }

    func playAudio(filename: String) {
        let documentsPath = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
        let audioURL = documentsPath.appendingPathComponent(filename)

        do {
            audioPlayer = try AVAudioPlayer(contentsOf: audioURL)
            audioPlayer?.delegate = self
            audioPlayer?.play()
            isPlaying = true

            playbackTimer = Timer.scheduledTimer(withTimeInterval: 0.1, repeats: true) { [weak self] _ in
                guard let self = self, let player = self.audioPlayer else { return }
                self.playbackProgress = player.currentTime / player.duration
            }
        } catch {
            print("Failed to play audio: \(error.localizedDescription)")
        }
    }

    func stopPlayback() {
        audioPlayer?.stop()
        playbackTimer?.invalidate()
        isPlaying = false
        playbackProgress = 0
    }

    func playAmbientSound(_ sound: AmbientSound) {
        guard let url = Bundle.main.url(forResource: sound.rawValue, withExtension: "mp3") else {
            print("Audio file not found")
            return
        }

        do {
            audioPlayer = try AVAudioPlayer(contentsOf: url)
            audioPlayer?.numberOfLoops = -1 // Loop indefinitely
            audioPlayer?.volume = 0.3
            audioPlayer?.play()
            isPlaying = true
        } catch {
            print("Failed to play ambient sound: \(error.localizedDescription)")
        }
    }
}

extension AudioManager: AVAudioPlayerDelegate {
    func audioPlayerDidFinishPlaying(_ player: AVAudioPlayer, successfully flag: Bool) {
        isPlaying = false
        playbackProgress = 0
        playbackTimer?.invalidate()
    }
}

enum AmbientSound: String, CaseIterable {
    case rain = "rain"
    case ocean = "ocean"
    case forest = "forest"
    case fireplace = "fireplace"
    case whitenoise = "whitenoise"
    case cafe = "cafe"
    case meditation = "meditation"

    var displayName: String {
        rawValue.capitalized
    }

    var icon: String {
        switch self {
        case .rain: return "cloud.rain.fill"
        case .ocean: return "water.waves"
        case .forest: return "leaf.fill"
        case .fireplace: return "flame.fill"
        case .whitenoise: return "waveform"
        case .cafe: return "cup.and.saucer.fill"
        case .meditation: return "sparkles"
        }
    }
}
