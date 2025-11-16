/**
 * Reminders Screen - Manage daily reminder notifications
 * © 2024 Gratitude Journal. All Rights Reserved.
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Alert,
  Platform,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  Switch,
  IconButton,
  ActivityIndicator,
  Snackbar,
  FAB,
  Portal,
  Modal,
  TextInput,
  Chip,
} from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Haptics from 'expo-haptics';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ApiService from '../../services/ApiService';
import AnalyticsService, { AnalyticsEvent } from '../../services/AnalyticsService';

interface Reminder {
  _id: string;
  time: string;
  days: number[];
  enabled: boolean;
  message?: string;
}

const DAYS_OF_WEEK = [
  { label: 'S', value: 0, full: 'Sunday' },
  { label: 'M', value: 1, full: 'Monday' },
  { label: 'T', value: 2, full: 'Tuesday' },
  { label: 'W', value: 3, full: 'Wednesday' },
  { label: 'T', value: 4, full: 'Thursday' },
  { label: 'F', value: 5, full: 'Friday' },
  { label: 'S', value: 6, full: 'Saturday' },
];

export default function RemindersScreen() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [newReminderTime, setNewReminderTime] = useState(new Date());
  const [newReminderDays, setNewReminderDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [newReminderMessage, setNewReminderMessage] = useState('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    loadReminders();
    AnalyticsService.trackScreenView('reminders_screen');
  }, []);

  const loadReminders = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getReminders();

      if (response.success && response.data) {
        setReminders(response.data);
      } else {
        showSnackbar(response.error || 'Failed to load reminders');
      }
    } catch (error) {
      showSnackbar('Error loading reminders');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadReminders();
  };

  const handleToggleReminder = async (reminderId: string, enabled: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const response = await ApiService.updateReminder(reminderId, { enabled });

    if (response.success) {
      setReminders(prev =>
        prev.map(r => (r._id === reminderId ? { ...r, enabled } : r))
      );
      showSnackbar(enabled ? 'Reminder enabled' : 'Reminder disabled');
    } else {
      showSnackbar(response.error || 'Failed to update reminder');
    }
  };

  const handleDeleteReminder = (reminderId: string) => {
    Alert.alert(
      'Delete Reminder',
      'Are you sure you want to delete this reminder?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            const response = await ApiService.deleteReminder(reminderId);

            if (response.success) {
              setReminders(prev => prev.filter(r => r._id !== reminderId));
              showSnackbar('Reminder deleted');
            } else {
              showSnackbar(response.error || 'Failed to delete reminder');
            }
          },
        },
      ]
    );
  };

  const handleCreateReminder = async () => {
    if (newReminderDays.length === 0) {
      showSnackbar('Please select at least one day');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const reminderData = {
      time: newReminderTime.toTimeString().substring(0, 5),
      days: newReminderDays,
      enabled: true,
      message: newReminderMessage || 'Time to practice gratitude!',
    };

    const response = await ApiService.createReminder(reminderData);

    if (response.success && response.data) {
      setReminders(prev => [...prev, response.data]);
      setModalVisible(false);
      resetNewReminder();
      showSnackbar('Reminder created!');
      AnalyticsService.trackEvent(AnalyticsEvent.REMINDER_SET);
    } else {
      showSnackbar(response.error || 'Failed to create reminder');
    }
  };

  const resetNewReminder = () => {
    setNewReminderTime(new Date());
    setNewReminderDays([1, 2, 3, 4, 5]);
    setNewReminderMessage('');
  };

  const toggleDay = (day: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setNewReminderDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getDaysString = (days: number[]) => {
    if (days.length === 7) return 'Every day';
    if (days.length === 5 && !days.includes(0) && !days.includes(6)) return 'Weekdays';
    if (days.length === 2 && days.includes(0) && days.includes(6)) return 'Weekends';

    return days
      .sort((a, b) => a - b)
      .map(d => DAYS_OF_WEEK[d].label)
      .join(', ');
  };

  const renderReminder = (reminder: Reminder) => (
    <Card key={reminder._id} style={styles.reminderCard}>
      <Card.Content>
        <View style={styles.reminderHeader}>
          <View style={styles.reminderInfo}>
            <Text variant="headlineMedium" style={styles.reminderTime}>
              {formatTime(reminder.time)}
            </Text>
            <Text variant="bodyMedium" style={styles.reminderDays}>
              {getDaysString(reminder.days)}
            </Text>
            {reminder.message && (
              <Text variant="bodySmall" style={styles.reminderMessage}>
                "{reminder.message}"
              </Text>
            )}
          </View>
          <View style={styles.reminderActions}>
            <Switch
              value={reminder.enabled}
              onValueChange={(value) => handleToggleReminder(reminder._id, value)}
              color="#4CAF50"
            />
            <IconButton
              icon="delete"
              size={20}
              onPress={() => handleDeleteReminder(reminder._id)}
              iconColor="#E53935"
            />
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading reminders...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          {/* Header */}
          <Card style={styles.headerCard}>
            <Card.Content>
              <View style={styles.headerContent}>
                <Icon name="bell-ring" size={40} color="#4CAF50" />
                <View style={styles.headerText}>
                  <Text variant="headlineSmall" style={styles.headerTitle}>
                    Daily Reminders
                  </Text>
                  <Text variant="bodyMedium" style={styles.headerSubtitle}>
                    Never miss your gratitude practice
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>

          {/* Reminders List */}
          {reminders.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Icon name="bell-outline" size={64} color="#ccc" />
              <Text variant="headlineSmall" style={styles.emptyTitle}>
                No Reminders Set
              </Text>
              <Text variant="bodyMedium" style={styles.emptyText}>
                Create your first reminder to build a consistent practice
              </Text>
            </View>
          ) : (
            <>
              {reminders.map(renderReminder)}
            </>
          )}

          <View style={{ height: 80 }} />
        </ScrollView>
      )}

      {/* FAB */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          setModalVisible(true);
        }}
        color="#fff"
      />

      {/* Create Reminder Modal */}
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => {
            setModalVisible(false);
            resetNewReminder();
          }}
          contentContainerStyle={styles.modalContent}
        >
          <Text variant="headlineSmall" style={styles.modalTitle}>
            New Reminder
          </Text>

          {/* Time Picker */}
          <View style={styles.timeSection}>
            <Text variant="titleMedium" style={styles.sectionLabel}>
              Time
            </Text>
            <Button
              mode="outlined"
              onPress={() => setShowTimePicker(true)}
              icon="clock-outline"
              style={styles.timeButton}
              contentStyle={styles.timeButtonContent}
            >
              {formatTime(newReminderTime.toTimeString().substring(0, 5))}
            </Button>
          </View>

          {/* Days Selection */}
          <View style={styles.daysSection}>
            <Text variant="titleMedium" style={styles.sectionLabel}>
              Days
            </Text>
            <View style={styles.daysGrid}>
              {DAYS_OF_WEEK.map(day => (
                <Chip
                  key={day.value}
                  selected={newReminderDays.includes(day.value)}
                  onPress={() => toggleDay(day.value)}
                  style={styles.dayChip}
                  showSelectedCheck={false}
                >
                  {day.label}
                </Chip>
              ))}
            </View>
          </View>

          {/* Message */}
          <View style={styles.messageSection}>
            <Text variant="titleMedium" style={styles.sectionLabel}>
              Message (Optional)
            </Text>
            <TextInput
              mode="outlined"
              placeholder="Time to practice gratitude!"
              value={newReminderMessage}
              onChangeText={setNewReminderMessage}
              maxLength={100}
              style={styles.messageInput}
            />
          </View>

          {/* Actions */}
          <View style={styles.modalActions}>
            <Button
              mode="outlined"
              onPress={() => {
                setModalVisible(false);
                resetNewReminder();
              }}
              style={styles.modalButton}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleCreateReminder}
              style={styles.modalButton}
              disabled={newReminderDays.length === 0}
            >
              Create
            </Button>
          </View>
        </Modal>
      </Portal>

      {/* Time Picker */}
      {showTimePicker && (
        <DateTimePicker
          value={newReminderTime}
          mode="time"
          is24Hour={false}
          display="default"
          onChange={(event, selectedTime) => {
            setShowTimePicker(Platform.OS === 'ios');
            if (selectedTime) {
              setNewReminderTime(selectedTime);
            }
          }}
        />
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
    marginBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
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
  reminderCard: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  reminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reminderInfo: {
    flex: 1,
  },
  reminderTime: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  reminderDays: {
    color: '#666',
    marginBottom: 4,
  },
  reminderMessage: {
    color: '#999',
    fontStyle: 'italic',
  },
  reminderActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#4CAF50',
  },
  modalContent: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 16,
    padding: 24,
  },
  modalTitle: {
    fontWeight: 'bold',
    marginBottom: 24,
  },
  timeSection: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontWeight: 'bold',
    marginBottom: 12,
  },
  timeButton: {
    width: '100%',
  },
  timeButtonContent: {
    paddingVertical: 8,
  },
  daysSection: {
    marginBottom: 24,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayChip: {
    minWidth: 45,
  },
  messageSection: {
    marginBottom: 24,
  },
  messageInput: {
    backgroundColor: '#fff',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
  },
});
