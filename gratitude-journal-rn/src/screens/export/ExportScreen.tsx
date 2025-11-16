/**
 * Export Screen - Export journal data in various formats
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
  RadioButton,
  ActivityIndicator,
  Snackbar,
  List,
  Portal,
  Modal,
} from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Haptics from 'expo-haptics';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ApiService from '../../services/ApiService';
import AnalyticsService from '../../services/AnalyticsService';

type ExportFormat = 'json' | 'pdf' | 'csv';

export default function ExportScreen() {
  const [format, setFormat] = useState<ExportFormat>('pdf');
  const [startDate, setStartDate] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
  const [endDate, setEndDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    AnalyticsService.trackScreenView('export_screen');
  }, []);

  const handleExport = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      setLoading(true);

      const response = await ApiService.exportData(format);

      if (response.success && response.data) {
        showSnackbar(`Export started! Download link: ${response.data.url}`);

        // In a real app, this would trigger a download or open sharing sheet
        Alert.alert(
          'Export Ready',
          `Your ${format.toUpperCase()} export is ready! In a production app, this would download the file.`,
          [{ text: 'OK' }]
        );
      } else {
        showSnackbar(response.error || 'Export failed');
      }
    } catch (error) {
      showSnackbar('Error exporting data');
    } finally {
      setLoading(false);
    }
  };

  const handleVideoMontage = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    showSnackbar('Video montage feature coming soon!');
  };

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  const formatDescriptions = {
    pdf: 'Export your journal as a beautifully formatted PDF document. Perfect for printing or archiving.',
    json: 'Export your data in JSON format for backup or migration to other apps. Includes all metadata.',
    csv: 'Export your entries as a spreadsheet-compatible CSV file. Great for data analysis.',
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        {/* Header */}
        <Card style={styles.headerCard}>
          <Card.Content>
            <View style={styles.headerContent}>
              <Icon name="download" size={40} color="#4CAF50" />
              <View style={styles.headerText}>
                <Text variant="headlineSmall" style={styles.headerTitle}>
                  Export Your Journal
                </Text>
                <Text variant="bodyMedium" style={styles.headerSubtitle}>
                  Download your gratitude entries in your preferred format
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Format Selection */}
        <Card style={styles.formatCard}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Export Format
            </Text>

            <RadioButton.Group onValueChange={value => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setFormat(value as ExportFormat);
            }} value={format}>
              <List.Item
                title="PDF Document"
                description={formatDescriptions.pdf}
                left={() => (
                  <RadioButton value="pdf" />
                )}
                right={() => <Icon name="file-pdf-box" size={32} color="#E53935" />}
                style={styles.formatOption}
                onPress={() => setFormat('pdf')}
              />
              <List.Item
                title="JSON Data"
                description={formatDescriptions.json}
                left={() => (
                  <RadioButton value="json" />
                )}
                right={() => <Icon name="code-json" size={32} color="#FFC107" />}
                style={styles.formatOption}
                onPress={() => setFormat('json')}
              />
              <List.Item
                title="CSV Spreadsheet"
                description={formatDescriptions.csv}
                left={() => (
                  <RadioButton value="csv" />
                )}
                right={() => <Icon name="file-delimited" size={32} color="#4CAF50" />}
                style={styles.formatOption}
                onPress={() => setFormat('csv')}
              />
            </RadioButton.Group>
          </Card.Content>
        </Card>

        {/* Date Range */}
        <Card style={styles.dateCard}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Date Range
            </Text>

            <View style={styles.dateRow}>
              <View style={styles.dateItem}>
                <Text variant="bodyMedium" style={styles.dateLabel}>
                  Start Date
                </Text>
                <Button
                  mode="outlined"
                  onPress={() => setShowStartPicker(true)}
                  icon="calendar"
                  style={styles.dateButton}
                >
                  {startDate.toLocaleDateString()}
                </Button>
              </View>

              <View style={styles.dateItem}>
                <Text variant="bodyMedium" style={styles.dateLabel}>
                  End Date
                </Text>
                <Button
                  mode="outlined"
                  onPress={() => setShowEndPicker(true)}
                  icon="calendar"
                  style={styles.dateButton}
                >
                  {endDate.toLocaleDateString()}
                </Button>
              </View>
            </View>

            {/* Quick Date Ranges */}
            <View style={styles.quickRanges}>
              <Button
                mode="outlined"
                compact
                onPress={() => {
                  setStartDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
                  setEndDate(new Date());
                }}
                style={styles.quickButton}
              >
                Last 7 Days
              </Button>
              <Button
                mode="outlined"
                compact
                onPress={() => {
                  setStartDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
                  setEndDate(new Date());
                }}
                style={styles.quickButton}
              >
                Last 30 Days
              </Button>
              <Button
                mode="outlined"
                compact
                onPress={() => {
                  setStartDate(new Date(Date.now() - 365 * 24 * 60 * 60 * 1000));
                  setEndDate(new Date());
                }}
                style={styles.quickButton}
              >
                Last Year
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Export Button */}
        <Card style={styles.exportCard}>
          <Card.Content>
            <Button
              mode="contained"
              onPress={handleExport}
              loading={loading}
              disabled={loading}
              icon="download"
              style={styles.exportButton}
              contentStyle={styles.exportButtonContent}
            >
              Export as {format.toUpperCase()}
            </Button>
            <Text variant="bodySmall" style={styles.exportNote}>
              Your data will be prepared and downloaded to your device
            </Text>
          </Card.Content>
        </Card>

        {/* Video Montage (Coming Soon) */}
        <Card style={styles.videoCard}>
          <Card.Content>
            <View style={styles.videoHeader}>
              <Icon name="video" size={32} color="#9C27B0" />
              <View style={styles.videoText}>
                <Text variant="titleMedium" style={styles.videoTitle}>
                  Video Montage
                </Text>
                <Text variant="bodyMedium" style={styles.videoSubtitle}>
                  Create a beautiful video montage of your gratitude journey
                </Text>
              </View>
            </View>
            <Button
              mode="outlined"
              onPress={handleVideoMontage}
              icon="video-plus"
              style={styles.videoButton}
            >
              Create Video (Coming Soon)
            </Button>
            <View style={styles.comingSoonBadge}>
              <Icon name="clock-outline" size={16} color="#666" />
              <Text variant="bodySmall" style={styles.comingSoonText}>
                This feature is under development
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Tips */}
        <Card style={styles.tipsCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.tipsTitle}>
              Export Tips
            </Text>
            <List.Item
              title="PDF for Reading"
              description="Best for printing or reading on any device"
              left={props => <List.Icon {...props} icon="file-pdf-box" color="#E53935" />}
            />
            <List.Item
              title="JSON for Backup"
              description="Complete backup with all data and metadata"
              left={props => <List.Icon {...props} icon="code-json" color="#FFC107" />}
            />
            <List.Item
              title="CSV for Analysis"
              description="Import into Excel or Google Sheets for analysis"
              left={props => <List.Icon {...props} icon="file-delimited" color="#4CAF50" />}
            />
          </Card.Content>
        </Card>

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Date Pickers */}
      {showStartPicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowStartPicker(false);
            if (selectedDate) {
              setStartDate(selectedDate);
            }
          }}
        />
      )}
      {showEndPicker && (
        <DateTimePicker
          value={endDate}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowEndPicker(false);
            if (selectedDate) {
              setEndDate(selectedDate);
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
  formatCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  formatOption: {
    paddingVertical: 8,
  },
  dateCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  dateRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  dateItem: {
    flex: 1,
  },
  dateLabel: {
    marginBottom: 8,
    fontWeight: 'bold',
  },
  dateButton: {
    width: '100%',
  },
  quickRanges: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  quickButton: {
    flex: 1,
    minWidth: 100,
  },
  exportCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  exportButton: {
    marginBottom: 8,
  },
  exportButtonContent: {
    paddingVertical: 8,
  },
  exportNote: {
    color: '#666',
    textAlign: 'center',
  },
  videoCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#F3E5F5',
  },
  videoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  videoText: {
    flex: 1,
    marginLeft: 12,
  },
  videoTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  videoSubtitle: {
    color: '#666',
  },
  videoButton: {
    marginBottom: 8,
  },
  comingSoonBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 8,
  },
  comingSoonText: {
    color: '#666',
    fontStyle: 'italic',
  },
  tipsCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  tipsTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
});
