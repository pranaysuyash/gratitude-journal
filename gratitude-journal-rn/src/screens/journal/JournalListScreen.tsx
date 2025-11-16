/**
 * Journal List Screen
 * Display and filter journal entries
 * © 2024 Gratitude Journal. All Rights Reserved.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import {
  Text,
  Card,
  Chip,
  FAB,
  Searchbar,
  Menu,
  IconButton,
  ActivityIndicator,
  Divider,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Haptics from 'expo-haptics';
import ApiService, { Entry } from '../../services/ApiService';
import AnalyticsService, { AnalyticsEvent } from '../../services/AnalyticsService';

const MOOD_EMOJIS: Record<string, string> = {
  grateful: '🙏',
  joyful: '😊',
  peaceful: '😌',
  excited: '🤩',
  content: '😄',
  hopeful: '🌟',
  loved: '❤️',
  blessed: '✨',
};

export default function JournalListScreen({ navigation }: any) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'mood'>('date');
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    loadEntries();
    const unsubscribe = navigation.addListener('focus', () => {
      loadEntries();
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    filterAndSortEntries();
  }, [entries, searchQuery, selectedMood, sortBy]);

  const loadEntries = async (isRefreshing: boolean = false) => {
    if (!isRefreshing) {
      setLoading(true);
    }

    try {
      const response = await ApiService.getEntries();

      if (response.success && response.data) {
        setEntries(response.data.entries || []);

        await AnalyticsService.trackEvent(AnalyticsEvent.ENTRIES_VIEWED, {
          count: response.data.entries?.length || 0,
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load entries');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadEntries(true);
  }, []);

  const filterAndSortEntries = () => {
    let filtered = [...entries];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter((entry) =>
        entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filter by mood
    if (selectedMood) {
      filtered = filtered.filter((entry) => entry.mood === selectedMood);
    }

    // Sort entries
    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else {
        return a.mood.localeCompare(b.mood);
      }
    });

    setFilteredEntries(filtered);
  };

  const handleEntryPress = (entry: Entry) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('EntryDetail', { entryId: entry._id });
  };

  const handleNewEntry = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('NewEntry');
  };

  const renderEntryCard = ({ item }: { item: Entry }) => {
    const date = new Date(item.createdAt);
    const formattedDate = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const formattedTime = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });

    return (
      <TouchableOpacity onPress={() => handleEntryPress(item)}>
        <Card style={styles.entryCard}>
          <Card.Content>
            {/* Header */}
            <View style={styles.cardHeader}>
              <View style={styles.dateContainer}>
                <Text variant="bodySmall" style={styles.dateText}>
                  {formattedDate}
                </Text>
                <Text variant="bodySmall" style={styles.timeText}>
                  {formattedTime}
                </Text>
              </View>
              <View style={styles.moodContainer}>
                <Text style={styles.moodEmoji}>{MOOD_EMOJIS[item.mood] || '😊'}</Text>
              </View>
            </View>

            {/* Content Preview */}
            <Text variant="bodyLarge" style={styles.contentPreview} numberOfLines={3}>
              {item.content}
            </Text>

            {/* Photos Preview */}
            {item.photoUrls && item.photoUrls.length > 0 && (
              <View style={styles.photosPreview}>
                <Icon name="image" size={16} color="#666" />
                <Text variant="bodySmall" style={styles.photoCount}>
                  {item.photoUrls.length} photo{item.photoUrls.length > 1 ? 's' : ''}
                </Text>
              </View>
            )}

            {/* Tags */}
            {item.tags && item.tags.length > 0 && (
              <View style={styles.tagsContainer}>
                {item.tags.slice(0, 3).map((tag) => (
                  <Chip key={tag} compact style={styles.tag}>
                    {tag}
                  </Chip>
                ))}
                {item.tags.length > 3 && (
                  <Text variant="bodySmall" style={styles.moreText}>
                    +{item.tags.length - 3} more
                  </Text>
                )}
              </View>
            )}

            {/* AI Analysis Badge */}
            {item.aiAnalysis && (
              <View style={styles.aiAnalysisContainer}>
                <Icon name="robot" size={16} color="#4CAF50" />
                <Text variant="bodySmall" style={styles.aiAnalysisText}>
                  AI Analyzed • Sentiment: {(item.aiAnalysis.sentimentScore * 100).toFixed(0)}%
                </Text>
              </View>
            )}

            {/* Location */}
            {item.location && item.location.name && (
              <View style={styles.locationContainer}>
                <Icon name="map-marker" size={14} color="#666" />
                <Text variant="bodySmall" style={styles.locationText}>
                  {item.location.name}
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="book-open-variant" size={80} color="#CCC" />
      <Text variant="headlineSmall" style={styles.emptyTitle}>
        No Entries Yet
      </Text>
      <Text variant="bodyLarge" style={styles.emptyText}>
        Start your gratitude journey by creating your first entry
      </Text>
      <FAB
        icon="plus"
        label="Create Entry"
        onPress={handleNewEntry}
        style={styles.emptyFab}
      />
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text variant="bodyLarge" style={styles.loadingText}>
          Loading your entries...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <Searchbar
        placeholder="Search entries..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
        icon="magnify"
        clearIcon="close"
      />

      {/* Filter Bar */}
      <View style={styles.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <Chip
            selected={!selectedMood}
            onPress={() => {
              setSelectedMood(null);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            style={styles.filterChip}
          >
            All
          </Chip>
          {Object.entries(MOOD_EMOJIS).map(([mood, emoji]) => (
            <Chip
              key={mood}
              selected={selectedMood === mood}
              onPress={() => {
                setSelectedMood(selectedMood === mood ? null : mood);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              style={styles.filterChip}
            >
              {emoji} {mood}
            </Chip>
          ))}
        </ScrollView>

        {/* Sort Menu */}
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <IconButton
              icon="sort"
              onPress={() => {
                setMenuVisible(true);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            />
          }
        >
          <Menu.Item
            onPress={() => {
              setSortBy('date');
              setMenuVisible(false);
            }}
            title="Sort by Date"
            leadingIcon={sortBy === 'date' ? 'check' : undefined}
          />
          <Menu.Item
            onPress={() => {
              setSortBy('mood');
              setMenuVisible(false);
            }}
            title="Sort by Mood"
            leadingIcon={sortBy === 'mood' ? 'check' : undefined}
          />
        </Menu>
      </View>

      {/* Results Count */}
      {(searchQuery || selectedMood) && (
        <View style={styles.resultsContainer}>
          <Text variant="bodySmall" style={styles.resultsText}>
            {filteredEntries.length} result{filteredEntries.length !== 1 ? 's' : ''} found
          </Text>
          {(searchQuery || selectedMood) && (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery('');
                setSelectedMood(null);
              }}
            >
              <Text style={styles.clearFilters}>Clear filters</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <Divider />

      {/* Entries List */}
      {entries.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={filteredEntries}
          renderItem={renderEntryCard}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#4CAF50']}
            />
          }
          ListEmptyComponent={() => (
            <View style={styles.noResultsContainer}>
              <Icon name="magnify" size={60} color="#CCC" />
              <Text variant="bodyLarge" style={styles.noResultsText}>
                No entries match your search
              </Text>
            </View>
          )}
        />
      )}

      {/* FAB */}
      {entries.length > 0 && (
        <FAB
          icon="plus"
          style={styles.fab}
          onPress={handleNewEntry}
          label="New Entry"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  searchBar: {
    margin: 16,
    marginBottom: 8,
    elevation: 2,
  },
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  filterChip: {
    marginRight: 8,
  },
  resultsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  resultsText: {
    color: '#666',
  },
  clearFilters: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  entryCard: {
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateText: {
    color: '#666',
    fontWeight: '600',
  },
  timeText: {
    color: '#999',
  },
  moodContainer: {
    backgroundColor: '#F5F5F5',
    padding: 8,
    borderRadius: 20,
  },
  moodEmoji: {
    fontSize: 24,
  },
  contentPreview: {
    marginBottom: 12,
    lineHeight: 22,
    color: '#333',
  },
  photosPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 4,
  },
  photoCount: {
    color: '#666',
  },
  tagsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  tag: {
    height: 28,
  },
  moreText: {
    color: '#666',
    fontStyle: 'italic',
  },
  aiAnalysisContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  aiAnalysisText: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    color: '#666',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#4CAF50',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    marginTop: 16,
    marginBottom: 8,
    color: '#666',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginBottom: 24,
  },
  emptyFab: {
    backgroundColor: '#4CAF50',
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
  noResultsContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  noResultsText: {
    marginTop: 16,
    color: '#999',
  },
});
