/**
 * Social Feed Screen - View friends' public entries
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
  Avatar,
  IconButton,
  ActivityIndicator,
  Snackbar,
  Chip,
} from 'react-native-paper';
import * as Haptics from 'expo-haptics';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import ApiService from '../../services/ApiService';
import AnalyticsService, { AnalyticsEvent } from '../../services/AnalyticsService';

interface FeedEntry {
  _id: string;
  userId: {
    _id: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
  };
  content: string;
  mood: string;
  tags: string[];
  createdAt: string;
  likes: number;
  comments: number;
  isLiked: boolean;
}

export default function SocialFeedScreen() {
  const navigation = useNavigation();
  const [entries, setEntries] = useState<FeedEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    loadFeed();
    AnalyticsService.trackScreenView('social_feed_screen');
  }, []);

  const loadFeed = async (pageNum = 1, refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await ApiService.getFeed(pageNum, 20);

      if (response.success && response.data) {
        const newEntries = response.data.entries || [];

        if (refresh || pageNum === 1) {
          setEntries(newEntries);
        } else {
          setEntries(prev => [...prev, ...newEntries]);
        }

        setHasMore(newEntries.length === 20);
        setPage(pageNum);
      } else {
        showSnackbar(response.error || 'Failed to load feed');
      }
    } catch (error) {
      showSnackbar('Error loading feed');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadFeed(1, true);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      loadFeed(page + 1);
    }
  };

  const handleLike = async (entryId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const response = await ApiService.likeEntry(entryId);

    if (response.success) {
      setEntries(prev =>
        prev.map(entry =>
          entry._id === entryId
            ? {
                ...entry,
                isLiked: !entry.isLiked,
                likes: entry.isLiked ? entry.likes - 1 : entry.likes + 1,
              }
            : entry
        )
      );
      AnalyticsService.trackEvent(AnalyticsEvent.ENTRY_LIKED);
    } else {
      showSnackbar(response.error || 'Failed to like entry');
    }
  };

  const handleComment = (entryId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('EntryDetail' as never, { entryId } as never);
  };

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  const getMoodEmoji = (mood: string) => {
    const moodEmojis: { [key: string]: string } = {
      happy: '😊',
      excited: '🎉',
      grateful: '🙏',
      peaceful: '😌',
      loved: '❤️',
      calm: '😇',
      inspired: '✨',
      sad: '😢',
    };
    return moodEmojis[mood.toLowerCase()] || '😊';
  };

  const renderEntry = ({ item }: { item: FeedEntry }) => (
    <Card style={styles.entryCard}>
      <Card.Content>
        {/* Header */}
        <View style={styles.entryHeader}>
          <Avatar.Image
            size={40}
            source={
              item.userId.avatarUrl
                ? { uri: item.userId.avatarUrl }
                : require('../../../assets/default-avatar.png')
            }
          />
          <View style={styles.userInfo}>
            <Text variant="titleMedium" style={styles.userName}>
              {item.userId.displayName}
            </Text>
            <Text variant="bodySmall" style={styles.timestamp}>
              {new Date(item.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              })}
            </Text>
          </View>
          <View style={styles.moodBadge}>
            <Text style={styles.moodEmoji}>{getMoodEmoji(item.mood)}</Text>
          </View>
        </View>

        {/* Content */}
        <Text variant="bodyLarge" style={styles.entryContent}>
          {item.content}
        </Text>

        {/* Tags */}
        {item.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {item.tags.slice(0, 3).map((tag, index) => (
              <Chip key={index} mode="outlined" compact style={styles.tagChip}>
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

        {/* Actions */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleLike(item._id)}
          >
            <Icon
              name={item.isLiked ? 'heart' : 'heart-outline'}
              size={24}
              color={item.isLiked ? '#E91E63' : '#666'}
            />
            <Text
              variant="bodyMedium"
              style={[styles.actionText, item.isLiked && styles.actionTextActive]}
            >
              {item.likes}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleComment(item._id)}
          >
            <Icon name="comment-outline" size={24} color="#666" />
            <Text variant="bodyMedium" style={styles.actionText}>
              {item.comments}
            </Text>
          </TouchableOpacity>

          <IconButton
            icon="share-variant"
            size={20}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              showSnackbar('Share coming soon!');
            }}
          />
        </View>
      </Card.Content>
    </Card>
  );

  const renderFooter = () => {
    if (!loading || refreshing) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#4CAF50" />
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Icon name="account-group" size={64} color="#ccc" />
      <Text variant="headlineSmall" style={styles.emptyTitle}>
        No Feed Yet
      </Text>
      <Text variant="bodyMedium" style={styles.emptyText}>
        Add friends to see their gratitude entries here!
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={entries}
        renderItem={renderEntry}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={!loading ? renderEmpty : null}
      />

      {loading && entries.length === 0 && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading feed...</Text>
        </View>
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
  listContent: {
    padding: 16,
  },
  entryCard: {
    marginBottom: 16,
  },
  entryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    fontWeight: 'bold',
  },
  timestamp: {
    color: '#666',
  },
  moodBadge: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moodEmoji: {
    fontSize: 24,
  },
  entryContent: {
    marginBottom: 12,
    lineHeight: 24,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  tagChip: {
    height: 28,
  },
  moreTags: {
    color: '#666',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  actionText: {
    marginLeft: 4,
    color: '#666',
  },
  actionTextActive: {
    color: '#E91E63',
  },
  footer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
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
});
