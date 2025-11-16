/**
 * Profile Screen
 * User profile and stats
 * © 2024 Gratitude Journal. All Rights Reserved.
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { Text, Card, Button, Avatar, Divider, IconButton, ProgressBar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ApiService, { User } from '../../services/ApiService';
import AnalyticsService from '../../services/AnalyticsService';

export default function ProfileScreen({ navigation }: any) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
    const unsubscribe = navigation.addListener('focus', loadUserData);
    return unsubscribe;
  }, [navigation]);

  const loadUserData = async () => {
    try {
      const response = await ApiService.getCurrentUser();
      if (response.success && response.data) {
        setUser(response.data);
        await AsyncStorage.setItem('user', JSON.stringify(response.data));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeAvatar = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      Alert.alert('Coming Soon', 'Avatar upload will be available soon!');
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await ApiService.logout();
          await AsyncStorage.clear();
          AnalyticsService.setUserId(null);
          navigation.replace('Auth');
        },
      },
    ]);
  };

  if (!user) return null;

  const levelProgress = (user.experience % 100) / 100;

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <Card style={styles.headerCard}>
        <Card.Content>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={handleChangeAvatar}>
              <Avatar.Image
                size={100}
                source={user.avatarUrl ? { uri: user.avatarUrl } : require('../../assets/default-avatar.png')}
              />
              <IconButton icon="camera" size={20} style={styles.cameraIcon} />
            </TouchableOpacity>
            <View style={styles.userInfo}>
              <Text variant="headlineSmall" style={styles.displayName}>
                {user.displayName}
              </Text>
              <Text variant="bodyMedium" style={styles.username}>
                @{user.username}
              </Text>
              {user.bio && <Text variant="bodySmall" style={styles.bio}>{user.bio}</Text>}
            </View>
          </View>

          {/* Level & Experience */}
          <View style={styles.levelContainer}>
            <View style={styles.levelHeader}>
              <Text variant="titleMedium">Level {user.level}</Text>
              <Text variant="bodySmall" style={styles.xpText}>
                {user.experience % 100}/100 XP
              </Text>
            </View>
            <ProgressBar progress={levelProgress} color="#4CAF50" style={styles.progressBar} />
          </View>
        </Card.Content>
      </Card>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <Card style={styles.statCard}>
          <Card.Content style={styles.statContent}>
            <Icon name="fire" size={30} color="#FF5722" />
            <Text variant="headlineMedium" style={styles.statValue}>
              {user.stats.currentStreak}
            </Text>
            <Text variant="bodySmall" style={styles.statLabel}>
              Day Streak
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.statCard}>
          <Card.Content style={styles.statContent}>
            <Icon name="book" size={30} color="#2196F3" />
            <Text variant="headlineMedium" style={styles.statValue}>
              {user.stats.totalEntries}
            </Text>
            <Text variant="bodySmall" style={styles.statLabel}>
              Entries
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.statCard}>
          <Card.Content style={styles.statContent}>
            <Icon name="trophy" size={30} color="#FFC107" />
            <Text variant="headlineMedium" style={styles.statValue}>
              {user.badges?.length || 0}
            </Text>
            <Text variant="bodySmall" style={styles.statLabel}>
              Badges
            </Text>
          </Card.Content>
        </Card>
      </View>

      {/* Subscription Status */}
      <Card style={styles.subscriptionCard}>
        <Card.Content>
          <View style={styles.subscriptionHeader}>
            <Text variant="titleMedium">Subscription</Text>
            {user.subscription.tier === 'premium' && (
              <Icon name="crown" size={24} color="#FFD700" />
            )}
          </View>
          <Text variant="bodyLarge" style={styles.tierText}>
            {user.subscription.tier.charAt(0).toUpperCase() + user.subscription.tier.slice(1)}
          </Text>
          {user.subscription.tier === 'free' && (
            <Button
              mode="contained"
              onPress={() => navigation.navigate('Premium')}
              style={styles.upgradeButton}
            >
              Upgrade to Premium
            </Button>
          )}
        </Card.Content>
      </Card>

      {/* Quick Actions */}
      <Card style={styles.actionsCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Quick Actions
          </Text>
          <Button
            mode="outlined"
            icon="cog"
            onPress={() => navigation.navigate('Settings')}
            style={styles.actionButton}
          >
            Settings
          </Button>
          <Button
            mode="outlined"
            icon="download"
            onPress={() => navigation.navigate('Export')}
            style={styles.actionButton}
          >
            Export Data
          </Button>
          <Button
            mode="outlined"
            icon="logout"
            onPress={handleLogout}
            style={styles.actionButton}
          >
            Logout
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  headerCard: {
    margin: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  cameraIcon: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: '#4CAF50',
  },
  userInfo: {
    marginLeft: 20,
    flex: 1,
  },
  displayName: {
    fontWeight: 'bold',
  },
  username: {
    color: '#666',
    marginTop: 4,
  },
  bio: {
    marginTop: 8,
    color: '#333',
  },
  levelContainer: {
    marginTop: 16,
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  xpText: {
    color: '#666',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
  },
  statContent: {
    alignItems: 'center',
  },
  statValue: {
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    color: '#666',
    marginTop: 4,
  },
  subscriptionCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  subscriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tierText: {
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 12,
  },
  upgradeButton: {
    marginTop: 8,
  },
  actionsCard: {
    marginHorizontal: 16,
    marginBottom: 32,
  },
  sectionTitle: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  actionButton: {
    marginBottom: 12,
  },
});
