/**
 * Goal Detail Screen - View and manage individual goal
 * © 2024 Gratitude Journal. All Rights Reserved.
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  ProgressBar,
  Checkbox,
  ActivityIndicator,
  IconButton,
  Snackbar,
  Menu,
  Divider,
} from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ApiService, { Goal } from '../../services/ApiService';
import AnalyticsService, { AnalyticsEvent } from '../../services/AnalyticsService';

export default function GoalDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { goalId } = route.params as { goalId: string };

  const [goal, setGoal] = useState<Goal | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    loadGoal();
    AnalyticsService.trackScreenView('goal_detail_screen');
  }, [goalId]);

  const loadGoal = async () => {
    try {
      setLoading(true);
      // Mock goal data since there's no getGoal by ID endpoint
      const response = await ApiService.getGoals();
      if (response.success && response.data) {
        const foundGoal = response.data.find(g => g._id === goalId);
        if (foundGoal) {
          setGoal(foundGoal);
        } else {
          showSnackbar('Goal not found');
          navigation.goBack();
        }
      }
    } catch (error) {
      showSnackbar('Error loading goal');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleMilestone = async (milestoneIndex: number) => {
    if (!goal) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const updatedMilestones = [...goal.milestones];
    updatedMilestones[milestoneIndex].completed = !updatedMilestones[milestoneIndex].completed;

    const completedCount = updatedMilestones.filter(m => m.completed).length;
    const newProgress = (completedCount / updatedMilestones.length) * 100;

    const response = await ApiService.updateGoal(goal._id, {
      milestones: updatedMilestones,
      progress: newProgress,
    });

    if (response.success && response.data) {
      setGoal(response.data);
      showSnackbar('Milestone updated');

      if (newProgress === 100) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        AnalyticsService.trackEvent(AnalyticsEvent.GOAL_COMPLETED);
      }
    } else {
      showSnackbar(response.error || 'Failed to update milestone');
    }
  };

  const handleEditGoal = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setMenuVisible(false);
    showSnackbar('Edit goal coming soon!');
  };

  const handleArchiveGoal = async () => {
    if (!goal) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setMenuVisible(false);

    const response = await ApiService.updateGoal(goal._id, {
      status: 'archived',
    });

    if (response.success) {
      showSnackbar('Goal archived');
      setTimeout(() => navigation.goBack(), 1500);
    } else {
      showSnackbar(response.error || 'Failed to archive goal');
    }
  };

  const handleDeleteGoal = () => {
    setMenuVisible(false);

    Alert.alert(
      'Delete Goal',
      'Are you sure you want to delete this goal? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (!goal) return;

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            const response = await ApiService.deleteGoal(goal._id);

            if (response.success) {
              showSnackbar('Goal deleted');
              setTimeout(() => navigation.goBack(), 1500);
            } else {
              showSnackbar(response.error || 'Failed to delete goal');
            }
          },
        },
      ]
    );
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading goal...</Text>
      </View>
    );
  }

  if (!goal) {
    return (
      <View style={styles.emptyContainer}>
        <Icon name="alert-circle" size={64} color="#ccc" />
        <Text variant="headlineSmall" style={styles.emptyTitle}>
          Goal Not Found
        </Text>
      </View>
    );
  }

  const completedMilestones = goal.milestones.filter(m => m.completed).length;
  const totalMilestones = goal.milestones.length;
  const progress = totalMilestones > 0 ? completedMilestones / totalMilestones : goal.progress / 100;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        {/* Header Card */}
        <Card style={styles.headerCard}>
          <Card.Content>
            <View style={styles.headerTop}>
              <View style={styles.headerLeft}>
                <Text variant="headlineMedium" style={styles.title}>
                  {goal.title}
                </Text>
                <View style={styles.statusContainer}>
                  <Icon name="flag" size={16} color={getStatusColor(goal.status)} />
                  <Text
                    style={[styles.statusText, { color: getStatusColor(goal.status) }]}
                  >
                    {goal.status.toUpperCase()}
                  </Text>
                </View>
              </View>
              <Menu
                visible={menuVisible}
                onDismiss={() => setMenuVisible(false)}
                anchor={
                  <IconButton
                    icon="dots-vertical"
                    onPress={() => setMenuVisible(true)}
                  />
                }
              >
                <Menu.Item onPress={handleEditGoal} title="Edit" leadingIcon="pencil" />
                <Menu.Item onPress={handleArchiveGoal} title="Archive" leadingIcon="archive" />
                <Divider />
                <Menu.Item onPress={handleDeleteGoal} title="Delete" leadingIcon="delete" />
              </Menu>
            </View>

            <Text variant="bodyLarge" style={styles.description}>
              {goal.description}
            </Text>

            <View style={styles.categoryRow}>
              <Icon name="folder" size={18} color="#666" />
              <Text style={styles.categoryText}>{goal.category}</Text>
            </View>

            <View style={styles.dateRow}>
              <Icon name="calendar" size={18} color="#666" />
              <Text style={styles.dateText}>
                Target: {new Date(goal.targetDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Progress Card */}
        <Card style={styles.progressCard}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Overall Progress
            </Text>
            <View style={styles.progressContainer}>
              <Text variant="displaySmall" style={styles.progressNumber}>
                {Math.round(progress * 100)}%
              </Text>
              <ProgressBar
                progress={progress}
                color="#4CAF50"
                style={styles.progressBar}
              />
            </View>
          </Card.Content>
        </Card>

        {/* Milestones Card */}
        {totalMilestones > 0 && (
          <Card style={styles.milestonesCard}>
            <Card.Content>
              <Text variant="titleLarge" style={styles.sectionTitle}>
                Milestones ({completedMilestones}/{totalMilestones})
              </Text>
              {goal.milestones.map((milestone, index) => (
                <View key={index} style={styles.milestoneItem}>
                  <Checkbox
                    status={milestone.completed ? 'checked' : 'unchecked'}
                    onPress={() => handleToggleMilestone(index)}
                    color="#4CAF50"
                  />
                  <Text
                    variant="bodyLarge"
                    style={[
                      styles.milestoneText,
                      milestone.completed && styles.milestoneCompleted,
                    ]}
                  >
                    {milestone.title}
                  </Text>
                  {milestone.completed && (
                    <Icon name="check-circle" size={20} color="#4CAF50" />
                  )}
                </View>
              ))}
            </Card.Content>
          </Card>
        )}

        {/* Actions Card */}
        <Card style={styles.actionsCard}>
          <Card.Content>
            <Button
              mode="contained"
              icon="pencil"
              onPress={handleEditGoal}
              style={styles.actionButton}
            >
              Edit Goal
            </Button>
            {goal.status === 'active' && progress === 1 && (
              <Button
                mode="contained"
                icon="trophy"
                onPress={async () => {
                  const response = await ApiService.updateGoal(goal._id, {
                    status: 'completed',
                  });
                  if (response.success) {
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    showSnackbar('Goal completed! 🎉');
                    loadGoal();
                  }
                }}
                style={[styles.actionButton, styles.completeButton]}
                buttonColor="#4CAF50"
              >
                Mark as Completed
              </Button>
            )}
          </Card.Content>
        </Card>

        <View style={{ height: 32 }} />
      </ScrollView>

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
  content: {
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
  headerCard: {
    margin: 16,
    marginBottom: 8,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    marginLeft: 4,
    fontWeight: 'bold',
    fontSize: 12,
  },
  description: {
    color: '#666',
    marginBottom: 16,
    lineHeight: 24,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 14,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 14,
  },
  progressCard: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressNumber: {
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 16,
  },
  progressBar: {
    width: '100%',
    height: 12,
    borderRadius: 6,
  },
  milestonesCard: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  milestoneItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  milestoneText: {
    flex: 1,
    marginLeft: 8,
  },
  milestoneCompleted: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  actionsCard: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  actionButton: {
    marginBottom: 12,
  },
  completeButton: {
    marginTop: 8,
  },
});
