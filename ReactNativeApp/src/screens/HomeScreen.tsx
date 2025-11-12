/**
 * Home Screen
 * Dashboard with stats, streak, and quick actions
 * © 2024 Gratitude Journal. All Rights Reserved.
 */

import React, { useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Text, Card, Button, Avatar, ProgressBar } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { fetchEntries } from '../store/slices/entriesSlice';
import { LineChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }: any) {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { entries, streak } = useSelector((state: RootState) => state.entries);
  const { stats } = useSelector((state: RootState) => state.stats);

  useEffect(() => {
    dispatch(fetchEntries({ page: 1, limit: 10 }) as any);
  }, [dispatch]);

  const recentEntries = entries.slice(0, 3);

  // Prepare mood chart data
  const last7Days = entries.slice(0, 7).reverse();
  const moodData = {
    labels: last7Days.map((_, i) => `D${i + 1}`),
    datasets: [
      {
        data: last7Days.map(e => e.moodScore || 5),
      },
    ],
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text variant="headlineMedium">
            Hello, {user?.displayName || 'there'}! 👋
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
        </View>
        <Avatar.Image
          size={50}
          source={user?.avatar ? { uri: user.avatar } : require('../../assets/default-avatar.png')}
        />
      </View>

      {/* Streak Card */}
      <Card style={styles.streakCard}>
        <Card.Content>
          <View style={styles.streakContent}>
            <View style={styles.streakIcon}>
              <Text style={styles.fireEmoji}>🔥</Text>
            </View>
            <View style={styles.streakInfo}>
              <Text variant="headlineLarge" style={styles.streakNumber}>
                {streak}
              </Text>
              <Text variant="bodyMedium">Day Streak</Text>
            </View>
            <View style={styles.streakStats}>
              <Text variant="bodySmall">Longest: {user?.stats?.longestStreak || 0}</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Quick Stats */}
      <View style={styles.statsGrid}>
        <Card style={styles.statCard}>
          <Card.Content>
            <Text variant="headlineMedium" style={styles.statNumber}>
              {stats?.totalEntries || 0}
            </Text>
            <Text variant="bodySmall">Total Entries</Text>
          </Card.Content>
        </Card>

        <Card style={styles.statCard}>
          <Card.Content>
            <Text variant="headlineMedium" style={styles.statNumber}>
              {user?.stats?.level || 1}
            </Text>
            <Text variant="bodySmall">Level</Text>
          </Card.Content>
        </Card>

        <Card style={styles.statCard}>
          <Card.Content>
            <Text variant="headlineMedium" style={styles.statNumber}>
              {user?.stats?.badges?.length || 0}
            </Text>
            <Text variant="bodySmall">Badges</Text>
          </Card.Content>
        </Card>
      </View>

      {/* Mood Trend */}
      {last7Days.length > 0 && (
        <Card style={styles.chartCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>
              Mood Trend (Last 7 Days)
            </Text>
            <LineChart
              data={moodData}
              width={width - 60}
              height={180}
              chartConfig={{
                backgroundColor: '#fff',
                backgroundGradientFrom: '#fff',
                backgroundGradientTo: '#fff',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
              }}
              bezier
              style={styles.chart}
            />
          </Card.Content>
        </Card>
      )}

      {/* Quick Actions */}
      <Card style={styles.actionsCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.cardTitle}>
            Quick Actions
          </Text>
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('NewEntry')}
            >
              <Text style={styles.actionIcon}>✍️</Text>
              <Text variant="bodySmall">Write Entry</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('Goals')}
            >
              <Text style={styles.actionIcon}>🎯</Text>
              <Text variant="bodySmall">View Goals</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('Analytics')}
            >
              <Text style={styles.actionIcon}>📊</Text>
              <Text variant="bodySmall">Analytics</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('Badges')}
            >
              <Text style={styles.actionIcon}>🏆</Text>
              <Text variant="bodySmall">Badges</Text>
            </TouchableOpacity>
          </View>
        </Card.Content>
      </Card>

      {/* Recent Entries */}
      {recentEntries.length > 0 && (
        <Card style={styles.recentCard}>
          <Card.Content>
            <View style={styles.recentHeader}>
              <Text variant="titleMedium">Recent Entries</Text>
              <Button onPress={() => navigation.navigate('Journal')}>View All</Button>
            </View>

            {recentEntries.map(entry => (
              <TouchableOpacity
                key={entry.id}
                style={styles.entryItem}
                onPress={() => navigation.navigate('EntryDetail', { id: entry.id })}
              >
                <View style={styles.entryContent}>
                  <Text variant="bodyMedium" numberOfLines={1} style={styles.entryTitle}>
                    {entry.title || entry.content.substring(0, 50)}
                  </Text>
                  <Text variant="bodySmall" style={styles.entryDate}>
                    {new Date(entry.date).toLocaleDateString()}
                  </Text>
                </View>
                <Text style={styles.moodEmoji}>{getMoodEmoji(entry.mood)}</Text>
              </TouchableOpacity>
            ))}
          </Card.Content>
        </Card>
      )}

      {/* Daily Prompt */}
      <Card style={styles.promptCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.cardTitle}>
            Today's Prompt 💭
          </Text>
          <Text variant="bodyMedium" style={styles.promptText}>
            What small moment today made you smile?
          </Text>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('NewEntry')}
            style={styles.promptButton}
          >
            Write About It
          </Button>
        </Card.Content>
      </Card>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

function getMoodEmoji(mood: string): string {
  const moodMap: any = {
    amazing: '🤩',
    great: '😊',
    good: '🙂',
    okay: '😐',
    sad: '😔',
    anxious: '😰',
    angry: '😠',
  };
  return moodMap[mood] || '🙂';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  subtitle: {
    color: '#666',
    marginTop: 4,
  },
  streakCard: {
    margin: 16,
    marginBottom: 8,
  },
  streakContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakIcon: {
    marginRight: 16,
  },
  fireEmoji: {
    fontSize: 48,
  },
  streakInfo: {
    flex: 1,
  },
  streakNumber: {
    fontWeight: 'bold',
    color: '#FF5722',
  },
  streakStats: {
    alignItems: 'flex-end',
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
  },
  statCard: {
    flex: 1,
    marginBottom: 8,
  },
  statNumber: {
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  chartCard: {
    margin: 16,
    marginTop: 8,
  },
  cardTitle: {
    marginBottom: 12,
    fontWeight: 'bold',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  actionsCard: {
    margin: 16,
    marginTop: 8,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  actionButton: {
    alignItems: 'center',
    padding: 12,
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  recentCard: {
    margin: 16,
    marginTop: 8,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  entryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  entryContent: {
    flex: 1,
  },
  entryTitle: {
    fontWeight: '500',
  },
  entryDate: {
    color: '#666',
    marginTop: 4,
  },
  moodEmoji: {
    fontSize: 24,
  },
  promptCard: {
    margin: 16,
    marginTop: 8,
  },
  promptText: {
    fontStyle: 'italic',
    color: '#666',
    marginBottom: 12,
  },
  promptButton: {
    marginTop: 8,
  },
  bottomPadding: {
    height: 32,
  },
});
