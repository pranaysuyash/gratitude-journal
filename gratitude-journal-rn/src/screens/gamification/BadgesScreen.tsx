/**
 * Badges Screen - Display achievements and badges
 * © 2024 Gratitude Journal. All Rights Reserved.
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from 'react-native';
import {
  Text,
  Card,
  ActivityIndicator,
  Portal,
  Modal,
  Button,
  ProgressBar,
  Snackbar,
} from 'react-native-paper';
import * as Haptics from 'expo-haptics';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ApiService, { Badge } from '../../services/ApiService';
import AnalyticsService, { AnalyticsEvent } from '../../services/AnalyticsService';

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2;

// Badge icon mapping
const getBadgeIcon = (iconName: string): string => {
  const iconMap: { [key: string]: string } = {
    'first-entry': 'pencil-circle',
    'week-streak': 'fire',
    'month-streak': 'fire-circle',
    'hundred-entries': 'trophy',
    'social-butterfly': 'account-group',
    'goal-achiever': 'target',
    'early-bird': 'weather-sunset-up',
    'night-owl': 'weather-night',
    'wordsmith': 'book-alphabet',
    'explorer': 'compass',
  };
  return iconMap[iconName] || 'medal';
};

export default function BadgesScreen() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    loadBadges();
    AnalyticsService.trackScreenView('badges_screen');
  }, []);

  const loadBadges = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getBadges();

      if (response.success && response.data) {
        setBadges(response.data);
      } else {
        showSnackbar(response.error || 'Failed to load badges');
      }
    } catch (error) {
      showSnackbar('Error loading badges');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadBadges();
  };

  const handleBadgePress = (badge: Badge) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedBadge(badge);
    setModalVisible(true);

    if (badge.unlocked) {
      AnalyticsService.trackEvent('badge_viewed' as AnalyticsEvent, {
        badge_name: badge.name,
      });
    }
  };

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  const renderBadge = (badge: Badge) => {
    const isUnlocked = badge.unlocked || false;
    const iconName = getBadgeIcon(badge.icon);

    return (
      <TouchableOpacity
        key={badge._id}
        onPress={() => handleBadgePress(badge)}
        style={styles.badgeContainer}
      >
        <Card style={[styles.badgeCard, !isUnlocked && styles.badgeCardLocked]}>
          <Card.Content style={styles.badgeContent}>
            <View style={[styles.iconContainer, !isUnlocked && styles.iconContainerLocked]}>
              <Icon
                name={iconName}
                size={40}
                color={isUnlocked ? '#4CAF50' : '#ccc'}
              />
            </View>
            <Text
              variant="titleSmall"
              style={[styles.badgeName, !isUnlocked && styles.badgeNameLocked]}
              numberOfLines={2}
            >
              {badge.name}
            </Text>
            <Text
              variant="bodySmall"
              style={[styles.badgePoints, !isUnlocked && styles.badgePointsLocked]}
            >
              {badge.points} pts
            </Text>
            {!isUnlocked && (
              <View style={styles.lockedOverlay}>
                <Icon name="lock" size={24} color="#999" />
              </View>
            )}
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  const unlockedCount = badges.filter(b => b.unlocked).length;
  const totalCount = badges.length;
  const progress = totalCount > 0 ? unlockedCount / totalCount : 0;

  return (
    <View style={styles.container}>
      {/* Stats Header */}
      <Card style={styles.statsCard}>
        <Card.Content>
          <Text variant="headlineMedium" style={styles.statsTitle}>
            Badge Collection
          </Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text variant="displaySmall" style={styles.statNumber}>
                {unlockedCount}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                Unlocked
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text variant="displaySmall" style={styles.statNumber}>
                {totalCount}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                Total
              </Text>
            </View>
          </View>
          <View style={styles.progressContainer}>
            <Text variant="bodySmall" style={styles.progressLabel}>
              {Math.round(progress * 100)}% Complete
            </Text>
            <ProgressBar
              progress={progress}
              color="#4CAF50"
              style={styles.progressBar}
            />
          </View>
        </Card.Content>
      </Card>

      {/* Badges Grid */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading badges...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.badgesList}
          contentContainerStyle={styles.badgesGrid}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          {badges.map(renderBadge)}
          <View style={{ height: 16, width: '100%' }} />
        </ScrollView>
      )}

      {/* Badge Detail Modal */}
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContent}
        >
          {selectedBadge && (
            <View style={styles.modalInner}>
              <View style={[
                styles.modalIconContainer,
                !selectedBadge.unlocked && styles.iconContainerLocked,
              ]}>
                <Icon
                  name={getBadgeIcon(selectedBadge.icon)}
                  size={80}
                  color={selectedBadge.unlocked ? '#4CAF50' : '#ccc'}
                />
              </View>
              <Text variant="headlineSmall" style={styles.modalTitle}>
                {selectedBadge.name}
              </Text>
              <Text variant="bodyLarge" style={styles.modalDescription}>
                {selectedBadge.description}
              </Text>
              <View style={styles.modalPoints}>
                <Icon name="star" size={20} color="#FFC107" />
                <Text variant="titleMedium" style={styles.modalPointsText}>
                  {selectedBadge.points} Points
                </Text>
              </View>
              {selectedBadge.unlocked ? (
                <View style={styles.unlockedBadge}>
                  <Icon name="check-circle" size={24} color="#4CAF50" />
                  <Text style={styles.unlockedText}>Unlocked!</Text>
                </View>
              ) : (
                <View style={styles.lockedBadge}>
                  <Icon name="lock" size={24} color="#999" />
                  <Text style={styles.lockedText}>Keep going to unlock this badge!</Text>
                </View>
              )}
              <Button
                mode="contained"
                onPress={() => setModalVisible(false)}
                style={styles.modalButton}
              >
                Close
              </Button>
            </View>
          )}
        </Modal>
      </Portal>

      {/* Snackbar */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        action={{
          label: 'Dismiss',
          onPress: () => setSnackbarVisible(false),
        }}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  statsCard: {
    margin: 16,
    marginBottom: 8,
  },
  statsTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#e0e0e0',
  },
  statNumber: {
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  statLabel: {
    color: '#666',
    marginTop: 4,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressLabel: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  badgesList: {
    flex: 1,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
  },
  badgeContainer: {
    width: cardWidth,
    marginRight: 16,
    marginBottom: 16,
  },
  badgeCard: {
    height: 180,
  },
  badgeCardLocked: {
    opacity: 0.7,
  },
  badgeContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainerLocked: {
    backgroundColor: '#f5f5f5',
  },
  badgeName: {
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  badgeNameLocked: {
    color: '#999',
  },
  badgePoints: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  badgePointsLocked: {
    color: '#999',
  },
  lockedOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#666',
  },
  modalContent: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 16,
    padding: 24,
  },
  modalInner: {
    alignItems: 'center',
  },
  modalIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  modalDescription: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 16,
  },
  modalPoints: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalPointsText: {
    marginLeft: 8,
    fontWeight: 'bold',
  },
  unlockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
  },
  unlockedText: {
    marginLeft: 8,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  lockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
  },
  lockedText: {
    marginLeft: 8,
    color: '#999',
  },
  modalButton: {
    marginTop: 8,
    width: '100%',
  },
});
