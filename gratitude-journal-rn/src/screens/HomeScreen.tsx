/**
 * Home Screen - Main Dashboard
 * © 2024 Gratitude Journal. All Rights Reserved.
 */

import React, { useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Text, Card, Avatar, Button, ProgressBar } from 'react-native-paper';
import { LineChart } from 'react-native-chart-kit';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const navigation = useNavigation();
  const [stats, setStats] = React.useState({
    currentStreak: 7,
    longestStreak: 14,
    totalEntries: 45,
    level: 3,
    experience: 280,
    nextLevelXP: 300,
    badges: 5
  });

  const mockMoodData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{ data: [6, 7, 8, 7, 9, 8, 9] }]
  };

  const handleWriteEntry = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('NewEntry' as never);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text variant="headlineMedium" style={styles.greeting}>
            Hello! 👋
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric'
            })}
          </Text>
        </View>
        <Avatar.Image
          size={50}
          source={require('../../assets/default-avatar.png')}
        />
      </View>

      {/* Streak Card */}
      <Card style={styles.streakCard}>
        <Card.Content>
          <View style={styles.streakContent}>
            <Text style={styles.fireEmoji}>🔥</Text>
            <View style={styles.streakInfo}>
              <Text variant="headlineLarge" style={styles.streakNumber}>
                {stats.currentStreak}
              </Text>
              <Text variant="titleMedium">Day Streak</Text>
            </View>
            <View>
              <Text variant="bodySmall" style={styles.longestStreak}>
                Longest: {stats.longestStreak} days
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <Card style={styles.statCard}>
          <Card.Content>
            <Text variant="headlineMedium" style={styles.statNumber}>
              {stats.totalEntries}
            </Text>
            <Text variant="bodySmall">Entries</Text>
          </Card.Content>
        </Card>

        <Card style={styles.statCard}>
          <Card.Content>
            <Text variant="headlineMedium" style={styles.statNumber}>
              {stats.level}
            </Text>
            <Text variant="bodySmall">Level</Text>
          </Card.Content>
        </Card>

        <Card style={styles.statCard}>
          <Card.Content>
            <Text variant="headlineMedium" style={styles.statNumber}>
              {stats.badges}
            </Text>
            <Text variant="bodySmall">Badges</Text>
          </Card.Content>
        </Card>
      </View>

      {/* Level Progress */}
      <Card style={styles.levelCard}>
        <Card.Content>
          <View style={styles.levelHeader}>
            <Text variant="titleMedium">Level {stats.level}</Text>
            <Text variant="bodySmall">{stats.experience}/{stats.nextLevelXP} XP</Text>
          </View>
          <ProgressBar
            progress={stats.experience / stats.nextLevelXP}
            color="#4CAF50"
            style={styles.progressBar}
          />
        </Card.Content>
      </Card>

      {/* Mood Chart */}
      <Card style={styles.chartCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.cardTitle}>
            Mood Trend (Last 7 Days)
          </Text>
          <LineChart
            data={mockMoodData}
            width={width - 60}
            height={180}
            chartConfig={{
              backgroundColor: '#fff',
              backgroundGradientFrom: '#fff',
              backgroundGradientTo: '#fff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
              style: { borderRadius: 16 }
            }}
            bezier
            style={styles.chart}
          />
        </Card.Content>
      </Card>

      {/* Quick Actions */}
      <Card style={styles.actionsCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.cardTitle}>
            Quick Actions
          </Text>
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleWriteEntry}
            >
              <Text style={styles.actionIcon}>✍️</Text>
              <Text variant="bodySmall">Write</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionIcon}>🎯</Text>
              <Text variant="bodySmall">Goals</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionIcon}>📊</Text>
              <Text variant="bodySmall">Analytics</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionIcon}>🏆</Text>
              <Text variant="bodySmall">Badges</Text>
            </TouchableOpacity>
          </View>
        </Card.Content>
      </Card>

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
            onPress={handleWriteEntry}
            style={styles.promptButton}
          >
            Write About It
          </Button>
        </Card.Content>
      </Card>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
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
  greeting: {
    fontWeight: 'bold',
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
  fireEmoji: {
    fontSize: 48,
    marginRight: 16,
  },
  streakInfo: {
    flex: 1,
  },
  streakNumber: {
    fontWeight: 'bold',
    color: '#FF5722',
  },
  longestStreak: {
    color: '#666',
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
  levelCard: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
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
});
