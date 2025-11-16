/**
 * Error Screen Component
 * Display error state with retry option
 * © 2024 Gratitude Journal. All Rights Reserved.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface ErrorScreenProps {
  message?: string;
  onRetry?: () => void;
}

export default function ErrorScreen({
  message = 'Something went wrong',
  onRetry,
}: ErrorScreenProps) {
  return (
    <View style={styles.container}>
      <Icon name="alert-circle" size={80} color="#F44336" />
      <Text variant="headlineSmall" style={styles.title}>
        Oops!
      </Text>
      <Text variant="bodyLarge" style={styles.message}>
        {message}
      </Text>
      {onRetry && (
        <Button mode="contained" onPress={onRetry} style={styles.button}>
          Try Again
        </Button>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#F5F5F5',
  },
  title: {
    marginTop: 16,
    marginBottom: 8,
    color: '#F44336',
  },
  message: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 24,
  },
  button: {
    marginTop: 16,
  },
});
