/**
 * Family Journal Screen - Shared family journal entries
 * © 2024 Gratitude Journal. All Rights Reserved.
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import {
  Text,
  Card,
  Avatar,
  FAB,
  ActivityIndicator,
  Snackbar,
  Chip,
  IconButton,
  TextInput,
  Portal,
  Modal,
  Button,
} from 'react-native-paper';
import * as Haptics from 'expo-haptics';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ApiService from '../../services/ApiService';
import AnalyticsService from '../../services/AnalyticsService';

interface FamilyMember {
  _id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  relation: string;
}

interface FamilyEntry {
  _id: string;
  author: FamilyMember;
  content: string;
  mood: string;
  createdAt: string;
  likes: number;
  comments: number;
}

export default function FamilyJournalScreen() {
  const [entries, setEntries] = useState<FamilyEntry[]>([]);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    loadFamilyJournal();
    AnalyticsService.trackScreenView('family_journal_screen');
  }, []);

  const loadFamilyJournal = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getFamilyJournal();

      if (response.success && response.data) {
        setEntries(response.data.entries || []);
        setMembers(response.data.members || []);
      } else {
        showSnackbar(response.error || 'Failed to load family journal');
      }
    } catch (error) {
      showSnackbar('Error loading family journal');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadFamilyJournal();
  };

  const handleInviteMember = async () => {
    if (!inviteEmail.trim()) {
      showSnackbar('Please enter an email address');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const response = await ApiService.inviteFamilyMember(inviteEmail);

    if (response.success) {
      showSnackbar('Invitation sent!');
      setInviteEmail('');
      setInviteModalVisible(false);
    } else {
      showSnackbar(response.error || 'Failed to send invitation');
    }
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

  const renderEntry = ({ item }: { item: FamilyEntry }) => (
    <Card style={styles.entryCard}>
      <Card.Content>
        {/* Header */}
        <View style={styles.entryHeader}>
          <Avatar.Image
            size={40}
            source={
              item.author.avatarUrl
                ? { uri: item.author.avatarUrl }
                : require('../../../assets/default-avatar.png')
            }
          />
          <View style={styles.userInfo}>
            <Text variant="titleMedium" style={styles.userName}>
              {item.author.displayName}
            </Text>
            <View style={styles.metaRow}>
              <Text variant="bodySmall" style={styles.relation}>
                {item.author.relation}
              </Text>
              <Text variant="bodySmall" style={styles.timestamp}>
                • {new Date(item.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </Text>
            </View>
          </View>
          <View style={styles.moodBadge}>
            <Text style={styles.moodEmoji}>{getMoodEmoji(item.mood)}</Text>
          </View>
        </View>

        {/* Content */}
        <Text variant="bodyLarge" style={styles.entryContent}>
          {item.content}
        </Text>

        {/* Actions */}
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="heart-outline" size={20} color="#666" />
            <Text variant="bodySmall" style={styles.actionText}>
              {item.likes}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="comment-outline" size={20} color="#666" />
            <Text variant="bodySmall" style={styles.actionText}>
              {item.comments}
            </Text>
          </TouchableOpacity>
        </View>
      </Card.Content>
    </Card>
  );

  const renderHeader = () => (
    <>
      {/* Info Card */}
      <Card style={styles.infoCard}>
        <Card.Content>
          <View style={styles.infoHeader}>
            <Icon name="home-heart" size={40} color="#4CAF50" />
            <View style={styles.infoText}>
              <Text variant="headlineSmall" style={styles.infoTitle}>
                Family Journal
              </Text>
              <Text variant="bodyMedium" style={styles.infoSubtitle}>
                Share gratitude with your loved ones
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Family Members */}
      <Card style={styles.membersCard}>
        <Card.Content>
          <View style={styles.membersHeader}>
            <Text variant="titleMedium" style={styles.membersTitle}>
              Family Members ({members.length})
            </Text>
            <IconButton
              icon="account-plus"
              size={20}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setInviteModalVisible(true);
              }}
            />
          </View>
          <View style={styles.membersList}>
            {members.slice(0, 5).map((member, index) => (
              <TouchableOpacity key={member._id} style={styles.memberItem}>
                <Avatar.Image
                  size={48}
                  source={
                    member.avatarUrl
                      ? { uri: member.avatarUrl }
                      : require('../../../assets/default-avatar.png')
                  }
                />
                <Text variant="bodySmall" style={styles.memberName} numberOfLines={1}>
                  {member.displayName.split(' ')[0]}
                </Text>
              </TouchableOpacity>
            ))}
            {members.length > 5 && (
              <View style={styles.moreMembers}>
                <Avatar.Text size={48} label={`+${members.length - 5}`} />
              </View>
            )}
          </View>
        </Card.Content>
      </Card>

      <Text variant="titleLarge" style={styles.sectionTitle}>
        Family Entries
      </Text>
    </>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Icon name="home-heart" size={64} color="#ccc" />
      <Text variant="headlineSmall" style={styles.emptyTitle}>
        No Family Entries Yet
      </Text>
      <Text variant="bodyMedium" style={styles.emptyText}>
        Start sharing gratitude with your family!
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading family journal...</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={entries}
            renderItem={renderEntry}
            keyExtractor={item => item._id}
            contentContainerStyle={styles.listContent}
            ListHeaderComponent={renderHeader}
            ListEmptyComponent={renderEmpty}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
            }
          />

          {/* FAB */}
          <FAB
            icon="plus"
            style={styles.fab}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              showSnackbar('Create family entry coming soon!');
            }}
            color="#fff"
          />
        </>
      )}

      {/* Invite Modal */}
      <Portal>
        <Modal
          visible={inviteModalVisible}
          onDismiss={() => setInviteModalVisible(false)}
          contentContainerStyle={styles.modalContent}
        >
          <Text variant="headlineSmall" style={styles.modalTitle}>
            Invite Family Member
          </Text>
          <Text variant="bodyMedium" style={styles.modalSubtitle}>
            Enter their email address to send an invitation
          </Text>
          <TextInput
            mode="outlined"
            label="Email Address"
            value={inviteEmail}
            onChangeText={setInviteEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />
          <View style={styles.modalActions}>
            <Button
              mode="outlined"
              onPress={() => setInviteModalVisible(false)}
              style={styles.modalButton}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleInviteMember}
              style={styles.modalButton}
            >
              Send Invite
            </Button>
          </View>
        </Modal>
      </Portal>

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
  listContent: {
    padding: 16,
  },
  infoCard: {
    marginBottom: 16,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    flex: 1,
    marginLeft: 16,
  },
  infoTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  infoSubtitle: {
    color: '#666',
  },
  membersCard: {
    marginBottom: 16,
  },
  membersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  membersTitle: {
    fontWeight: 'bold',
  },
  membersList: {
    flexDirection: 'row',
    gap: 12,
  },
  memberItem: {
    alignItems: 'center',
    width: 60,
  },
  memberName: {
    marginTop: 4,
    textAlign: 'center',
  },
  moreMembers: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
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
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  relation: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  timestamp: {
    color: '#666',
    marginLeft: 4,
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
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 12,
    gap: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
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
    marginBottom: 8,
  },
  modalSubtitle: {
    color: '#666',
    marginBottom: 24,
  },
  input: {
    marginBottom: 24,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
  },
});
