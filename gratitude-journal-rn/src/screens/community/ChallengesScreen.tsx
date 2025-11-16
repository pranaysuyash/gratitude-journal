/**
 * Challenges Screen - Community challenges and competitions
 * © 2024 Gratitude Journal. All Rights Reserved.
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  ProgressBar,
  ActivityIndicator,
  Chip,
  Snackbar,
  Avatar,
} from 'react-native-paper';
import * as Haptics from 'expo-haptics';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ApiService from '../../services/ApiService';
import AnalyticsService from '../../services/AnalyticsService';

interface Challenge {
  _id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly';
  goal: number;
  reward: {
    points: number;
    badge?: string;
  };
  startDate: string;
  endDate: string;
  participants: number;
  isJoined: boolean;
  progress?: number;
  status: 'active' | 'upcoming' | 'completed';
}

export default function ChallengesScreen() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    loadChallenges();
    AnalyticsService.trackScreenView('challenges_screen');
  }, []);

  const loadChallenges = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getChallenges();

      if (response.success && response.data) {
        setChallenges(response.data);
      } else {
        showSnackbar(response.error || 'Failed to load challenges');
      }
    } catch (error) {
      showSnackbar('Error loading challenges');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadChallenges();
  };

  const handleJoinChallenge = async (challengeId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const response = await ApiService.joinChallenge(challengeId);

    if (response.success) {
      showSnackbar('Joined challenge!');
      setChallenges(prev =>
        prev.map(c =>
          c._id === challengeId
            ? { ...c, isJoined: true, participants: c.participants + 1 }
            : c
        )
      );
    } else {
      showSnackbar(response.error || 'Failed to join challenge');
    }
  };

  const handleLeaveChallenge = async (challengeId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // API call would go here
    showSnackbar('Left challenge');
    setChallenges(prev =>
      prev.map(c =>
        c._id === challengeId
          ? { ...c, isJoined: false, participants: c.participants - 1 }
          : c
      )
    );
  };

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  const getChallengeIcon = (type: string) => {
    switch (type) {
      case 'daily':
        return 'calendar-today';
      case 'weekly':
        return 'calendar-week';
      case 'monthly':
        return 'calendar-month';
      default:
        return 'trophy';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#4CAF50';
      case 'upcoming':
        return '#2196F3';
      case 'completed':
        return '#9E9E9E';
      default:
        return '#666';
    }
  };

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  const renderChallenge = (challenge: Challenge) => {
    const daysRemaining = getDaysRemaining(challenge.endDate);
    const progress = challenge.progress || 0;

    return (
      <Card key={challenge._id} style={styles.challengeCard}>
        <Card.Content>
          {/* Header */}
          <View style={styles.challengeHeader}>
            <View style={styles.headerLeft}>
              <Icon
                name={getChallengeIcon(challenge.type)}
                size={32}
                color="#4CAF50"
              />
              <View style={styles.headerText}>
                <Text variant="titleLarge" style={styles.challengeTitle}>
                  {challenge.title}
                </Text>
                <View style={styles.chipRow}>
                  <Chip
                    mode="outlined"
                    compact
                    style={[
                      styles.statusChip,
                      { borderColor: getStatusColor(challenge.status) },
                    ]}
                    textStyle={{ color: getStatusColor(challenge.status) }}
                  >
                    {challenge.status}
                  </Chip>
                  <Chip mode="outlined" compact style={styles.typeChip}>
                    {challenge.type}
                  </Chip>
                </View>
              </View>
            </View>
          </View>

          {/* Description */}
          <Text variant="bodyMedium" style={styles.description}>
            {challenge.description}
          </Text>

          {/* Goal */}
          <View style={styles.goalContainer}>
            <Text variant="titleMedium" style={styles.goalText}>
              Goal: {challenge.goal} entries
            </Text>
            {challenge.isJoined && (
              <>
                <View style={styles.progressHeader}>
                  <Text variant="bodySmall" style={styles.progressLabel}>
                    Your Progress
                  </Text>
                  <Text variant="bodySmall" style={styles.progressText}>
                    {Math.round(progress * 100)}%
                  </Text>
                </View>
                <ProgressBar
                  progress={progress}
                  color="#4CAF50"
                  style={styles.progressBar}
                />
              </>
            )}
          </View>

          {/* Reward */}
          <View style={styles.rewardContainer}>
            <Icon name="trophy" size={20} color="#FFC107" />
            <Text variant="bodyMedium" style={styles.rewardText}>
              Reward: {challenge.reward.points} points
              {challenge.reward.badge && ` + ${challenge.reward.badge} badge`}
            </Text>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Icon name="account-group" size={18} color="#666" />
              <Text variant="bodySmall" style={styles.statText}>
                {challenge.participants} participants
              </Text>
            </View>
            {challenge.status === 'active' && (
              <View style={styles.statItem}>
                <Icon name="clock-outline" size={18} color="#666" />
                <Text variant="bodySmall" style={styles.statText}>
                  {daysRemaining} days left
                </Text>
              </View>
            )}
          </View>

          {/* Action Button */}
          {challenge.status === 'active' && (
            <Button
              mode={challenge.isJoined ? 'outlined' : 'contained'}
              onPress={() =>
                challenge.isJoined
                  ? handleLeaveChallenge(challenge._id)
                  : handleJoinChallenge(challenge._id)
              }
              style={styles.actionButton}
              icon={challenge.isJoined ? 'exit-to-app' : 'trophy'}
            >
              {challenge.isJoined ? 'Leave Challenge' : 'Join Challenge'}
            </Button>
          )}
          {challenge.status === 'upcoming' && (
            <Button mode="outlined" disabled style={styles.actionButton}>
              Starts {new Date(challenge.startDate).toLocaleDateString()}
            </Button>
          )}
        </Card.Content>
      </Card>
    );
  };

  const activeChallenges = challenges.filter(c => c.status === 'active');
  const upcomingChallenges = challenges.filter(c => c.status === 'upcoming');
  const completedChallenges = challenges.filter(c => c.status === 'completed');

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading challenges...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          {/* Header Card */}
          <Card style={styles.headerCard}>
            <Card.Content>
              <View style={styles.headerContent}>
                <Icon name="trophy-variant" size={48} color="#4CAF50" />
                <View style={styles.headerInfo}>
                  <Text variant="headlineSmall" style={styles.headerTitle}>
                    Community Challenges
                  </Text>
                  <Text variant="bodyMedium" style={styles.headerSubtitle}>
                    Join challenges and compete with the community!
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>

          {/* Active Challenges */}
          {activeChallenges.length > 0 && (
            <>
              <Text variant="titleLarge" style={styles.sectionTitle}>
                Active Challenges
              </Text>
              {activeChallenges.map(renderChallenge)}
            </>
          )}

          {/* Upcoming Challenges */}
          {upcomingChallenges.length > 0 && (
            <>
              <Text variant="titleLarge" style={styles.sectionTitle}>
                Upcoming Challenges
              </Text>
              {upcomingChallenges.map(renderChallenge)}
            </>
          )}

          {/* Completed Challenges */}
          {completedChallenges.length > 0 && (
            <>
              <Text variant="titleLarge" style={styles.sectionTitle}>
                Completed Challenges
              </Text>
              {completedChallenges.map(renderChallenge)}
            </>
          )}

          {challenges.length === 0 && (
            <View style={styles.emptyContainer}>
              <Icon name="trophy-variant-outline" size={64} color="#ccc" />
              <Text variant="headlineSmall" style={styles.emptyTitle}>
                No Challenges Available
              </Text>
              <Text variant="bodyMedium" style={styles.emptyText}>
                Check back soon for new challenges!
              </Text>
            </View>
          )}

          <View style={{ height: 32 }} />
        </ScrollView>
      )}

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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#666',
  },
  content: {
    flex: 1,
  },
  headerCard: {
    margin: 16,
    marginBottom: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
    marginLeft: 16,
  },
  headerTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    color: '#666',
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
  },
  challengeCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    flex: 1,
  },
  headerText: {
    flex: 1,
    marginLeft: 12,
  },
  challengeTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statusChip: {
    height: 28,
  },
  typeChip: {
    height: 28,
  },
  description: {
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  goalContainer: {
    marginBottom: 12,
  },
  goalText: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 4,
  },
  progressLabel: {
    color: '#666',
  },
  progressText: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  rewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  rewardText: {
    marginLeft: 8,
    fontWeight: 'bold',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    color: '#666',
  },
  actionButton: {
    marginTop: 8,
  },
  emptyContainer: {
    paddingVertical: 64,
    alignItems: 'center',
  },
  emptyTitle: {
    marginTop: 16,
    fontWeight: 'bold',
  },
  emptyText: {
    marginTop: 8,
    textAlign: 'center',
    color: '#666',
  },
});
