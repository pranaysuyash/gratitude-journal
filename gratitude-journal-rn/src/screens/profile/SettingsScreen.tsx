/**
 * Settings Screen
 * App settings and preferences
 * © 2024 Gratitude Journal. All Rights Reserved.
 */

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, List, Switch, Divider, Button, Card } from 'react-native-paper';
import * as Haptics from 'expo-haptics';
import ApiService from '../../services/ApiService';

export default function SettingsScreen({ navigation }: any) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [hapticFeedback, setHapticFeedback] = useState(true);

  return (
    <ScrollView style={styles.container}>
      <List.Section>
        <List.Subheader>Notifications</List.Subheader>
        <List.Item
          title="Push Notifications"
          left={() => <List.Icon icon="bell" />}
          right={() => (
            <Switch value={notificationsEnabled} onValueChange={setNotificationsEnabled} />
          )}
        />
        <List.Item
          title="Daily Reminders"
          onPress={() => navigation.navigate('Reminders')}
          left={() => <List.Icon icon="clock" />}
          right={() => <List.Icon icon="chevron-right" />}
        />
        <Divider />

        <List.Subheader>Appearance</List.Subheader>
        <List.Item
          title="Dark Mode"
          left={() => <List.Icon icon="theme-light-dark" />}
          right={() => <Switch value={darkMode} onValueChange={setDarkMode} />}
        />
        <List.Item
          title="Haptic Feedback"
          left={() => <List.Icon icon="vibrate" />}
          right={() => <Switch value={hapticFeedback} onValueChange={setHapticFeedback} />}
        />
        <Divider />

        <List.Subheader>Account</List.Subheader>
        <List.Item
          title="Change Password"
          left={() => <List.Icon icon="lock" />}
          onPress={() => Alert.alert('Coming Soon', 'Password change will be available soon!')}
          right={() => <List.Icon icon="chevron-right" />}
        />
        <List.Item
          title="Privacy Settings"
          left={() => <List.Icon icon="shield-account" />}
          onPress={() => Alert.alert('Coming Soon')}
          right={() => <List.Icon icon="chevron-right" />}
        />
        <Divider />

        <List.Subheader>Data & Storage</List.Subheader>
        <List.Item
          title="Export Data"
          left={() => <List.Icon icon="download" />}
          onPress={() => navigation.navigate('Export')}
          right={() => <List.Icon icon="chevron-right" />}
        />
        <List.Item
          title="Clear Cache"
          left={() => <List.Icon icon="delete-sweep" />}
          onPress={() => Alert.alert('Success', 'Cache cleared')}
        />
        <Divider />

        <List.Subheader>About</List.Subheader>
        <List.Item
          title="Terms of Service"
          left={() => <List.Icon icon="file-document" />}
          right={() => <List.Icon icon="chevron-right" />}
        />
        <List.Item
          title="Privacy Policy"
          left={() => <List.Icon icon="shield-check" />}
          right={() => <List.Icon icon="chevron-right" />}
        />
        <List.Item title="Version" description="1.0.0" left={() => <List.Icon icon="information" />} />
      </List.Section>

      <Card style={styles.dangerCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.dangerTitle}>
            Danger Zone
          </Text>
          <Button
            mode="outlined"
            textColor="#F44336"
            onPress={() => {
              Alert.alert(
                'Delete Account',
                'This will permanently delete your account and all data. This cannot be undone.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                      await ApiService.deleteAccount();
                      navigation.replace('Auth');
                    },
                  },
                ]
              );
            }}
            style={styles.deleteButton}
          >
            Delete Account
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
  dangerCard: {
    margin: 16,
    backgroundColor: '#FFEBEE',
  },
  dangerTitle: {
    color: '#F44336',
    marginBottom: 12,
    fontWeight: 'bold',
  },
  deleteButton: {
    borderColor: '#F44336',
  },
});
