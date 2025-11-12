/**
 * Settings Screen
 * App settings and user preferences
 * © 2024 Gratitude Journal. All Rights Reserved.
 */

import React from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import {
  Text,
  List,
  Switch,
  Avatar,
  Button,
  Divider,
  Card,
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { logout } from '../store/slices/authSlice';

export default function SettingsScreen({ navigation }: any) {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { preferences } = useSelector((state: RootState) => state.settings);

  const [notificationsEnabled, setNotificationsEnabled] = React.useState(
    preferences?.notifications || true
  );
  const [darkMode, setDarkMode] = React.useState(preferences?.darkMode || false);
  const [autoBackup, setAutoBackup] = React.useState(preferences?.autoBackup || true);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => {
          dispatch(logout());
          navigation.navigate('Auth');
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // TODO: Implement account deletion
            Alert.alert('Success', 'Account deletion request submitted.');
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Profile Section */}
      <Card style={styles.profileCard}>
        <Card.Content>
          <View style={styles.profileHeader}>
            <Avatar.Image
              size={80}
              source={
                user?.avatar
                  ? { uri: user.avatar }
                  : require('../../assets/default-avatar.png')
              }
            />
            <View style={styles.profileInfo}>
              <Text variant="headlineSmall">{user?.displayName}</Text>
              <Text variant="bodyMedium" style={styles.username}>
                @{user?.username}
              </Text>
              <Text variant="bodySmall" style={styles.email}>
                {user?.email}
              </Text>
            </View>
          </View>
          <Button
            mode="outlined"
            onPress={() => navigation.navigate('EditProfile')}
            style={styles.editButton}
          >
            Edit Profile
          </Button>
        </Card.Content>
      </Card>

      {/* Stats Section */}
      <Card style={styles.statsCard}>
        <Card.Content>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text variant="headlineMedium" style={styles.statNumber}>
                {user?.stats?.totalEntries || 0}
              </Text>
              <Text variant="bodySmall">Entries</Text>
            </View>
            <View style={styles.statItem}>
              <Text variant="headlineMedium" style={styles.statNumber}>
                {user?.stats?.currentStreak || 0}
              </Text>
              <Text variant="bodySmall">Streak</Text>
            </View>
            <View style={styles.statItem}>
              <Text variant="headlineMedium" style={styles.statNumber}>
                {user?.stats?.level || 1}
              </Text>
              <Text variant="bodySmall">Level</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Preferences */}
      <List.Section>
        <List.Subheader>Preferences</List.Subheader>
        <List.Item
          title="Notifications"
          description="Enable push notifications"
          left={props => <List.Icon {...props} icon="bell" />}
          right={() => (
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
            />
          )}
        />
        <Divider />
        <List.Item
          title="Dark Mode"
          description="Use dark theme"
          left={props => <List.Icon {...props} icon="theme-light-dark" />}
          right={() => (
            <Switch value={darkMode} onValueChange={setDarkMode} />
          )}
        />
        <Divider />
        <List.Item
          title="Auto Backup"
          description="Automatically backup to cloud"
          left={props => <List.Icon {...props} icon="cloud-upload" />}
          right={() => (
            <Switch value={autoBackup} onValueChange={setAutoBackup} />
          )}
        />
      </List.Section>

      {/* Data & Privacy */}
      <List.Section>
        <List.Subheader>Data & Privacy</List.Subheader>
        <List.Item
          title="Export Data"
          description="Download your journal data"
          left={props => <List.Icon {...props} icon="download" />}
          onPress={() => navigation.navigate('Export')}
        />
        <Divider />
        <List.Item
          title="Privacy Settings"
          description="Manage your privacy preferences"
          left={props => <List.Icon {...props} icon="shield-account" />}
          onPress={() => navigation.navigate('Privacy')}
        />
        <Divider />
        <List.Item
          title="Backup & Sync"
          description="Manage backups and cloud sync"
          left={props => <List.Icon {...props} icon="cloud-sync" />}
          onPress={() => navigation.navigate('Backup')}
        />
      </List.Section>

      {/* App */}
      <List.Section>
        <List.Subheader>App</List.Subheader>
        <List.Item
          title="Reminders"
          description="Manage journal reminders"
          left={props => <List.Icon {...props} icon="alarm" />}
          onPress={() => navigation.navigate('Reminders')}
        />
        <Divider />
        <List.Item
          title="Goals"
          description="View and manage your goals"
          left={props => <List.Icon {...props} icon="target" />}
          onPress={() => navigation.navigate('Goals')}
        />
        <Divider />
        <List.Item
          title="Integrations"
          description="Connect external services"
          left={props => <List.Icon {...props} icon="connection" />}
          onPress={() => navigation.navigate('Integrations')}
        />
      </List.Section>

      {/* Support */}
      <List.Section>
        <List.Subheader>Support</List.Subheader>
        <List.Item
          title="Help Center"
          left={props => <List.Icon {...props} icon="help-circle" />}
          onPress={() => {}}
        />
        <Divider />
        <List.Item
          title="Send Feedback"
          left={props => <List.Icon {...props} icon="message-text" />}
          onPress={() => {}}
        />
        <Divider />
        <List.Item
          title="About"
          left={props => <List.Icon {...props} icon="information" />}
          onPress={() => navigation.navigate('About')}
        />
      </List.Section>

      {/* Account Actions */}
      <View style={styles.actions}>
        <Button mode="outlined" onPress={handleLogout} style={styles.button}>
          Logout
        </Button>
        <Button
          mode="text"
          onPress={handleDeleteAccount}
          textColor="#f44336"
          style={styles.button}
        >
          Delete Account
        </Button>
      </View>

      <Text variant="bodySmall" style={styles.version}>
        Version 1.0.0
      </Text>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  profileCard: {
    margin: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  username: {
    color: '#666',
    marginTop: 4,
  },
  email: {
    color: '#999',
    marginTop: 2,
  },
  editButton: {
    marginTop: 8,
  },
  statsCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  actions: {
    padding: 16,
    gap: 8,
  },
  button: {
    marginBottom: 8,
  },
  version: {
    textAlign: 'center',
    color: '#999',
    marginBottom: 16,
  },
  bottomPadding: {
    height: 32,
  },
});
