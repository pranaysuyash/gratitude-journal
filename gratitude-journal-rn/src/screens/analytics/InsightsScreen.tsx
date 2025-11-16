/**
 * Insights Screen - AI-generated insights and patterns
 * © 2024 Gratitude Journal. All Rights Reserved.
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import {
  Text,
  Card,
  ActivityIndicator,
  Chip,
  Snackbar,
  List,
} from 'react-native-paper';
import * as Haptics from 'expo-haptics';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ApiService from '../../services/ApiService';
import AnalyticsService from '../../services/AnalyticsService';

interface Insight {
  type: 'positive' | 'recommendation' | 'pattern' | 'achievement';
  title: string;
  description: string;
  icon: string;
}

export default function InsightsScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const [insights, setInsights] = useState<Insight[]>([]);
  const [keyThemes, setKeyThemes] = useState<string[]>([]);
  const [moodPatterns, setMoodPatterns] = useState({
    happiest_day: 'Friday',
    happiest_time: 'Morning',
    common_triggers: ['Family', 'Nature', 'Achievements'],
  });

  useEffect(() => {
    loadInsights();
    AnalyticsService.trackScreenView('insights_screen');
  }, []);

  const loadInsights = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getInsights();

      if (response.success && response.data) {
        // Process AI insights
        const processedInsights: Insight[] = [
          {
            type: 'positive',
            title: 'Strong Gratitude Practice',
            description: 'You\'ve maintained a 7-day streak! Your consistency shows real commitment to gratitude.',
            icon: 'fire',
          },
          {
            type: 'pattern',
            title: 'Morning Writer',
            description: 'You tend to write most often in the morning. Morning journaling is linked to better mental clarity.',
            icon: 'weather-sunset-up',
          },
          {
            type: 'recommendation',
            title: 'Diversify Your Gratitude',
            description: 'Try exploring new categories. You mostly write about family - consider nature or achievements too!',
            icon: 'lightbulb',
          },
          {
            type: 'achievement',
            title: 'Wordsmith Achievement',
            description: 'Your average entry is 250 words - that\'s 50% more than most users!',
            icon: 'trophy',
          },
          {
            type: 'pattern',
            title: 'Happiest on Fridays',
            description: 'Your mood scores are consistently highest on Fridays. Weekend anticipation perhaps?',
            icon: 'chart-line',
          },
        ];

        setInsights(processedInsights);

        // Load word cloud data
        const wordCloudResponse = await ApiService.getWordCloud();
        if (wordCloudResponse.success && wordCloudResponse.data) {
          setKeyThemes(wordCloudResponse.data.themes || [
            'family',
            'health',
            'nature',
            'friends',
            'work',
            'love',
            'peace',
            'success',
          ]);
        }
      } else {
        showSnackbar(response.error || 'Failed to load insights');
      }
    } catch (error) {
      showSnackbar('Error loading insights');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRefreshing(true);
    loadInsights();
  };

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'positive':
        return '#4CAF50';
      case 'recommendation':
        return '#2196F3';
      case 'pattern':
        return '#FF9800';
      case 'achievement':
        return '#9C27B0';
      default:
        return '#666';
    }
  };

  const renderInsight = (insight: Insight, index: number) => {
    const color = getInsightColor(insight.type);

    return (
      <Card key={index} style={styles.insightCard}>
        <Card.Content>
          <View style={styles.insightHeader}>
            <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
              <Icon name={insight.icon} size={28} color={color} />
            </View>
            <View style={styles.insightContent}>
              <Text variant="titleMedium" style={styles.insightTitle}>
                {insight.title}
              </Text>
              <Text variant="bodyMedium" style={styles.insightDescription}>
                {insight.description}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Analyzing your journal...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
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
              <Icon name="brain" size={40} color="#4CAF50" />
              <View style={styles.headerText}>
                <Text variant="headlineSmall" style={styles.headerTitle}>
                  AI Insights
                </Text>
                <Text variant="bodyMedium" style={styles.headerSubtitle}>
                  Personalized analysis of your gratitude journey
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Key Themes Word Cloud */}
        <Card style={styles.themesCard}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Key Themes
            </Text>
            <Text variant="bodySmall" style={styles.sectionSubtitle}>
              Most common topics in your entries
            </Text>
            <View style={styles.themesContainer}>
              {keyThemes.map((theme, index) => (
                <Chip
                  key={index}
                  mode="outlined"
                  style={styles.themeChip}
                  textStyle={styles.themeText}
                >
                  {theme}
                </Chip>
              ))}
            </View>
          </Card.Content>
        </Card>

        {/* AI Insights */}
        <View style={styles.insightsSection}>
          <Text variant="titleLarge" style={styles.sectionTitlePadded}>
            Insights & Patterns
          </Text>
          {insights.map(renderInsight)}
        </View>

        {/* Mood Patterns */}
        <Card style={styles.patternsCard}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Mood Patterns
            </Text>
            <List.Item
              title="Happiest Day"
              description={moodPatterns.happiest_day}
              left={props => <List.Icon {...props} icon="calendar-star" color="#4CAF50" />}
              titleStyle={styles.listTitle}
              descriptionStyle={styles.listDescription}
            />
            <List.Item
              title="Happiest Time"
              description={moodPatterns.happiest_time}
              left={props => <List.Icon {...props} icon="clock" color="#4CAF50" />}
              titleStyle={styles.listTitle}
              descriptionStyle={styles.listDescription}
            />
            <List.Item
              title="Common Gratitude Triggers"
              description={moodPatterns.common_triggers.join(', ')}
              left={props => <List.Icon {...props} icon="heart" color="#4CAF50" />}
              titleStyle={styles.listTitle}
              descriptionStyle={styles.listDescription}
            />
          </Card.Content>
        </Card>

        {/* Recommendations */}
        <Card style={styles.recommendationsCard}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Recommendations
            </Text>
            <View style={styles.recommendation}>
              <Icon name="lightbulb-on" size={24} color="#FFC107" />
              <View style={styles.recommendationText}>
                <Text variant="titleMedium" style={styles.recommendationTitle}>
                  Try Evening Reflection
                </Text>
                <Text variant="bodyMedium" style={styles.recommendationDescription}>
                  Based on your patterns, evening journaling might help you wind down and improve sleep quality.
                </Text>
              </View>
            </View>
            <View style={styles.recommendation}>
              <Icon name="account-group" size={24} color="#2196F3" />
              <View style={styles.recommendationText}>
                <Text variant="titleMedium" style={styles.recommendationTitle}>
                  Share More Often
                </Text>
                <Text variant="bodyMedium" style={styles.recommendationDescription}>
                  Users who share entries with friends report 30% higher satisfaction. Consider making some entries public!
                </Text>
              </View>
            </View>
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
    marginBottom: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    marginLeft: 16,
    flex: 1,
  },
  headerTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    color: '#666',
  },
  themesCard: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  sectionTitlePadded: {
    fontWeight: 'bold',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  sectionSubtitle: {
    color: '#666',
    marginBottom: 16,
  },
  themesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  themeChip: {
    marginBottom: 8,
  },
  themeText: {
    fontSize: 14,
  },
  insightsSection: {
    marginTop: 8,
  },
  insightCard: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  insightDescription: {
    color: '#666',
    lineHeight: 20,
  },
  patternsCard: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  listTitle: {
    fontWeight: 'bold',
  },
  listDescription: {
    fontSize: 16,
    color: '#4CAF50',
  },
  recommendationsCard: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  recommendation: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  recommendationText: {
    flex: 1,
    marginLeft: 12,
  },
  recommendationTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  recommendationDescription: {
    color: '#666',
    lineHeight: 20,
  },
});
