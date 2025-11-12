/**
 * New Entry Screen
 * Create new gratitude journal entries with rich features
 * © 2024 Gratitude Journal. All Rights Reserved.
 */

import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Card,
  Chip,
  IconButton,
  SegmentedButtons,
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { createEntry } from '../store/slices/entriesSlice';
import { RootState } from '../store';

const MOODS = [
  { value: 'amazing', label: '🤩 Amazing', score: 10 },
  { value: 'great', label: '😊 Great', score: 8 },
  { value: 'good', label: '🙂 Good', score: 7 },
  { value: 'okay', label: '😐 Okay', score: 5 },
  { value: 'sad', label: '😔 Sad', score: 3 },
  { value: 'anxious', label: '😰 Anxious', score: 4 },
  { value: 'angry', label: '😠 Angry', score: 2 },
];

export default function NewEntryScreen({ navigation }: any) {
  const dispatch = useDispatch();
  const { loading } = useSelector((state: RootState) => state.entries);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState('good');
  const [moodScore, setMoodScore] = useState(7);
  const [gratitudeItems, setGratitudeItems] = useState<string[]>(['', '', '']);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const handleAddGratitudeItem = () => {
    setGratitudeItems([...gratitudeItems, '']);
  };

  const handleUpdateGratitudeItem = (index: number, value: string) => {
    const updated = [...gratitudeItems];
    updated[index] = value;
    setGratitudeItems(updated);
  };

  const handleRemoveGratitudeItem = (index: number) => {
    const updated = gratitudeItems.filter((_, i) => i !== index);
    setGratitudeItems(updated);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim().toLowerCase()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleSubmit = async () => {
    if (!content.trim()) {
      Alert.alert('Error', 'Please write something in your entry');
      return;
    }

    const filteredGratitudeItems = gratitudeItems.filter(item => item.trim());

    try {
      await dispatch(
        createEntry({
          title: title.trim(),
          content: content.trim(),
          mood,
          moodScore,
          gratitudeItems: filteredGratitudeItems,
          tags,
          date: new Date().toISOString(),
        }) as any
      );

      Alert.alert('Success', 'Entry saved successfully!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to save entry. Please try again.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            How are you feeling?
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.moodContainer}>
              {MOODS.map(m => (
                <TouchableOpacity
                  key={m.value}
                  style={[
                    styles.moodButton,
                    mood === m.value && styles.moodButtonActive,
                  ]}
                  onPress={() => {
                    setMood(m.value);
                    setMoodScore(m.score);
                  }}
                >
                  <Text style={styles.moodLabel}>{m.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Title (Optional)
          </Text>
          <TextInput
            mode="outlined"
            placeholder="Give your entry a title..."
            value={title}
            onChangeText={setTitle}
            style={styles.input}
          />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            What are you grateful for today?
          </Text>
          {gratitudeItems.map((item, index) => (
            <View key={index} style={styles.gratitudeItem}>
              <TextInput
                mode="outlined"
                placeholder={`Gratitude ${index + 1}`}
                value={item}
                onChangeText={value => handleUpdateGratitudeItem(index, value)}
                style={styles.gratitudeInput}
              />
              {gratitudeItems.length > 1 && (
                <IconButton
                  icon="close"
                  size={20}
                  onPress={() => handleRemoveGratitudeItem(index)}
                />
              )}
            </View>
          ))}
          <Button
            mode="outlined"
            onPress={handleAddGratitudeItem}
            style={styles.addButton}
          >
            Add Another
          </Button>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Your Thoughts
          </Text>
          <TextInput
            mode="outlined"
            placeholder="Write about your day, feelings, or anything on your mind..."
            value={content}
            onChangeText={setContent}
            multiline
            numberOfLines={10}
            style={styles.contentInput}
          />
          <Text variant="bodySmall" style={styles.wordCount}>
            {content.split(/\s+/).filter(w => w.length > 0).length} words
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Tags
          </Text>
          <View style={styles.tagsContainer}>
            {tags.map(tag => (
              <Chip
                key={tag}
                onClose={() => handleRemoveTag(tag)}
                style={styles.tag}
              >
                {tag}
              </Chip>
            ))}
          </View>
          <View style={styles.tagInputContainer}>
            <TextInput
              mode="outlined"
              placeholder="Add a tag..."
              value={tagInput}
              onChangeText={setTagInput}
              onSubmitEditing={handleAddTag}
              style={styles.tagInput}
            />
            <Button mode="contained" onPress={handleAddTag} disabled={!tagInput.trim()}>
              Add
            </Button>
          </View>
        </Card.Content>
      </Card>

      <View style={styles.actions}>
        <Button
          mode="outlined"
          onPress={() => navigation.goBack()}
          style={styles.actionButton}
        >
          Cancel
        </Button>
        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={loading}
          disabled={loading || !content.trim()}
          style={styles.actionButton}
        >
          Save Entry
        </Button>
      </View>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    marginBottom: 12,
    fontWeight: 'bold',
  },
  moodContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  moodButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  moodButtonActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  moodLabel: {
    fontSize: 14,
  },
  input: {
    marginBottom: 8,
  },
  gratitudeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  gratitudeInput: {
    flex: 1,
  },
  addButton: {
    marginTop: 8,
  },
  contentInput: {
    minHeight: 200,
  },
  wordCount: {
    textAlign: 'right',
    color: '#666',
    marginTop: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  tag: {
    marginRight: 4,
  },
  tagInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tagInput: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  bottomPadding: {
    height: 32,
  },
});
