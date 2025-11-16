/**
 * Stat Card Component
 * Reusable statistics card
 * © 2024 Gratitude Journal. All Rights Reserved.
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface StatCardProps {
  icon: string;
  iconColor: string;
  label: string;
  value: number | string;
  onPress?: () => void;
}

export default function StatCard({ icon, iconColor, label, value, onPress }: StatCardProps) {
  const CardContent = (
    <Card style={styles.card}>
      <Card.Content style={styles.content}>
        <Icon name={icon} size={30} color={iconColor} />
        <Text variant="headlineMedium" style={styles.value}>
          {value}
        </Text>
        <Text variant="bodySmall" style={styles.label}>
          {label}
        </Text>
      </Card.Content>
    </Card>
  );

  if (onPress) {
    return <TouchableOpacity onPress={onPress}>{CardContent}</TouchableOpacity>;
  }

  return CardContent;
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
  },
  content: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  value: {
    fontWeight: 'bold',
    marginTop: 8,
  },
  label: {
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
});
