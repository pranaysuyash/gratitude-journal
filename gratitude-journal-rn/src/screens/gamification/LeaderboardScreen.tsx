/**
 * Leaderboard Screen - Display top users by various metrics
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
  Avatar,
  ActivityIndicator,
  Chip,
  Snackbar,
} from 'react-native-paper';
import * as Haptics from 'expo-haptics';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ApiService from '../../services/ApiService';
import AnalyticsService from '../../services/AnalyticsService';

type TimeframeType = 'week' | 'month' | 'all';

interface LeaderboardUser {
  _id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  level: number;
  stats: {
    currentStreak: number;
    totalEntries: number;
  };
  rank?: number;
}

export default function LeaderboardScreen() {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeframe, setTimeframe] = useState<TimeframeType>('week');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    loadLeaderboard();
    loadCurrentUser();
    AnalyticsService.trackScreenView('leaderboard_screen');
  }, [timeframe]);

  const loadCurrentUser = async () => {
    try {
      const response = await ApiService.getCurrentUser();
      if (response.success && response.data) {
        setCurrentUserId(response.data._id);
      }
    } catch (error) {
      console.error('Error loading current user:', error);
    }
  };

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getLeaderboard(timeframe);

      if (response.success && response.data) {
        // Add rank to each user
        const rankedUsers = response.data.map((user: LeaderboardUser, index: number) => ({
          ...user,
          rank: index + 1,
        }));
        setUsers(rankedUsers);
      } else {
        showSnackbar(response.error || 'Failed to load leaderboard');
      }
    } catch (error) {
      showSnackbar('Error loading leaderboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadLeaderboard();
  };

  const handleTimeframeChange = (newTimeframe: TimeframeType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTimeframe(newTimeframe);
  };

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return '#FFD700'; // Gold
      case 2:
        return '#C0C0C0'; // Silver
      case 3:
        return '#CD7F32'; // Bronze
      default:
        return '#666';
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return 'trophy';
      case 2:
        return 'medal';
      case 3:
        return 'medal-outline';
      default:
        return 'numeric';
    }
  };

  const renderUserCard = (user: LeaderboardUser) => {
    const isCurrentUser = user._id === currentUserId;
    const rankColor = getRankColor(user.rank || 0);

    return (
      <Card
        key={user._id}
        style={[styles.userCard, isCurrentUser && styles.currentUserCard]}
      >
        <Card.Content>
          <View style={styles.userRow}>
            {/* Rank */}
            <View style={styles.rankContainer}>
              <Icon
                name={getRankIcon(user.rank || 0)}
                size={24}
                color={rankColor}
              />
              <Text
                variant="titleMedium"
                style={[styles.rankText, { color: rankColor }]}
              >
                #{user.rank}
              </Text>
            </View>

            {/* Avatar and Info */}
            <View style={styles.userInfo}>
              <Avatar.Image
                size={48}
                source={
                  user.avatarUrl
                    ? { uri: user.avatarUrl }
                    : require('../../../assets/default-avatar.png')
                }
              />
              <View style={styles.userDetails}>
                <View style={styles.nameRow}>
                  <Text variant="titleMedium" style={styles.userName}>
                    {user.displayName}
                  </Text>
                  {isCurrentUser && (
                    <Chip
                      mode="flat"
                      compact
                      style={styles.youChip}
                      textStyle={styles.youChipText}
                    >
                      YOU
                    </Chip>
                  )}
                </View>
                <Text variant="bodySmall" style={styles.username}>
                  @{user.username}
                </Text>
              </View>
            </View>

            {/* Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Icon name="fire" size={16} color="#FF5722" />
                <Text variant="bodySmall" style={styles.statValue}>
                  {user.stats.currentStreak}
                </Text>
              </View>
              <View style={styles.statItem}>
                <Icon name="book" size={16} color="#4CAF50" />
                <Text variant="bodySmall" style={styles.statValue}>
                  {user.stats.totalEntries}
                </Text>
              </View>
              <View style={styles.statItem}>
                <Icon name="star" size={16} color="#FFC107" />
                <Text variant="bodySmall" style={styles.statValue}>
                  Lv.{user.level}
                </Text>
              </View>
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      {/* Timeframe Filter */}
      <View style={styles.filterContainer}>
        <Text variant="titleMedium" style={styles.filterTitle}>
          Timeframe
        </Text>
        <View style={styles.filterChips}>
          <Chip
            selected={timeframe === 'week'}
            onPress={() => handleTimeframeChange('week')}
            style={styles.filterChip}
            showSelectedCheck={false}
          >
            Week
          </Chip>
          <Chip
            selected={timeframe === 'month'}
            onPress={() => handleTimeframeChange('month')}
            style={styles.filterChip}
            showSelectedCheck={false}
          >
            Month
          </Chip>
          <Chip
            selected={timeframe === 'all'}
            onPress={() => handleTimeframeChange('all')}
            style={styles.filterChip}
            showSelectedCheck={false}
          >
            All Time
          </Chip>
        </View>
      </View>

      {/* Leaderboard List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading leaderboard...</Text>
        </View>
      ) : users.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="chart-line" size={64} color="#ccc" />
          <Text variant="headlineSmall" style={styles.emptyTitle}>
            No Data Yet
          </Text>
          <Text variant="bodyMedium" style={styles.emptyText}>
            Start journaling to see the leaderboard!
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.leaderboardList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          {/* Top 3 Podium */}
          {users.length >= 3 && (
            <Card style={styles.podiumCard}>
              <Card.Content>
                <View style={styles.podium}>
                  {/* Second Place */}
                  <View style={styles.podiumItem}>
                    <Avatar.Image
                      size={60}
                      source={
                        users[1].avatarUrl
                          ? { uri: users[1].avatarUrl }
                          : require('../../../assets/default-avatar.png')
                      }
                    />
                    <Icon name="medal" size={32} color="#C0C0C0" style={styles.podiumBadge} />
                    <Text variant="titleSmall" style={styles.podiumName}>
                      {users[1].displayName}
                    </Text>
                    <Text variant="bodySmall" style={styles.podiumRank}>
                      #2
                    </Text>
                  </View>

                  {/* First Place */}
                  <View style={[styles.podiumItem, styles.podiumFirst]}>
                    <Avatar.Image
                      size={80}
                      source={
                        users[0].avatarUrl
                          ? { uri: users[0].avatarUrl }
                          : require('../../../assets/default-avatar.png')
                      }
                    />
                    <Icon name="trophy" size={40} color="#FFD700" style={styles.podiumBadge} />
                    <Text variant="titleMedium" style={styles.podiumName}>
                      {users[0].displayName}
                    </Text>
                    <Text variant="bodySmall" style={styles.podiumRank}>
                      #1
                    </Text>
                  </View>

                  {/* Third Place */}
                  <View style={styles.podiumItem}>
                    <Avatar.Image
                      size={60}
                      source={
                        users[2].avatarUrl
                          ? { uri: users[2].avatarUrl }
                          : require('../../../assets/default-avatar.png')
                      }
                    />
                    <Icon name="medal-outline" size={32} color="#CD7F32" style={styles.podiumBadge} />
                    <Text variant="titleSmall" style={styles.podiumName}>
                      {users[2].displayName}
                    </Text>
                    <Text variant="bodySmall" style={styles.podiumRank}>
                      #3
                    </Text>
                  </View>
                </View>
              </Card.Content>
            </Card>
          )}

          {/* Rest of Users */}
          <View style={styles.usersList}>
            {users.map(renderUserCard)}
            <View style={{ height: 16 }} />
          </View>
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
  filterContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterTitle: {
    marginBottom: 8,
    fontWeight: 'bold',
  },
  filterChips: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    flex: 1,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
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
  leaderboardList: {
    flex: 1,
  },
  podiumCard: {
    margin: 16,
    marginBottom: 8,
  },
  podium: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingVertical: 16,
  },
  podiumItem: {
    alignItems: 'center',
    marginHorizontal: 8,
    position: 'relative',
  },
  podiumFirst: {
    marginBottom: 20,
  },
  podiumBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
  },
  podiumName: {
    marginTop: 8,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  podiumRank: {
    color: '#666',
  },
  usersList: {
    padding: 16,
    paddingTop: 8,
  },
  userCard: {
    marginBottom: 12,
  },
  currentUserCard: {
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rankContainer: {
    alignItems: 'center',
    marginRight: 12,
    minWidth: 40,
  },
  rankText: {
    fontWeight: 'bold',
    fontSize: 12,
    marginTop: 2,
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  userDetails: {
    marginLeft: 12,
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userName: {
    fontWeight: 'bold',
  },
  username: {
    color: '#666',
  },
  youChip: {
    height: 20,
    backgroundColor: '#4CAF50',
  },
  youChipText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'column',
    gap: 4,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontWeight: 'bold',
  },
});
