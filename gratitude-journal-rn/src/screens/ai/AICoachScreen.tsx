/**
 * AI Coach Screen - Chat with AI gratitude coach
 * © 2024 Gratitude Journal. All Rights Reserved.
 */

import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  Text,
  TextInput,
  IconButton,
  ActivityIndicator,
  Card,
  Snackbar,
} from 'react-native-paper';
import * as Haptics from 'expo-haptics';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ApiService from '../../services/ApiService';
import AnalyticsService, { AnalyticsEvent } from '../../services/AnalyticsService';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function AICoachScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    AnalyticsService.trackScreenView('ai_coach_screen');

    // Send welcome message
    const welcomeMessage: Message = {
      id: '0',
      role: 'assistant',
      content: 'Hello! I\'m your AI Gratitude Coach. I\'m here to help you deepen your gratitude practice, overcome challenges, and discover new perspectives. How can I support you today?',
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  }, []);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setLoading(true);

    // Scroll to bottom
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      // Prepare message history for API
      const history = messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await ApiService.askAICoach(userMessage.content, history);

      if (response.success && response.data) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response.data.response,
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, assistantMessage]);

        AnalyticsService.trackEvent(AnalyticsEvent.AI_FEATURE_USED, {
          feature: 'ai_coach',
        });

        // Scroll to bottom
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      } else {
        showSnackbar(response.error || 'Failed to get response');
      }
    } catch (error) {
      showSnackbar('Error communicating with AI coach');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  const renderMessage = (message: Message) => {
    const isUser = message.role === 'user';

    return (
      <View
        key={message.id}
        style={[styles.messageContainer, isUser ? styles.userMessageContainer : styles.assistantMessageContainer]}
      >
        {!isUser && (
          <View style={styles.avatarContainer}>
            <Icon name="robot" size={32} color="#4CAF50" />
          </View>
        )}
        <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.assistantBubble]}>
          <Text
            variant="bodyMedium"
            style={[styles.messageText, isUser ? styles.userText : styles.assistantText]}
          >
            {message.content}
          </Text>
          <Text
            variant="bodySmall"
            style={[styles.timestamp, isUser ? styles.userTimestamp : styles.assistantTimestamp]}
          >
            {message.timestamp.toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
            })}
          </Text>
        </View>
        {isUser && (
          <View style={styles.avatarContainer}>
            <Icon name="account-circle" size={32} color="#2196F3" />
          </View>
        )}
      </View>
    );
  };

  const suggestedPrompts = [
    'Help me find gratitude in difficult times',
    'What should I write about today?',
    'How can I make gratitude a daily habit?',
    'I\'m feeling stuck in my practice',
  ];

  const handlePromptPress = (prompt: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setInputText(prompt);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map(renderMessage)}

        {/* Loading Indicator */}
        {loading && (
          <View style={styles.loadingContainer}>
            <View style={styles.avatarContainer}>
              <Icon name="robot" size={32} color="#4CAF50" />
            </View>
            <View style={[styles.messageBubble, styles.assistantBubble]}>
              <ActivityIndicator size="small" color="#4CAF50" />
            </View>
          </View>
        )}

        {/* Suggested Prompts (only show if no messages yet) */}
        {messages.length <= 1 && !loading && (
          <View style={styles.suggestedPromptsContainer}>
            <Text variant="titleMedium" style={styles.suggestedTitle}>
              Suggested Questions
            </Text>
            {suggestedPrompts.map((prompt, index) => (
              <Card
                key={index}
                style={styles.promptCard}
                onPress={() => handlePromptPress(prompt)}
              >
                <Card.Content style={styles.promptContent}>
                  <Icon name="lightbulb-outline" size={20} color="#4CAF50" />
                  <Text variant="bodyMedium" style={styles.promptText}>
                    {prompt}
                  </Text>
                  <Icon name="chevron-right" size={20} color="#666" />
                </Card.Content>
              </Card>
            ))}
          </View>
        )}

        <View style={{ height: 16 }} />
      </ScrollView>

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <TextInput
          mode="outlined"
          placeholder="Ask me anything about gratitude..."
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={500}
          style={styles.input}
          right={
            <TextInput.Icon
              icon="send"
              onPress={handleSend}
              disabled={!inputText.trim() || loading}
              color={inputText.trim() && !loading ? '#4CAF50' : '#ccc'}
            />
          }
          onSubmitEditing={handleSend}
        />
      </View>

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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  assistantMessageContainer: {
    justifyContent: 'flex-start',
  },
  avatarContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageBubble: {
    maxWidth: '70%',
    padding: 12,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: '#4CAF50',
    borderBottomRightRadius: 4,
    marginRight: 8,
  },
  assistantBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    marginLeft: 8,
    elevation: 1,
  },
  messageText: {
    lineHeight: 20,
  },
  userText: {
    color: '#fff',
  },
  assistantText: {
    color: '#000',
  },
  timestamp: {
    marginTop: 4,
    fontSize: 11,
  },
  userTimestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'right',
  },
  assistantTimestamp: {
    color: '#999',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  suggestedPromptsContainer: {
    marginTop: 16,
  },
  suggestedTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#666',
  },
  promptCard: {
    marginBottom: 8,
  },
  promptContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  promptText: {
    flex: 1,
    marginLeft: 12,
  },
  inputContainer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    padding: 12,
  },
  input: {
    backgroundColor: '#fff',
    maxHeight: 120,
  },
});
