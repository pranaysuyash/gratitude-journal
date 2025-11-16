/**
 * Analytics Screen - Data visualization and statistics
 * © 2024 Gratitude Journal. All Rights Reserved.
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Dimensions,
  RefreshControl,
} from 'react-native';
import {
  Text,
  Card,
  ActivityIndicator,
  Chip,
  Snackbar,
  Button,
} from 'react-native-paper';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import * as Haptics from 'expo-haptics';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ApiService from '../../services/ApiService';
import AnalyticsService from '../../services/AnalyticsService';

const { width } = Dimensions.get('window');

type DateRangeType = '7' | '30' | '90' | '365';

export default function AnalyticsScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState<DateRangeType>('30');
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const [stats, setStats] = useState({
    totalEntries: 0,
    averageSentiment: 0,
    totalWords: 0,
    averageWordCount: 0,
  });

  const [moodData, setMoodData] = useState({
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{ data: [6, 7, 8, 7, 9, 8, 9] }],
  });

  const [entryFrequencyData, setEntryFrequencyData] = useState({
    labels: ['W1', 'W2', 'W3', 'W4'],
    datasets: [{ data: [3, 5, 7, 6] }],
  });

  const [wordCountData, setWordCountData] = useState({
    labels: ['<100', '100-200', '200-300', '>300'],
    datasets: [{ data: [5, 15, 20, 10] }],
  });

  const [moodDistribution, setMoodDistribution] = useState([
    { name: 'Happy', count: 25, color: '#4CAF50', legendFontColor: '#666', legendFontSize: 14 },
    { name: 'Calm', count: 15, color: '#2196F3', legendFontColor: '#666', legendFontSize: 14 },
    { name: 'Excited', count: 10, color: '#FF9800', legendFontColor: '#666', legendFontSize: 14 },
    { name: 'Sad', count: 5, color: '#9E9E9E', legendFontColor: '#666', legendFontSize: 14 },
  ]);

  useEffect(() => {
    loadAnalytics();
    AnalyticsService.trackScreenView('analytics_screen');
  }, [dateRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);

      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(dateRange));

      const response = await ApiService.getAnalytics({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        groupBy: 'day',
      });

      if (response.success && response.data) {
        // Update stats based on response
        setStats({
          totalEntries: response.data.totalEntries || 50,
          averageSentiment: response.data.averageSentiment || 7.5,
          totalWords: response.data.totalWords || 12500,
          averageWordCount: response.data.averageWordCount || 250,
        });

        // Load mood trends
        const moodTrendsResponse = await ApiService.getMoodTrends(parseInt(dateRange));
        if (moodTrendsResponse.success && moodTrendsResponse.data) {
          // Process mood trends data
          // For now, using mock data
        }
      }
    } catch (error) {
      showSnackbar('Error loading analytics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadAnalytics();
  };

  const handleDateRangeChange = (range: DateRangeType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDateRange(range);
  };

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  const chartConfig = {
    backgroundColor: '#fff',
    backgroundGradientFrom: '#fff',
    backgroundGradientTo: '#fff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading analytics...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Date Range Filter */}
      <View style={styles.filterContainer}>
        <Text variant="titleMedium" style={styles.filterTitle}>
          Date Range
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filterChips}>
            <Chip
              selected={dateRange === '7'}
              onPress={() => handleDateRangeChange('7')}
              style={styles.filterChip}
              showSelectedCheck={false}
            >
              7 Days
            </Chip>
            <Chip
              selected={dateRange === '30'}
              onPress={() => handleDateRangeChange('30')}
              style={styles.filterChip}
              showSelectedCheck={false}
            >
              30 Days
            </Chip>
            <Chip
              selected={dateRange === '90'}
              onPress={() => handleDateRangeChange('90')}
              style={styles.filterChip}
              showSelectedCheck={false}
            >
              90 Days
            </Chip>
            <Chip
              selected={dateRange === '365'}
              onPress={() => handleDateRangeChange('365')}
              style={styles.filterChip}
              showSelectedCheck={false}
            >
              1 Year
            </Chip>
          </View>
        </ScrollView>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Stats Cards */}
        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <Icon name="book" size={32} color="#4CAF50" />
              <Text variant="displaySmall" style={styles.statNumber}>
                {stats.totalEntries}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                Total Entries
              </Text>
            </Card.Content>
          </Card>

          <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <Icon name="emoticon-happy" size={32} color="#FFC107" />
              <Text variant="displaySmall" style={styles.statNumber}>
                {stats.averageSentiment.toFixed(1)}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                Avg Sentiment
              </Text>
            </Card.Content>
          </Card>

          <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <Icon name="text" size={32} color="#2196F3" />
              <Text variant="displaySmall" style={styles.statNumber}>
                {stats.totalWords.toLocaleString()}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                Total Words
              </Text>
            </Card.Content>
          </Card>

          <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <Icon name="format-text" size={32} color="#9C27B0" />
              <Text variant="displaySmall" style={styles.statNumber}>
                {stats.averageWordCount}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                Avg Words/Entry
              </Text>
            </Card.Content>
          </Card>
        </View>

        {/* Mood Trend Chart */}
        <Card style={styles.chartCard}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.chartTitle}>
              Mood Trend
            </Text>
            <Text variant="bodySmall" style={styles.chartSubtitle}>
              Your mood over the last {dateRange} days
            </Text>
            <LineChart
              data={moodData}
              width={width - 60}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
            />
          </Card.Content>
        </Card>

        {/* Entry Frequency Chart */}
        <Card style={styles.chartCard}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.chartTitle}>
              Entry Frequency
            </Text>
            <Text variant="bodySmall" style={styles.chartSubtitle}>
              Entries per week
            </Text>
            <BarChart
              data={entryFrequencyData}
              width={width - 60}
              height={220}
              chartConfig={chartConfig}
              style={styles.chart}
              yAxisLabel=""
              yAxisSuffix=""
            />
          </Card.Content>
        </Card>

        {/* Mood Distribution Pie Chart */}
        <Card style={styles.chartCard}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.chartTitle}>
              Mood Distribution
            </Text>
            <Text variant="bodySmall" style={styles.chartSubtitle}>
              Breakdown of your moods
            </Text>
            <PieChart
              data={moodDistribution}
              width={width - 60}
              height={220}
              chartConfig={chartConfig}
              accessor="count"
              backgroundColor="transparent"
              paddingLeft="15"
              style={styles.chart}
            />
          </Card.Content>
        </Card>

        {/* Word Count Distribution */}
        <Card style={styles.chartCard}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.chartTitle}>
              Word Count Distribution
            </Text>
            <Text variant="bodySmall" style={styles.chartSubtitle}>
              Entry length distribution
            </Text>
            <BarChart
              data={wordCountData}
              width={width - 60}
              height={220}
              chartConfig={chartConfig}
              style={styles.chart}
              yAxisLabel=""
              yAxisSuffix=""
            />
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
    marginRight: 8,
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  statCard: {
    width: (width - 44) / 2,
  },
  statContent: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  statNumber: {
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: 8,
  },
  statLabel: {
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  chartCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  chartTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  chartSubtitle: {
    color: '#666',
    marginBottom: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
});
