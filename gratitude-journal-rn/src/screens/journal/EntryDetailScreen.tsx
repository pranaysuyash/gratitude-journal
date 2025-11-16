/**
 * Entry Detail Screen
 * View and interact with a single journal entry
 * © 2024 Gratitude Journal. All Rights Reserved.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  Share,
  Dimensions,
} from 'react-native';
import {
  Text,
  Card,
  Chip,
  Button,
  IconButton,
  Divider,
  ActivityIndicator,
  Menu,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Haptics from 'expo-haptics';
import ApiService, { Entry } from '../../services/ApiService';
import AnalyticsService, { AnalyticsEvent } from '../../services/AnalyticsService';

const { width } = Dimensions.get('window');

const MOOD_DETAILS: Record<string, { emoji: string; color: string; label: string }> = {
  grateful: { emoji: '🙏', color: '#4CAF50', label: 'Grateful' },
  joyful: { emoji: '😊', color: '#FFC107', label: 'Joyful' },
  peaceful: { emoji: '😌', color: '#2196F3', label: 'Peaceful' },
  excited: { emoji: '🤩', color: '#FF5722', label: 'Excited' },
  content: { emoji: '😄', color: '#9C27B0', label: 'Content' },
  hopeful: { emoji: '🌟', color: '#00BCD4', label: 'Hopeful' },
  loved: { emoji: '❤️', color: '#E91E63', label: 'Loved' },
  blessed: { emoji: '✨', color: '#673AB7', label: 'Blessed' },
};

export default function EntryDetailScreen({ navigation, route }: any) {
  const { entryId } = route.params;
  const [entry, setEntry] = useState<Entry | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    loadEntry();
  }, [entryId]);

  const loadEntry = async () => {
    setLoading(true);
    try {
      const response = await ApiService.getEntry(entryId);
      if (response.success && response.data) {
        setEntry(response.data);
        await AnalyticsService.trackEvent(AnalyticsEvent.ENTRY_VIEWED, {
          entry_id: entryId,
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load entry');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('NewEntry', { editEntry: entry });
    setMenuVisible(false);
  };

  const handleDelete = () => {
    setMenuVisible(false);
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this entry? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await ApiService.deleteEntry(entryId);
              await AnalyticsService.trackEvent(AnalyticsEvent.ENTRY_DELETED, {
                entry_id: entryId,
              });
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete entry');
            }
          },
        },
      ]
    );
  };

  const handleShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setMenuVisible(false);

    try {
      const result = await Share.share({
        message: `${entry?.content}\n\n- Shared from Gratitude Journal`,
      });

      if (result.action === Share.sharedAction) {
        await AnalyticsService.trackEvent(AnalyticsEvent.ENTRY_SHARED, {
          entry_id: entryId,
          share_method: result.activityType || 'unknown',
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to share entry');
    }
  };

  const handleMintNFT = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setMenuVisible(false);

    Alert.alert(
      'Mint as NFT',
      'This will create a unique NFT of your gratitude entry on the blockchain. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mint NFT',
          onPress: async () => {
            try {
              const response = await ApiService.mintNFT(entryId);
              if (response.success) {
                Alert.alert('Success! 🎉', 'Your entry has been minted as an NFT!');
                loadEntry(); // Reload to show NFT status
              }
            } catch (error) {
              Alert.alert('Coming Soon', 'NFT minting will be available soon!');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  if (!entry) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="alert-circle" size={80} color="#CCC" />
        <Text variant="headlineSmall" style={styles.errorText}>
          Entry not found
        </Text>
      </View>
    );
  }

  const moodDetail = MOOD_DETAILS[entry.mood] || MOOD_DETAILS.grateful;
  const date = new Date(entry.createdAt);
  const formattedDate = date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedTime = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header Card */}
        <Card style={[styles.headerCard, { backgroundColor: moodDetail.color + '20' }]}>
          <Card.Content>
            <View style={styles.headerContent}>
              <View>
                <Text variant="bodySmall" style={styles.dateText}>
                  {formattedDate}
                </Text>
                <Text variant="bodySmall" style={styles.timeText}>
                  {formattedTime}
                </Text>
              </View>
              <View style={[styles.moodBadge, { backgroundColor: moodDetail.color }]}>
                <Text style={styles.moodEmoji}>{moodDetail.emoji}</Text>
                <Text style={styles.moodLabel}>{moodDetail.label}</Text>
              </View>
            </View>

            {/* Location & Weather */}
            {(entry.location || entry.weather) && (
              <View style={styles.metaInfo}>
                {entry.location && entry.location.name && (
                  <View style={styles.metaItem}>
                    <Icon name="map-marker" size={16} color="#666" />
                    <Text variant="bodySmall" style={styles.metaText}>
                      {entry.location.name}
                    </Text>
                  </View>
                )}
                {entry.weather && (
                  <View style={styles.metaItem}>
                    <Text variant="bodySmall" style={styles.metaText}>
                      {entry.weather.icon} {entry.weather.temperature}°F • {entry.weather.condition}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Content */}
        <Card style={styles.contentCard}>
          <Card.Content>
            <Text variant="bodyLarge" style={styles.contentText}>
              {entry.content}
            </Text>
          </Card.Content>
        </Card>

        {/* Photos */}
        {entry.photoUrls && entry.photoUrls.length > 0 && (
          <Card style={styles.photosCard}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Photos
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {entry.photoUrls.map((photoUrl, index) => (
                  <Image
                    key={index}
                    source={{ uri: photoUrl }}
                    style={styles.photo}
                    resizeMode="cover"
                  />
                ))}
              </ScrollView>
            </Card.Content>
          </Card>
        )}

        {/* Categories & Tags */}
        {((entry.categories && entry.categories.length > 0) ||
          (entry.tags && entry.tags.length > 0)) && (
          <Card style={styles.tagsCard}>
            <Card.Content>
              {entry.categories && entry.categories.length > 0 && (
                <View style={styles.section}>
                  <Text variant="titleSmall" style={styles.sectionTitle}>
                    Categories
                  </Text>
                  <View style={styles.chipsContainer}>
                    {entry.categories.map((category) => (
                      <Chip key={category} style={styles.chip}>
                        {category}
                      </Chip>
                    ))}
                  </View>
                </View>
              )}

              {entry.tags && entry.tags.length > 0 && (
                <View style={styles.section}>
                  <Text variant="titleSmall" style={styles.sectionTitle}>
                    Tags
                  </Text>
                  <View style={styles.chipsContainer}>
                    {entry.tags.map((tag) => (
                      <Chip key={tag} icon="tag" style={styles.chip}>
                        {tag}
                      </Chip>
                    ))}
                  </View>
                </View>
              )}
            </Card.Content>
          </Card>
        )}

        {/* AI Analysis */}
        {entry.aiAnalysis && (
          <Card style={styles.aiCard}>
            <Card.Content>
              <View style={styles.aiHeader}>
                <Icon name="robot" size={24} color="#4CAF50" />
                <Text variant="titleMedium" style={styles.aiTitle}>
                  AI Insights
                </Text>
              </View>

              {entry.aiAnalysis.summary && (
                <View style={styles.aiSection}>
                  <Text variant="titleSmall" style={styles.aiSectionTitle}>
                    Summary
                  </Text>
                  <Text variant="bodyMedium">{entry.aiAnalysis.summary}</Text>
                </View>
              )}

              {entry.aiAnalysis.sentimentScore !== undefined && (
                <View style={styles.aiSection}>
                  <Text variant="titleSmall" style={styles.aiSectionTitle}>
                    Sentiment Score
                  </Text>
                  <Text variant="bodyMedium" style={styles.sentimentScore}>
                    {(entry.aiAnalysis.sentimentScore * 100).toFixed(0)}% Positive
                  </Text>
                </View>
              )}

              {entry.aiAnalysis.keyThemes && entry.aiAnalysis.keyThemes.length > 0 && (
                <View style={styles.aiSection}>
                  <Text variant="titleSmall" style={styles.aiSectionTitle}>
                    Key Themes
                  </Text>
                  <View style={styles.chipsContainer}>
                    {entry.aiAnalysis.keyThemes.map((theme) => (
                      <Chip key={theme} style={styles.chip}>
                        {theme}
                      </Chip>
                    ))}
                  </View>
                </View>
              )}
            </Card.Content>
          </Card>
        )}

        {/* NFT Status */}
        {entry.nftMinted && (
          <Card style={styles.nftCard}>
            <Card.Content>
              <View style={styles.nftHeader}>
                <Icon name="shield-star" size={24} color="#FF9800" />
                <Text variant="titleMedium" style={styles.nftTitle}>
                  Minted as NFT
                </Text>
              </View>
              <Text variant="bodyMedium">Token ID: {entry.nftTokenId}</Text>
            </Card.Content>
          </Card>
        )}
      </ScrollView>

      {/* Menu Button */}
      <Menu
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        anchor={
          <IconButton
            icon="dots-vertical"
            size={24}
            onPress={() => setMenuVisible(true)}
            style={styles.menuButton}
          />
        }
      >
        <Menu.Item onPress={handleEdit} leadingIcon="pencil" title="Edit" />
        <Menu.Item onPress={handleShare} leadingIcon="share-variant" title="Share" />
        {!entry.nftMinted && (
          <Menu.Item onPress={handleMintNFT} leadingIcon="shield-star" title="Mint as NFT" />
        )}
        <Divider />
        <Menu.Item onPress={handleDelete} leadingIcon="delete" title="Delete" />
      </Menu>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  headerCard: {
    margin: 16,
    marginBottom: 8,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    color: '#666',
    fontWeight: '600',
  },
  timeText: {
    color: '#999',
    marginTop: 2,
  },
  moodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  moodEmoji: {
    fontSize: 24,
  },
  moodLabel: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  metaInfo: {
    marginTop: 12,
    gap: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    color: '#666',
  },
  contentCard: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  contentText: {
    lineHeight: 24,
    color: '#333',
  },
  photosCard: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
  },
  photo: {
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: 8,
    marginRight: 12,
  },
  tagsCard: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  section: {
    marginBottom: 16,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    marginBottom: 4,
  },
  aiCard: {
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: '#E8F5E9',
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  aiTitle: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  aiSection: {
    marginBottom: 16,
  },
  aiSectionTitle: {
    color: '#666',
    marginBottom: 8,
  },
  sentimentScore: {
    color: '#4CAF50',
    fontWeight: 'bold',
    fontSize: 18,
  },
  nftCard: {
    marginHorizontal: 16,
    marginBottom: 24,
    backgroundColor: '#FFF3E0',
  },
  nftHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  nftTitle: {
    color: '#FF9800',
    fontWeight: 'bold',
  },
  menuButton: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    marginTop: 16,
    color: '#999',
  },
});
