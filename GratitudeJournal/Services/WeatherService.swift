//
//  WeatherService.swift
//  GratitudeJournal
//
//  Weather integration using WeatherKit
//  © 2024 Gratitude Journal. All Rights Reserved.
//

import Foundation
import WeatherKit
import CoreLocation

@MainActor
class WeatherService: ObservableObject {
    static let shared = WeatherService()

    private let weatherService = WeatherKit.WeatherService.shared
    @Published var currentWeather: CurrentWeather?
    @Published var isLoading = false
    @Published var error: WeatherError?

    enum WeatherError: LocalizedError {
        case locationUnavailable
        case weatherDataUnavailable
        case unauthorized

        var errorDescription: String? {
            switch self {
            case .locationUnavailable:
                return "Location services are not available"
            case .weatherDataUnavailable:
                return "Unable to fetch weather data"
            case .unauthorized:
                return "Weather data access not authorized"
            }
        }
    }

    private init() {}

    // MARK: - Fetch Current Weather

    func fetchWeather(for location: CLLocation) async throws -> CurrentWeather {
        isLoading = true
        defer { isLoading = false }

        do {
            let weather = try await weatherService.weather(for: location)
            self.currentWeather = weather.currentWeather
            return weather.currentWeather
        } catch {
            self.error = .weatherDataUnavailable
            throw WeatherError.weatherDataUnavailable
        }
    }

    func fetchWeather(latitude: Double, longitude: Double) async throws -> CurrentWeather {
        let location = CLLocation(latitude: latitude, longitude: longitude)
        return try await fetchWeather(for: location)
    }

    // MARK: - Weather for Entry

    func getWeatherForEntry(location: CLLocation) async -> (condition: String, temperature: Double, emoji: String)? {
        do {
            let weather = try await fetchWeather(for: location)
            return (
                condition: weather.condition.description,
                temperature: weather.temperature.value,
                emoji: weatherEmoji(for: weather.condition)
            )
        } catch {
            return nil
        }
    }

    // MARK: - Weather Forecasts

    func fetchDailyForecast(for location: CLLocation, days: Int = 7) async throws -> [DayWeather] {
        do {
            let weather = try await weatherService.weather(for: location)
            return Array(weather.dailyForecast.forecast.prefix(days))
        } catch {
            throw WeatherError.weatherDataUnavailable
        }
    }

    func fetchHourlyForecast(for location: CLLocation, hours: Int = 24) async throws -> [HourWeather] {
        do {
            let weather = try await weatherService.weather(for: location)
            return Array(weather.hourlyForecast.forecast.prefix(hours))
        } catch {
            throw WeatherError.weatherDataUnavailable
        }
    }

    // MARK: - Weather Alerts

    func fetchWeatherAlerts(for location: CLLocation) async throws -> [WeatherAlert]? {
        do {
            let weather = try await weatherService.weather(for: location)
            return weather.weatherAlerts
        } catch {
            return nil
        }
    }

    // MARK: - Weather-Based Prompts

    func generateWeatherBasedPrompt(weather: CurrentWeather) -> String {
        let temp = weather.temperature.value
        let condition = weather.condition

        switch condition {
        case .clear, .mostlyClear:
            return "What are you grateful for about this beautiful clear day?"
        case .cloudy, .mostlyCloudy:
            return "Even on cloudy days, what brings light to your life?"
        case .partlyCloudy:
            return "Like the clouds and sun, what balance are you grateful for today?"
        case .rain, .drizzle, .heavyRain:
            return "Rain nourishes the earth. What nourishes your soul today?"
        case .snow, .heavySnow, .blizzard:
            return "What warmth are you grateful for during this cold day?"
        case .thunderstorms, .strongStorms:
            return "Through life's storms, what shelters and comforts you?"
        case .sunny:
            if temp > 25 {
                return "What are you grateful for on this warm, sunny day?"
            } else {
                return "The sun is shining! What else brightens your day?"
            }
        case .windy:
            return "Like the wind, what changes are you grateful for in your life?"
        case .foggy, .haze:
            return "When things seem unclear, what clarity are you grateful for?"
        default:
            return "What weather-related moment made you feel grateful today?"
        }
    }

    // MARK: - Helper Functions

    private func weatherEmoji(for condition: WeatherCondition) -> String {
        switch condition {
        case .clear, .mostlyClear:
            return "☀️"
        case .sunny:
            return "🌞"
        case .partlyCloudy:
            return "⛅️"
        case .cloudy, .mostlyCloudy:
            return "☁️"
        case .rain, .drizzle:
            return "🌧️"
        case .heavyRain:
            return "⛈️"
        case .snow:
            return "🌨️"
        case .heavySnow, .blizzard:
            return "❄️"
        case .thunderstorms, .strongStorms:
            return "⚡️"
        case .windy:
            return "💨"
        case .foggy, .haze:
            return "🌫️"
        case .hot:
            return "🌡️"
        case .cold, .frigid:
            return "🥶"
        default:
            return "🌤️"
        }
    }

    func temperatureDescription(_ temp: Double) -> String {
        switch temp {
        case ..<0:
            return "Freezing"
        case 0..<10:
            return "Cold"
        case 10..<20:
            return "Cool"
        case 20..<25:
            return "Comfortable"
        case 25..<30:
            return "Warm"
        case 30..<35:
            return "Hot"
        default:
            return "Very Hot"
        }
    }

    // MARK: - Weather Analytics

    func analyzeWeatherMoodCorrelation(entries: [JournalEntry]) -> [(condition: String, averageMood: Double)] {
        let weatherGroups = Dictionary(grouping: entries) { $0.weatherCondition ?? "Unknown" }

        return weatherGroups.compactMap { condition, entries in
            let avgMood = entries.compactMap { moodToScore($0.mood) }.reduce(0, +) / Double(entries.count)
            return (condition: condition, averageMood: avgMood)
        }.sorted { $0.averageMood > $1.averageMood }
    }

    private func moodToScore(_ mood: MoodType) -> Double {
        switch mood {
        case .grateful: return 5.0
        case .joyful: return 4.8
        case .peaceful: return 4.5
        case .hopeful: return 4.3
        case .content: return 4.0
        case .reflective: return 3.5
        case .calm: return 3.8
        case .inspired: return 4.6
        case .blessed: return 4.9
        case .thankful: return 4.7
        }
    }
}
