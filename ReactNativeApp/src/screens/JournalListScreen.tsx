/**
 * Journal List Screen
 * Browse and search all journal entries
 * © 2024 Gratitude Journal. All Rights Reserved.
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import {
  Text,
  Card,
  Searchbar,
  Chip,
  FAB,
  Menu,
  IconButton,
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { fetchEntries } from '../store/slices/entriesSlice';

export default function JournalListScreen({ navigation }: any) {
  const dispatch = useDispatch();
  const { entries, loading, pagination } = useSelector((state: RootState) => state.entries);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [sortBy, setSortBy] = useState('date');

  useEffect(() => {
    loadEntries();
  }, [selectedMood, sortBy]);

  const loadEntries = () => {
    dispatch(
      fetchEntries({
        page: 1,
        limit: 20,
        mood: selectedMood || undefined,
        search: searchQuery || undefined,
      }) as any
    );
  };

  const handleRefresh = () => {
    loadEntries();
  };

  const handleSearch = () => {
    loadEntries();
  };

  const handleMoodFilter = (mood: string | null) => {
    setSelectedMood(mood);
  };

  const renderEntry = ({ item }: any) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('EntryDetail', { id: item.id })}
    >
      <Card style={styles.entryCard}>
        <Card.Content>
          <View style={styles.entryHeader}>
            <View style={styles.entryInfo}>
              <Text variant="titleMedium" style={styles.entryTitle}>
                {item.title || item.content.substring(0, 50)}
              </Text>
              <Text variant="bodySmall" style={styles.entryDate}>
                {new Date(item.date).toLocaleDateString('en-US', {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </Text>
            </View>
            <Text style={styles.moodEmoji}>{getMoodEmoji(item.mood)}</Text>
          </View>

          <Text
            variant="bodyMedium"
            numberOfLines={3}
            style={styles.entryContent}
          >
            {item.content}
          </Text>

          {item.tags && item.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {item.tags.slice(0, 3).map((tag: string) => (
                <Chip key={tag} compact style={styles.tag}>
                  {tag}
                </Chip>
              ))}
              {item.tags.length > 3 && (
                <Text variant="bodySmall" style={styles.moreTags}>
                  +{item.tags.length - 3} more
                </Text>
              )}
            </View>
          )}

          <View style={styles.entryMeta}>
            <Text variant="bodySmall" style={styles.metaText}>
              {item.content.split(/\s+/).length} words
            </Text>
            {item.isFavorite && <Text>⭐</Text>}
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  const MOODS = [
    { value: null, label: 'All' },
    { value: 'amazing', label: '🤩' },
    { value: 'great', label: '😊' },
    { value: 'good', label: '🙂' },
    { value: 'okay', label: '😐' },
    { value: 'sad', label: '😔' },
    { value: 'anxious', label: '😰' },
    { value: 'angry', label: '😠' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search entries..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          onSubmitEditing={handleSearch}
          style={styles.searchBar}
        />
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <IconButton
              icon="sort"
              size={24}
              onPress={() => setMenuVisible(true)}
            />
          }
        >
          <Menu.Item
            onPress={() => {
              setSortBy('date');
              setMenuVisible(false);
            }}
            title="Date"
          />
          <Menu.Item
            onPress={() => {
              setSortBy('mood');
              setMenuVisible(false);
            }}
            title="Mood"
          />
          <Menu.Item
            onPress={() => {
              setSortBy('wordCount');
              setMenuVisible(false);
            }}
            title="Word Count"
          />
        </Menu>
      </View>

      <View style={styles.filtersContainer}>
        {MOODS.map(mood => (
          <Chip
            key={mood.value || 'all'}
            selected={selectedMood === mood.value}
            onPress={() => handleMoodFilter(mood.value)}
            style={styles.moodChip}
          >
            {mood.label}
          </Chip>
        ))}
      </View>

      <FlatList
        data={entries}
        renderItem={renderEntry}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text variant="titleLarge" style={styles.emptyText}>
              No entries yet
            </Text>
            <Text variant="bodyMedium" style={styles.emptySubtext}>
              Start your gratitude journey by creating your first entry!
            </Text>
          </View>
        }
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('NewEntry')}
      />
    </View>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchBar: {
    flex: 1,
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  moodChip: {
    marginRight: 8,
  },
  listContent: {
    padding: 16,
  },
  entryCard: {
    marginBottom: 16,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  entryInfo: {
    flex: 1,
  },
  entryTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  entryDate: {
    color: '#666',
  },
  moodEmoji: {
    fontSize: 32,
  },
  entryContent: {
    marginBottom: 12,
    color: '#333',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 8,
  },
  tag: {
    height: 24,
  },
  moreTags: {
    color: '#666',
    alignSelf: 'center',
  },
  entryMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaText: {
    color: '#999',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    marginBottom: 8,
    color: '#666',
  },
  emptySubtext: {
    color: '#999',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
});
