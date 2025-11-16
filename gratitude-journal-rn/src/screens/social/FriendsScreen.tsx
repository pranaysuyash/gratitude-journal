/**
 * Friends Screen - Manage friends and friend requests
 * © 2024 Gratitude Journal. All Rights Reserved.
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import {
  Text,
  Card,
  Avatar,
  Button,
  IconButton,
  ActivityIndicator,
  Searchbar,
  Snackbar,
  SegmentedButtons,
  List,
  Chip,
} from 'react-native-paper';
import * as Haptics from 'expo-haptics';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ApiService from '../../services/ApiService';
import AnalyticsService, { AnalyticsEvent } from '../../services/AnalyticsService';

interface Friend {
  _id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  stats?: {
    currentStreak: number;
    totalEntries: number;
  };
}

interface FriendRequest {
  _id: string;
  from: Friend;
  createdAt: string;
}

type TabType = 'friends' | 'pending' | 'search';

export default function FriendsScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('friends');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const [searchResults, setSearchResults] = useState<Friend[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searching, setSearching] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    loadFriends();
    AnalyticsService.trackScreenView('friends_screen');
  }, []);

  const loadFriends = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getFriends();

      if (response.success && response.data) {
        // Separate friends and pending requests
        const friendsList = response.data.filter((f: any) => f.status === 'accepted');
        const pending = response.data.filter((f: any) => f.status === 'pending');

        setFriends(friendsList);
        setPendingRequests(pending);
      } else {
        showSnackbar(response.error || 'Failed to load friends');
      }
    } catch (error) {
      showSnackbar('Error loading friends');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadFriends();
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);

    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      const response = await ApiService.searchUsers(query);

      if (response.success && response.data) {
        setSearchResults(response.data);
      } else {
        showSnackbar(response.error || 'Search failed');
      }
    } catch (error) {
      showSnackbar('Error searching users');
    } finally {
      setSearching(false);
    }
  };

  const handleSendFriendRequest = async (userId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const response = await ApiService.sendFriendRequest(userId);

    if (response.success) {
      showSnackbar('Friend request sent!');
      AnalyticsService.trackEvent(AnalyticsEvent.FRIEND_ADDED);
      // Remove from search results
      setSearchResults(prev => prev.filter(u => u._id !== userId));
    } else {
      showSnackbar(response.error || 'Failed to send request');
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const response = await ApiService.acceptFriendRequest(requestId);

    if (response.success) {
      showSnackbar('Friend request accepted!');
      loadFriends();
    } else {
      showSnackbar(response.error || 'Failed to accept request');
    }
  };

  const handleRemoveFriend = (friendId: string, friendName: string) => {
    Alert.alert(
      'Remove Friend',
      `Are you sure you want to remove ${friendName} from your friends?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            // API call to remove friend would go here
            showSnackbar(`Removed ${friendName}`);
            setFriends(prev => prev.filter(f => f._id !== friendId));
          },
        },
      ]
    );
  };

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  const renderFriend = (friend: Friend) => (
    <Card key={friend._id} style={styles.friendCard}>
      <Card.Content>
        <View style={styles.friendRow}>
          <Avatar.Image
            size={56}
            source={
              friend.avatarUrl
                ? { uri: friend.avatarUrl }
                : require('../../../assets/default-avatar.png')
            }
          />
          <View style={styles.friendInfo}>
            <Text variant="titleMedium" style={styles.friendName}>
              {friend.displayName}
            </Text>
            <Text variant="bodySmall" style={styles.friendUsername}>
              @{friend.username}
            </Text>
            {friend.stats && (
              <View style={styles.friendStats}>
                <View style={styles.statItem}>
                  <Icon name="fire" size={14} color="#FF5722" />
                  <Text variant="bodySmall" style={styles.statText}>
                    {friend.stats.currentStreak} day streak
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Icon name="book" size={14} color="#4CAF50" />
                  <Text variant="bodySmall" style={styles.statText}>
                    {friend.stats.totalEntries} entries
                  </Text>
                </View>
              </View>
            )}
          </View>
          <IconButton
            icon="dots-vertical"
            size={20}
            onPress={() => handleRemoveFriend(friend._id, friend.displayName)}
          />
        </View>
      </Card.Content>
    </Card>
  );

  const renderPendingRequest = (request: FriendRequest) => (
    <Card key={request._id} style={styles.requestCard}>
      <Card.Content>
        <View style={styles.requestRow}>
          <Avatar.Image
            size={48}
            source={
              request.from.avatarUrl
                ? { uri: request.from.avatarUrl }
                : require('../../../assets/default-avatar.png')
            }
          />
          <View style={styles.requestInfo}>
            <Text variant="titleMedium" style={styles.friendName}>
              {request.from.displayName}
            </Text>
            <Text variant="bodySmall" style={styles.friendUsername}>
              @{request.from.username}
            </Text>
            <Text variant="bodySmall" style={styles.requestTime}>
              {new Date(request.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </View>
        <View style={styles.requestActions}>
          <Button
            mode="contained"
            onPress={() => handleAcceptRequest(request._id)}
            style={styles.acceptButton}
            compact
          >
            Accept
          </Button>
          <Button
            mode="outlined"
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setPendingRequests(prev => prev.filter(r => r._id !== request._id));
              showSnackbar('Request declined');
            }}
            style={styles.declineButton}
            compact
          >
            Decline
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  const renderSearchResult = (user: Friend) => (
    <Card key={user._id} style={styles.searchCard}>
      <Card.Content>
        <View style={styles.friendRow}>
          <Avatar.Image
            size={48}
            source={
              user.avatarUrl
                ? { uri: user.avatarUrl }
                : require('../../../assets/default-avatar.png')
            }
          />
          <View style={styles.friendInfo}>
            <Text variant="titleMedium" style={styles.friendName}>
              {user.displayName}
            </Text>
            <Text variant="bodySmall" style={styles.friendUsername}>
              @{user.username}
            </Text>
          </View>
          <Button
            mode="contained"
            onPress={() => handleSendFriendRequest(user._id)}
            compact
          >
            Add
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <SegmentedButtons
          value={activeTab}
          onValueChange={(value) => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setActiveTab(value as TabType);
          }}
          buttons={[
            {
              value: 'friends',
              label: `Friends (${friends.length})`,
              icon: 'account-group',
            },
            {
              value: 'pending',
              label: `Requests (${pendingRequests.length})`,
              icon: 'account-clock',
            },
            {
              value: 'search',
              label: 'Search',
              icon: 'magnify',
            },
          ]}
        />
      </View>

      {/* Search Bar (visible in search tab) */}
      {activeTab === 'search' && (
        <Searchbar
          placeholder="Search users..."
          onChangeText={handleSearch}
          value={searchQuery}
          style={styles.searchbar}
          loading={searching}
        />
      )}

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          {activeTab === 'friends' && (
            <>
              {friends.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Icon name="account-group" size={64} color="#ccc" />
                  <Text variant="headlineSmall" style={styles.emptyTitle}>
                    No Friends Yet
                  </Text>
                  <Text variant="bodyMedium" style={styles.emptyText}>
                    Search for users and send friend requests!
                  </Text>
                </View>
              ) : (
                friends.map(renderFriend)
              )}
            </>
          )}

          {activeTab === 'pending' && (
            <>
              {pendingRequests.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Icon name="account-clock" size={64} color="#ccc" />
                  <Text variant="headlineSmall" style={styles.emptyTitle}>
                    No Pending Requests
                  </Text>
                  <Text variant="bodyMedium" style={styles.emptyText}>
                    Friend requests will appear here
                  </Text>
                </View>
              ) : (
                pendingRequests.map(renderPendingRequest)
              )}
            </>
          )}

          {activeTab === 'search' && (
            <>
              {searchQuery.length < 2 ? (
                <View style={styles.emptyContainer}>
                  <Icon name="magnify" size={64} color="#ccc" />
                  <Text variant="headlineSmall" style={styles.emptyTitle}>
                    Search Users
                  </Text>
                  <Text variant="bodyMedium" style={styles.emptyText}>
                    Enter a username to search
                  </Text>
                </View>
              ) : searchResults.length === 0 && !searching ? (
                <View style={styles.emptyContainer}>
                  <Icon name="account-search" size={64} color="#ccc" />
                  <Text variant="headlineSmall" style={styles.emptyTitle}>
                    No Results
                  </Text>
                  <Text variant="bodyMedium" style={styles.emptyText}>
                    No users found matching "{searchQuery}"
                  </Text>
                </View>
              ) : (
                searchResults.map(renderSearchResult)
              )}
            </>
          )}

          <View style={{ height: 16 }} />
        </ScrollView>
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
  tabsContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchbar: {
    margin: 16,
    marginTop: 0,
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
    padding: 16,
  },
  friendCard: {
    marginBottom: 12,
  },
  requestCard: {
    marginBottom: 12,
  },
  searchCard: {
    marginBottom: 12,
  },
  friendRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  friendInfo: {
    flex: 1,
    marginLeft: 12,
  },
  friendName: {
    fontWeight: 'bold',
  },
  friendUsername: {
    color: '#666',
    marginTop: 2,
  },
  friendStats: {
    flexDirection: 'row',
    marginTop: 4,
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    color: '#666',
  },
  requestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  requestInfo: {
    flex: 1,
    marginLeft: 12,
  },
  requestTime: {
    color: '#999',
    marginTop: 2,
  },
  requestActions: {
    flexDirection: 'row',
    gap: 8,
  },
  acceptButton: {
    flex: 1,
  },
  declineButton: {
    flex: 1,
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
