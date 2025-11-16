/**
 * NFT Gallery Screen - Display minted NFT entries
 * © 2024 Gratitude Journal. All Rights Reserved.
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Dimensions,
  RefreshControl,
  TouchableOpacity,
  Share,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  ActivityIndicator,
  Snackbar,
  Chip,
  Portal,
  Modal,
} from 'react-native-paper';
import * as Haptics from 'expo-haptics';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ApiService from '../../services/ApiService';
import AnalyticsService from '../../services/AnalyticsService';

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2;

interface NFT {
  _id: string;
  entryId: string;
  tokenId: string;
  txHash: string;
  blockchain: 'ethereum' | 'polygon';
  content: string;
  imageUrl?: string;
  createdAt: string;
  metadata: {
    mood: string;
    date: string;
  };
}

export default function NFTGalleryScreen() {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    loadNFTs();
    AnalyticsService.trackScreenView('nft_gallery_screen');
  }, []);

  const loadNFTs = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getNFTs();

      if (response.success && response.data) {
        setNfts(response.data);
      } else {
        showSnackbar(response.error || 'Failed to load NFTs');
      }
    } catch (error) {
      showSnackbar('Error loading NFTs');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadNFTs();
  };

  const handleNFTPress = (nft: NFT) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedNFT(nft);
    setModalVisible(true);
  };

  const handleShare = async (nft: NFT) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const result = await Share.share({
        message: `Check out my gratitude NFT! Token ID: ${nft.tokenId}\n\n"${nft.content}"\n\nView on blockchain: https://etherscan.io/tx/${nft.txHash}`,
        title: 'My Gratitude NFT',
      });

      if (result.action === Share.sharedAction) {
        showSnackbar('NFT shared successfully!');
      }
    } catch (error) {
      showSnackbar('Error sharing NFT');
    }
  };

  const handleViewOnBlockchain = (nft: NFT) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const explorer = nft.blockchain === 'ethereum'
      ? `https://etherscan.io/tx/${nft.txHash}`
      : `https://polygonscan.com/tx/${nft.txHash}`;

    showSnackbar(`View on blockchain: ${explorer}`);
    // In a real app, this would open the browser
  };

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  const getBlockchainColor = (blockchain: string) => {
    return blockchain === 'ethereum' ? '#627EEA' : '#8247E5';
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

  const renderNFT = (nft: NFT) => (
    <TouchableOpacity
      key={nft._id}
      onPress={() => handleNFTPress(nft)}
      style={styles.nftContainer}
    >
      <Card style={styles.nftCard}>
        <Card.Content>
          {/* NFT Image Placeholder */}
          <View style={styles.nftImageContainer}>
            <Icon name="image-multiple" size={48} color="#4CAF50" />
            <Text style={styles.nftEmoji}>{getMoodEmoji(nft.metadata.mood)}</Text>
          </View>

          {/* Token ID */}
          <View style={styles.tokenInfo}>
            <Icon name="shield-check" size={16} color="#4CAF50" />
            <Text variant="labelSmall" style={styles.tokenId} numberOfLines={1}>
              #{nft.tokenId.substring(0, 8)}...
            </Text>
          </View>

          {/* Blockchain Badge */}
          <Chip
            mode="flat"
            compact
            style={[styles.blockchainChip, { backgroundColor: `${getBlockchainColor(nft.blockchain)}20` }]}
            textStyle={{ color: getBlockchainColor(nft.blockchain), fontSize: 10 }}
            icon="link-variant"
          >
            {nft.blockchain}
          </Chip>

          {/* Date */}
          <Text variant="bodySmall" style={styles.nftDate}>
            {new Date(nft.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </Text>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading NFT gallery...</Text>
        </View>
      ) : nfts.length === 0 ? (
        <ScrollView
          contentContainerStyle={styles.emptyScrollContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          <View style={styles.emptyContainer}>
            <Icon name="image-multiple-outline" size={80} color="#ccc" />
            <Text variant="headlineSmall" style={styles.emptyTitle}>
              No NFTs Yet
            </Text>
            <Text variant="bodyLarge" style={styles.emptyText}>
              Mint your first gratitude entry as an NFT to start your collection!
            </Text>
            <View style={styles.comingSoonBadge}>
              <Icon name="clock-outline" size={20} color="#666" />
              <Text variant="bodyMedium" style={styles.comingSoonText}>
                NFT minting coming soon
              </Text>
            </View>
          </View>
        </ScrollView>
      ) : (
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.gallery}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          {/* Header */}
          <Card style={styles.headerCard}>
            <Card.Content>
              <View style={styles.headerContent}>
                <Icon name="image-multiple" size={40} color="#4CAF50" />
                <View style={styles.headerText}>
                  <Text variant="headlineSmall" style={styles.headerTitle}>
                    NFT Gallery
                  </Text>
                  <Text variant="bodyMedium" style={styles.headerSubtitle}>
                    {nfts.length} gratitude {nfts.length === 1 ? 'entry' : 'entries'} minted as NFTs
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>

          {/* NFT Grid */}
          <View style={styles.nftGrid}>
            {nfts.map(renderNFT)}
          </View>

          <View style={{ height: 16 }} />
        </ScrollView>
      )}

      {/* NFT Detail Modal */}
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContent}
        >
          {selectedNFT && (
            <View style={styles.modalInner}>
              {/* NFT Preview */}
              <View style={styles.modalImageContainer}>
                <Icon name="image-multiple" size={64} color="#4CAF50" />
                <Text style={styles.modalEmoji}>{getMoodEmoji(selectedNFT.metadata.mood)}</Text>
              </View>

              {/* Content */}
              <Text variant="bodyLarge" style={styles.modalContent}>
                "{selectedNFT.content}"
              </Text>

              {/* Blockchain Info */}
              <View style={styles.modalInfo}>
                <View style={styles.infoRow}>
                  <Icon name="shield-check" size={20} color="#4CAF50" />
                  <View style={styles.infoText}>
                    <Text variant="labelSmall" style={styles.infoLabel}>
                      Token ID
                    </Text>
                    <Text variant="bodyMedium" style={styles.infoValue}>
                      {selectedNFT.tokenId}
                    </Text>
                  </View>
                </View>

                <View style={styles.infoRow}>
                  <Icon name="link-variant" size={20} color={getBlockchainColor(selectedNFT.blockchain)} />
                  <View style={styles.infoText}>
                    <Text variant="labelSmall" style={styles.infoLabel}>
                      Blockchain
                    </Text>
                    <Text variant="bodyMedium" style={styles.infoValue}>
                      {selectedNFT.blockchain.charAt(0).toUpperCase() + selectedNFT.blockchain.slice(1)}
                    </Text>
                  </View>
                </View>

                <View style={styles.infoRow}>
                  <Icon name="calendar" size={20} color="#666" />
                  <View style={styles.infoText}>
                    <Text variant="labelSmall" style={styles.infoLabel}>
                      Minted On
                    </Text>
                    <Text variant="bodyMedium" style={styles.infoValue}>
                      {new Date(selectedNFT.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Actions */}
              <View style={styles.modalActions}>
                <Button
                  mode="contained"
                  onPress={() => handleViewOnBlockchain(selectedNFT)}
                  style={styles.modalButton}
                  icon="open-in-new"
                >
                  View on Blockchain
                </Button>
                <Button
                  mode="outlined"
                  onPress={() => handleShare(selectedNFT)}
                  style={styles.modalButton}
                  icon="share-variant"
                >
                  Share NFT
                </Button>
              </View>

              <Button
                mode="text"
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                Close
              </Button>
            </View>
          )}
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
  emptyScrollContainer: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    marginTop: 24,
    fontWeight: 'bold',
  },
  emptyText: {
    marginTop: 12,
    textAlign: 'center',
    color: '#666',
    lineHeight: 24,
  },
  comingSoonBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 24,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
  },
  comingSoonText: {
    color: '#666',
    fontStyle: 'italic',
  },
  content: {
    flex: 1,
  },
  gallery: {
    padding: 16,
  },
  headerCard: {
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
  nftGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  nftContainer: {
    width: cardWidth,
  },
  nftCard: {
    height: 220,
  },
  nftImageContainer: {
    height: 120,
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  nftEmoji: {
    position: 'absolute',
    fontSize: 32,
    bottom: 8,
    right: 8,
  },
  tokenInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tokenId: {
    marginLeft: 4,
    fontWeight: 'bold',
    flex: 1,
  },
  blockchainChip: {
    alignSelf: 'flex-start',
    height: 24,
    marginBottom: 8,
  },
  nftDate: {
    color: '#666',
  },
  modalContent: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 16,
    padding: 24,
    maxHeight: '90%',
  },
  modalInner: {
    alignItems: 'center',
  },
  modalImageContainer: {
    width: 160,
    height: 160,
    backgroundColor: '#E8F5E9',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  modalEmoji: {
    position: 'absolute',
    fontSize: 48,
    bottom: 12,
    right: 12,
  },
  modalContent: {
    textAlign: 'center',
    fontStyle: 'italic',
    color: '#666',
    marginBottom: 24,
    lineHeight: 24,
  },
  modalInfo: {
    width: '100%',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    marginLeft: 12,
    flex: 1,
  },
  infoLabel: {
    color: '#666',
    marginBottom: 2,
  },
  infoValue: {
    fontWeight: 'bold',
  },
  modalActions: {
    width: '100%',
    gap: 12,
  },
  modalButton: {
    marginBottom: 8,
  },
  closeButton: {
    marginTop: 8,
  },
});
