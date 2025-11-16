/**
 * New Entry Screen
 * Create and edit journal entries
 * © 2024 Gratitude Journal. All Rights Reserved.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Chip,
  IconButton,
  Card,
  ProgressBar,
  Divider,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import ApiService from '../../services/ApiService';
import AnalyticsService, { AnalyticsEvent } from '../../services/AnalyticsService';

const MOODS = [
  { id: 'grateful', label: 'Grateful', emoji: '🙏', color: '#4CAF50' },
  { id: 'joyful', label: 'Joyful', emoji: '😊', color: '#FFC107' },
  { id: 'peaceful', label: 'Peaceful', emoji: '😌', color: '#2196F3' },
  { id: 'excited', label: 'Excited', emoji: '🤩', color: '#FF5722' },
  { id: 'content', label: 'Content', emoji: '😄', color: '#9C27B0' },
  { id: 'hopeful', label: 'Hopeful', emoji: '🌟', color: '#00BCD4' },
  { id: 'loved', label: 'Loved', emoji: '❤️', color: '#E91E63' },
  { id: 'blessed', label: 'Blessed', emoji: '✨', color: '#673AB7' },
];

const CATEGORIES = [
  { id: 'family', label: 'Family', icon: 'home-heart' },
  { id: 'friends', label: 'Friends', icon: 'account-group' },
  { id: 'health', label: 'Health', icon: 'heart-pulse' },
  { id: 'work', label: 'Work', icon: 'briefcase' },
  { id: 'personal_growth', label: 'Growth', icon: 'trending-up' },
  { id: 'nature', label: 'Nature', icon: 'leaf' },
  { id: 'achievements', label: 'Achievements', icon: 'trophy' },
  { id: 'relationships', label: 'Relationships', icon: 'heart' },
];

export default function NewEntryScreen({ navigation, route }: any) {
  const editEntry = route?.params?.editEntry;
  const isEditing = !!editEntry;

  const [content, setContent] = useState(editEntry?.content || '');
  const [selectedMood, setSelectedMood] = useState(editEntry?.mood || '');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    editEntry?.categories || []
  );
  const [tags, setTags] = useState<string[]>(editEntry?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [photos, setPhotos] = useState<string[]>(editEntry?.photoUrls || []);
  const [location, setLocation] = useState<any>(editEntry?.location || null);
  const [weather, setWeather] = useState<any>(editEntry?.weather || null);
  const [loading, setLoading] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');

  useEffect(() => {
    requestPermissions();
    loadAIPrompt();
    if (!isEditing) {
      getCurrentLocation();
    }
  }, []);

  const requestPermissions = async () => {
    await ImagePicker.requestMediaLibraryPermissionsAsync();
    await ImagePicker.requestCameraPermissionsAsync();
    await Location.requestForegroundPermissionsAsync();
  };

  const loadAIPrompt = async () => {
    try {
      const response = await ApiService.generatePrompt();
      if (response.success && response.data) {
        setAiPrompt(response.data.prompt);
      }
    } catch (error) {
      console.error('Failed to load AI prompt:', error);
    }
  };

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted') return;

      const location = await Location.getCurrentPositionAsync({});
      const [address] = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      setLocation({
        type: 'Point',
        coordinates: [location.coords.longitude, location.coords.latitude],
        name: address.city || address.region || 'Unknown',
      });

      // Simulate weather data (in production, use a weather API)
      setWeather({
        temperature: 72,
        condition: 'Sunny',
        icon: '☀️',
      });
    } catch (error) {
      console.error('Failed to get location:', error);
    }
  };

  const handleAddPhoto = async (fromCamera: boolean = false) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const result = fromCamera
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            quality: 0.8,
          });

      if (!result.canceled) {
        const newPhotos = result.assets.map((asset) => asset.uri);
        setPhotos([...photos, ...newPhotos]);

        await AnalyticsService.trackEvent(AnalyticsEvent.PHOTO_ADDED, {
          source: fromCamera ? 'camera' : 'library',
          count: newPhotos.length,
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to add photo');
    }
  };

  const handleRemovePhoto = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newPhotos = [...photos];
    newPhotos.splice(index, 1);
    setPhotos(newPhotos);
  };

  const toggleCategory = (categoryId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSave = async (isDraft: boolean = false) => {
    if (!content.trim()) {
      Alert.alert('Validation Error', 'Please write something in your entry');
      return;
    }

    if (!selectedMood) {
      Alert.alert('Validation Error', 'Please select your mood');
      return;
    }

    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const entryData = {
        content: content.trim(),
        mood: selectedMood,
        categories: selectedCategories,
        tags,
        photoUrls: photos,
        location,
        weather,
        isDraft,
      };

      const response = isEditing
        ? await ApiService.updateEntry(editEntry._id, entryData)
        : await ApiService.createEntry(entryData);

      if (response.success) {
        await AnalyticsService.trackEvent(
          isEditing ? AnalyticsEvent.ENTRY_UPDATED : AnalyticsEvent.ENTRY_CREATED,
          {
            mood: selectedMood,
            categories: selectedCategories,
            tags_count: tags.length,
            photos_count: photos.length,
            word_count: content.split(' ').length,
            has_location: !!location,
            is_draft: isDraft,
          }
        );

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert(
          'Success! 🎉',
          isDraft ? 'Entry saved as draft' : 'Entry saved successfully',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        throw new Error(response.error || 'Failed to save entry');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save entry';
      Alert.alert('Error', errorMessage);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  const wordCount = content.split(/\s+/).filter((word) => word.length > 0).length;
  const progress = Math.min(wordCount / 100, 1); // Target: 100 words

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
        {/* AI Prompt Card */}
        {aiPrompt && !isEditing && (
          <Card style={styles.promptCard}>
            <Card.Content>
              <View style={styles.promptHeader}>
                <Icon name="lightbulb-on" size={24} color="#FF9800" />
                <Text variant="titleMedium" style={styles.promptTitle}>
                  Today's Prompt
                </Text>
              </View>
              <Text variant="bodyMedium" style={styles.promptText}>
                {aiPrompt}
              </Text>
            </Card.Content>
          </Card>
        )}

        {/* Date and Location */}
        <View style={styles.metaContainer}>
          <Text variant="bodySmall" style={styles.metaText}>
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
          {location && (
            <View style={styles.locationContainer}>
              <Icon name="map-marker" size={16} color="#666" />
              <Text variant="bodySmall" style={styles.metaText}>
                {location.name}
              </Text>
              {weather && (
                <Text variant="bodySmall" style={styles.metaText}>
                  {weather.icon} {weather.temperature}°F
                </Text>
              )}
            </View>
          )}
        </View>

        {/* Mood Selection */}
        <Text variant="titleMedium" style={styles.sectionTitle}>
          How are you feeling?
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.moodScroll}>
          {MOODS.map((mood) => (
            <TouchableOpacity
              key={mood.id}
              onPress={() => {
                setSelectedMood(mood.id);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              style={[
                styles.moodButton,
                selectedMood === mood.id && {
                  backgroundColor: mood.color,
                  borderColor: mood.color,
                },
              ]}
            >
              <Text style={styles.moodEmoji}>{mood.emoji}</Text>
              <Text
                style={[
                  styles.moodLabel,
                  selectedMood === mood.id && styles.moodLabelSelected,
                ]}
              >
                {mood.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Content Input */}
        <TextInput
          label="What are you grateful for today?"
          value={content}
          onChangeText={setContent}
          mode="outlined"
          multiline
          numberOfLines={10}
          placeholder="Write about the things, people, or moments that made you feel grateful today..."
          style={styles.contentInput}
          disabled={loading}
        />

        {/* Word Count Progress */}
        <View style={styles.progressContainer}>
          <Text variant="bodySmall" style={styles.wordCount}>
            {wordCount} words
          </Text>
          <ProgressBar progress={progress} color="#4CAF50" style={styles.progressBar} />
          {wordCount >= 100 && (
            <Text variant="bodySmall" style={styles.goalText}>
              🎯 Great job! You've reached the recommended length
            </Text>
          )}
        </View>

        {/* Categories */}
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Categories
        </Text>
        <View style={styles.categoriesContainer}>
          {CATEGORIES.map((category) => (
            <Chip
              key={category.id}
              selected={selectedCategories.includes(category.id)}
              onPress={() => toggleCategory(category.id)}
              icon={category.icon}
              style={styles.categoryChip}
              disabled={loading}
            >
              {category.label}
            </Chip>
          ))}
        </View>

        {/* Tags */}
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Tags
        </Text>
        <View style={styles.tagsContainer}>
          {tags.map((tag) => (
            <Chip
              key={tag}
              onClose={() => handleRemoveTag(tag)}
              style={styles.tag}
              disabled={loading}
            >
              {tag}
            </Chip>
          ))}
        </View>
        <View style={styles.tagInputContainer}>
          <TextInput
            label="Add tags"
            value={tagInput}
            onChangeText={setTagInput}
            mode="outlined"
            onSubmitEditing={handleAddTag}
            returnKeyType="done"
            style={styles.tagInput}
            disabled={loading}
          />
          <IconButton icon="plus" onPress={handleAddTag} disabled={loading} />
        </View>

        {/* Photos */}
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Photos
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photosScroll}>
          {photos.map((photo, index) => (
            <View key={index} style={styles.photoContainer}>
              <Image source={{ uri: photo }} style={styles.photo} />
              <IconButton
                icon="close-circle"
                size={24}
                onPress={() => handleRemovePhoto(index)}
                style={styles.removePhotoButton}
                disabled={loading}
              />
            </View>
          ))}
          <TouchableOpacity
            style={styles.addPhotoButton}
            onPress={() => handleAddPhoto(false)}
            disabled={loading}
          >
            <Icon name="image-plus" size={40} color="#4CAF50" />
            <Text variant="bodySmall">Add Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addPhotoButton}
            onPress={() => handleAddPhoto(true)}
            disabled={loading}
          >
            <Icon name="camera" size={40} color="#4CAF50" />
            <Text variant="bodySmall">Camera</Text>
          </TouchableOpacity>
        </ScrollView>

        <Divider style={styles.divider} />

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button
            mode="outlined"
            onPress={() => handleSave(true)}
            loading={loading}
            disabled={loading}
            style={styles.draftButton}
          >
            Save as Draft
          </Button>
          <Button
            mode="contained"
            onPress={() => handleSave(false)}
            loading={loading}
            disabled={loading}
            style={styles.saveButton}
          >
            {isEditing ? 'Update Entry' : 'Save Entry'}
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  promptCard: {
    marginBottom: 16,
    backgroundColor: '#FFF8E1',
  },
  promptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  promptTitle: {
    marginLeft: 8,
    fontWeight: 'bold',
    color: '#FF9800',
  },
  promptText: {
    color: '#666',
    fontStyle: 'italic',
  },
  metaContainer: {
    marginBottom: 16,
  },
  metaText: {
    color: '#666',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 8,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 12,
  },
  moodScroll: {
    marginBottom: 16,
  },
  moodButton: {
    alignItems: 'center',
    padding: 12,
    marginRight: 12,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    minWidth: 80,
  },
  moodEmoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  moodLabel: {
    fontSize: 12,
    color: '#666',
  },
  moodLabelSelected: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  contentInput: {
    marginBottom: 8,
    minHeight: 200,
  },
  progressContainer: {
    marginBottom: 16,
  },
  wordCount: {
    color: '#666',
    marginBottom: 4,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
  },
  goalText: {
    color: '#4CAF50',
    marginTop: 4,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  categoryChip: {
    marginBottom: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  tag: {
    marginBottom: 4,
  },
  tagInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  tagInput: {
    flex: 1,
  },
  photosScroll: {
    marginBottom: 16,
  },
  photoContainer: {
    marginRight: 12,
    position: 'relative',
  },
  photo: {
    width: 120,
    height: 120,
    borderRadius: 8,
  },
  removePhotoButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FFFFFF',
  },
  addPhotoButton: {
    width: 120,
    height: 120,
    borderRadius: 8,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  divider: {
    marginVertical: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  draftButton: {
    flex: 1,
  },
  saveButton: {
    flex: 2,
  },
});
