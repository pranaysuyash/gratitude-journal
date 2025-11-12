//
//  LocationService.swift
//  GratitudeJournal
//
//  Location services using CoreLocation
//  © 2024 Gratitude Journal. All Rights Reserved.
//

import Foundation
import CoreLocation
import MapKit

@MainActor
class LocationService: NSObject, ObservableObject {
    static let shared = LocationService()

    private let locationManager = CLLocationManager()
    @Published var currentLocation: CLLocation?
    @Published var authorizationStatus: CLAuthorizationStatus = .notDetermined
    @Published var isAuthorized = false
    @Published var currentPlacemark: CLPlacemark?

    enum LocationError: LocalizedError {
        case unauthorized
        case locationUnavailable
        case geocodingFailed

        var errorDescription: String? {
            switch self {
            case .unauthorized:
                return "Location services not authorized"
            case .locationUnavailable:
                return "Unable to determine location"
            case .geocodingFailed:
                return "Failed to get location details"
            }
        }
    }

    private override init() {
        super.init()
        locationManager.delegate = self
        locationManager.desiredAccuracy = kCLLocationAccuracyBest
        checkAuthorizationStatus()
    }

    // MARK: - Authorization

    func checkAuthorizationStatus() {
        authorizationStatus = locationManager.authorizationStatus
        isAuthorized = authorizationStatus == .authorizedWhenInUse || authorizationStatus == .authorizedAlways
    }

    func requestAuthorization() {
        locationManager.requestWhenInUseAuthorization()
    }

    // MARK: - Location Fetching

    func getCurrentLocation() async throws -> CLLocation {
        guard isAuthorized else {
            throw LocationError.unauthorized
        }

        locationManager.startUpdatingLocation()

        return try await withCheckedThrowingContinuation { continuation in
            var resumed = false

            DispatchQueue.main.asyncAfter(deadline: .now() + 10) { [weak self] in
                if !resumed {
                    resumed = true
                    self?.locationManager.stopUpdatingLocation()
                    continuation.resume(throwing: LocationError.locationUnavailable)
                }
            }

            if let location = locationManager.location {
                resumed = true
                locationManager.stopUpdatingLocation()
                continuation.resume(returning: location)
            }
        }
    }

    // MARK: - Geocoding

    func reverseGeocode(location: CLLocation) async throws -> CLPlacemark {
        let geocoder = CLGeocoder()

        do {
            let placemarks = try await geocoder.reverseGeocodeLocation(location)
            guard let placemark = placemarks.first else {
                throw LocationError.geocodingFailed
            }

            self.currentPlacemark = placemark
            return placemark
        } catch {
            throw LocationError.geocodingFailed
        }
    }

    func getLocationName(for location: CLLocation) async -> String? {
        do {
            let placemark = try await reverseGeocode(location: location)
            return formatPlacemark(placemark)
        } catch {
            return nil
        }
    }

    private func formatPlacemark(_ placemark: CLPlacemark) -> String {
        var components: [String] = []

        if let name = placemark.name {
            components.append(name)
        }
        if let locality = placemark.locality {
            components.append(locality)
        }
        if let country = placemark.country {
            components.append(country)
        }

        return components.joined(separator: ", ")
    }

    // MARK: - Location for Entry

    func captureLocationForEntry() async -> (location: CLLocation, name: String)? {
        do {
            let location = try await getCurrentLocation()
            let name = await getLocationName(for: location) ?? "Unknown Location"
            return (location, name)
        } catch {
            return nil
        }
    }

    // MARK: - Location-Based Features

    func findEntriesNearby(entries: [JournalEntry], radius: CLLocationDistance = 1000) -> [JournalEntry] {
        guard let currentLoc = currentLocation else { return [] }

        return entries.filter { entry in
            guard let lat = entry.latitude, let lon = entry.longitude else { return false }
            let entryLocation = CLLocation(latitude: lat, longitude: lon)
            let distance = currentLoc.distance(from: entryLocation)
            return distance <= radius
        }
    }

    func groupEntriesByLocation(entries: [JournalEntry]) -> [String: [JournalEntry]] {
        Dictionary(grouping: entries) { entry in
            entry.locationName ?? "Unknown Location"
        }
    }

    func findMostGratefulPlaces(entries: [JournalEntry]) -> [(location: String, count: Int, avgSentiment: Double)] {
        let grouped = groupEntriesByLocation(entries: entries)

        return grouped.map { location, entries in
            let avgSentiment = entries.compactMap { $0.sentimentScore }.reduce(0, +) / Double(entries.count)
            return (location: location, count: entries.count, avgSentiment: avgSentiment)
        }.sorted { $0.avgSentiment > $1.avgSentiment }
    }

    // MARK: - Location-Based Prompts

    func generateLocationPrompts(placemark: CLPlacemark) -> [String] {
        var prompts: [String] = []

        if let locality = placemark.locality {
            prompts.append("What do you love about living in \(locality)?")
        }

        if let name = placemark.name {
            prompts.append("What makes \(name) special to you?")
        }

        if let country = placemark.country {
            prompts.append("What aspects of \(country) are you grateful for?")
        }

        prompts.append("What memories from this place bring you joy?")
        prompts.append("Who have you met here that you're grateful for?")

        return prompts
    }

    // MARK: - Map Annotations

    func createMapAnnotations(entries: [JournalEntry]) -> [MKPointAnnotation] {
        return entries.compactMap { entry in
            guard let lat = entry.latitude, let lon = entry.longitude else { return nil }

            let annotation = MKPointAnnotation()
            annotation.coordinate = CLLocationCoordinate2D(latitude: lat, longitude: lon)
            annotation.title = entry.locationName ?? "Gratitude Entry"
            annotation.subtitle = String(entry.content.prefix(50))
            return annotation
        }
    }

    // MARK: - Distance Calculations

    func calculateTotalDistance(entries: [JournalEntry]) -> CLLocationDistance {
        let locations = entries.compactMap { entry -> CLLocation? in
            guard let lat = entry.latitude, let lon = entry.longitude else { return nil }
            return CLLocation(latitude: lat, longitude: lon)
        }

        guard locations.count > 1 else { return 0 }

        var totalDistance: CLLocationDistance = 0
        for i in 0..<(locations.count - 1) {
            totalDistance += locations[i].distance(from: locations[i + 1])
        }

        return totalDistance
    }

    func formatDistance(_ distance: CLLocationDistance) -> String {
        let formatter = MKDistanceFormatter()
        formatter.unitStyle = .abbreviated
        return formatter.string(fromDistance: distance)
    }

    // MARK: - Location Privacy

    func fuzzyLocation(_ location: CLLocation, radius: CLLocationDistance = 100) -> CLLocation {
        // Add random offset for privacy
        let latOffset = Double.random(in: -radius...radius) / 111320.0 // 1 degree lat ≈ 111.32 km
        let lonOffset = Double.random(in: -radius...radius) / (111320.0 * cos(location.coordinate.latitude * .pi / 180))

        return CLLocation(
            latitude: location.coordinate.latitude + latOffset,
            longitude: location.coordinate.longitude + lonOffset
        )
    }
}

// MARK: - CLLocationManagerDelegate

extension LocationService: CLLocationManagerDelegate {
    nonisolated func locationManagerDidChangeAuthorization(_ manager: CLLocationManager) {
        Task { @MainActor in
            checkAuthorizationStatus()
        }
    }

    nonisolated func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        Task { @MainActor in
            if let location = locations.last {
                self.currentLocation = location
            }
        }
    }

    nonisolated func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
        print("Location error: \(error.localizedDescription)")
    }
}
