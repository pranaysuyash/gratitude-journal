/**
 * Goals Screen - Display and manage user goals
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
  FAB,
  ProgressBar,
  Chip,
  ActivityIndicator,
  Snackbar,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ApiService, { Goal } from '../../services/ApiService';
import AnalyticsService, { AnalyticsEvent } from '../../services/AnalyticsService';

type FilterStatus = 'all' | 'active' | 'completed' | 'archived';

export default function GoalsScreen() {
  const navigation = useNavigation();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterStatus>('active');
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    loadGoals();
    AnalyticsService.trackScreenView('goals_screen');
  }, [filter]);

  const loadGoals = async () => {
    try {
      setLoading(true);
      const statusFilter = filter === 'all' ? undefined : filter;
      const response = await ApiService.getGoals(statusFilter);

      if (response.success && response.data) {
        setGoals(response.data);
      } else {
        showSnackbar(response.error || 'Failed to load goals');
      }
    } catch (error) {
      showSnackbar('Error loading goals');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadGoals();
  };

  const handleFilterChange = (newFilter: FilterStatus) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFilter(newFilter);
  };

  const handleGoalPress = (goalId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('GoalDetail' as never, { goalId } as never);
  };

  const handleCreateGoal = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    AnalyticsService.trackEvent(AnalyticsEvent.GOAL_CREATED);
    // Navigate to goal creation screen or show modal
    showSnackbar('Goal creation coming soon!');
  };

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#4CAF50';
      case 'active':
        return '#2196F3';
      case 'archived':
        return '#9E9E9E';
      default:
        return '#666';
    }
  };

  const renderGoalCard = (goal: Goal) => {
    const completedMilestones = goal.milestones.filter(m => m.completed).length;
    const totalMilestones = goal.milestones.length;
    const progress = totalMilestones > 0 ? completedMilestones / totalMilestones : goal.progress / 100;

    return (
      <TouchableOpacity key={goal._id} onPress={() => handleGoalPress(goal._id)}>
        <Card style={styles.goalCard}>
          <Card.Content>
            <View style={styles.goalHeader}>
              <View style={styles.goalTitleContainer}>
                <Text variant="titleLarge" style={styles.goalTitle}>
                  {goal.title}
                </Text>
                <Chip
                  mode="outlined"
                  style={[styles.statusChip, { borderColor: getStatusColor(goal.status) }]}
                  textStyle={{ color: getStatusColor(goal.status), fontSize: 12 }}
                >
                  {goal.status}
                </Chip>
              </View>
              <Icon name="target" size={24} color="#4CAF50" />
            </View>

            <Text variant="bodyMedium" style={styles.goalDescription} numberOfLines={2}>
              {goal.description}
            </Text>

            <View style={styles.categoryContainer}>
              <Icon name="folder" size={16} color="#666" />
              <Text variant="bodySmall" style={styles.categoryText}>
                {goal.category}
              </Text>
            </View>

            <View style={styles.progressContainer}>
              <View style={styles.progressHeader}>
                <Text variant="bodySmall" style={styles.progressLabel}>
                  Progress
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
            </View>

            {totalMilestones > 0 && (
              <View style={styles.milestonesInfo}>
                <Icon name="checkbox-marked-circle" size={16} color="#4CAF50" />
                <Text variant="bodySmall" style={styles.milestonesText}>
                  {completedMilestones}/{totalMilestones} milestones completed
                </Text>
              </View>
            )}

            <View style={styles.goalFooter}>
              <View style={styles.dateContainer}>
                <Icon name="calendar" size={14} color="#666" />
                <Text variant="bodySmall" style={styles.dateText}>
                  Target: {new Date(goal.targetDate).toLocaleDateString()}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        <Chip
          selected={filter === 'all'}
          onPress={() => handleFilterChange('all')}
          style={styles.filterChip}
          showSelectedCheck={false}
        >
          All
        </Chip>
        <Chip
          selected={filter === 'active'}
          onPress={() => handleFilterChange('active')}
          style={styles.filterChip}
          showSelectedCheck={false}
        >
          Active
        </Chip>
        <Chip
          selected={filter === 'completed'}
          onPress={() => handleFilterChange('completed')}
          style={styles.filterChip}
          showSelectedCheck={false}
        >
          Completed
        </Chip>
        <Chip
          selected={filter === 'archived'}
          onPress={() => handleFilterChange('archived')}
          style={styles.filterChip}
          showSelectedCheck={false}
        >
          Archived
        </Chip>
      </ScrollView>

      {/* Goals List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading goals...</Text>
        </View>
      ) : goals.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="target" size={64} color="#ccc" />
          <Text variant="headlineSmall" style={styles.emptyTitle}>
            No Goals Yet
          </Text>
          <Text variant="bodyMedium" style={styles.emptyText}>
            Set your first goal and start tracking your progress!
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.goalsList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          {goals.map(renderGoalCard)}
          <View style={{ height: 80 }} />
        </ScrollView>
      )}

      {/* FAB */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={handleCreateGoal}
        color="#fff"
      />

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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    marginRight: 8,
  },
  goalsList: {
    flex: 1,
    padding: 16,
  },
  goalCard: {
    marginBottom: 16,
    elevation: 2,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  goalTitleContainer: {
    flex: 1,
    marginRight: 8,
  },
  goalTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statusChip: {
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  goalDescription: {
    color: '#666',
    marginBottom: 12,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryText: {
    marginLeft: 4,
    color: '#666',
  },
  progressContainer: {
    marginBottom: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  milestonesInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  milestonesText: {
    marginLeft: 4,
    color: '#666',
  },
  goalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    marginLeft: 4,
    color: '#666',
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
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#4CAF50',
  },
});
