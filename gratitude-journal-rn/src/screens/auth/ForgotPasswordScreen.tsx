/**
 * Forgot Password Screen
 * Password recovery flow
 * © 2024 Gratitude Journal. All Rights Reserved.
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Card,
  HelperText,
  ActivityIndicator,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Haptics from 'expo-haptics';
import ApiService from '../../services/ApiService';
import AnalyticsService, { AnalyticsEvent } from '../../services/AnalyticsService';

export default function ForgotPasswordScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const validateEmail = (): boolean => {
    if (!email) {
      setError('Email is required');
      return false;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Invalid email format');
      return false;
    }

    setError('');
    return true;
  };

  const handleSendResetLink = async () => {
    if (!validateEmail()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const response = await ApiService.forgotPassword(email);

      if (response.success) {
        await AnalyticsService.trackEvent(AnalyticsEvent.PASSWORD_RESET_REQUESTED, {
          email,
        });

        setEmailSent(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        Alert.alert(
          'Email Sent! ✉️',
          'We have sent password reset instructions to your email. Please check your inbox and spam folder.',
          [{ text: 'OK' }]
        );
      } else {
        throw new Error(response.error || 'Failed to send reset link');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send reset link';
      Alert.alert('Error', errorMessage);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Icon name="lock-reset" size={80} color="#4CAF50" />
          </View>
          <Text variant="headlineLarge" style={styles.title}>
            Forgot Password?
          </Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            {emailSent
              ? 'Check your email for password reset instructions'
              : 'Enter your email address and we will send you a link to reset your password'}
          </Text>
        </View>

        {!emailSent ? (
          <Card style={styles.card}>
            <Card.Content>
              {/* Email Input */}
              <TextInput
                label="Email"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setError('');
                }}
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                autoFocus
                left={<TextInput.Icon icon="email" />}
                error={!!error}
                disabled={loading}
                style={styles.input}
              />
              {error && (
                <HelperText type="error" visible={!!error}>
                  {error}
                </HelperText>
              )}

              {/* Send Reset Link Button */}
              <Button
                mode="contained"
                onPress={handleSendResetLink}
                loading={loading}
                disabled={loading}
                style={styles.submitButton}
                contentStyle={styles.buttonContent}
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </Button>

              {/* Back to Login */}
              <Button
                mode="text"
                onPress={() => navigation.goBack()}
                disabled={loading}
                style={styles.backButton}
              >
                Back to Login
              </Button>
            </Card.Content>
          </Card>
        ) : (
          <Card style={styles.card}>
            <Card.Content style={styles.successContent}>
              <Icon name="check-circle" size={80} color="#4CAF50" />
              <Text variant="headlineSmall" style={styles.successTitle}>
                Email Sent!
              </Text>
              <Text variant="bodyMedium" style={styles.successText}>
                We've sent password reset instructions to:
              </Text>
              <Text variant="bodyLarge" style={styles.emailText}>
                {email}
              </Text>
              <Text variant="bodyMedium" style={styles.infoText}>
                Please check your inbox and spam folder. The link will expire in 24 hours.
              </Text>

              {/* Resend Button */}
              <Button
                mode="outlined"
                onPress={handleSendResetLink}
                loading={loading}
                disabled={loading}
                style={styles.resendButton}
                contentStyle={styles.buttonContent}
              >
                Resend Email
              </Button>

              {/* Back to Login */}
              <Button
                mode="contained"
                onPress={() => navigation.navigate('Login')}
                style={styles.backToLoginButton}
                contentStyle={styles.buttonContent}
              >
                Back to Login
              </Button>
            </Card.Content>
          </Card>
        )}

        {/* Help Section */}
        <Card style={styles.helpCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.helpTitle}>
              Need Help?
            </Text>
            <Text variant="bodyMedium" style={styles.helpText}>
              • Make sure you entered the correct email address
            </Text>
            <Text variant="bodyMedium" style={styles.helpText}>
              • Check your spam or junk folder
            </Text>
            <Text variant="bodyMedium" style={styles.helpText}>
              • Contact support if you don't receive the email within 10 minutes
            </Text>
            <Button
              mode="text"
              onPress={() => {
                Alert.alert(
                  'Support',
                  'Please email support@gratitudejournal.com for assistance.'
                );
              }}
              style={styles.contactButton}
            >
              Contact Support
            </Button>
          </Card.Content>
        </Card>

        {/* Loading Overlay */}
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#4CAF50" />
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  iconContainer: {
    marginBottom: 20,
  },
  title: {
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    color: '#666',
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  card: {
    marginBottom: 20,
  },
  input: {
    marginBottom: 5,
  },
  submitButton: {
    marginTop: 15,
    marginBottom: 10,
  },
  buttonContent: {
    height: 50,
  },
  backButton: {
    marginTop: 10,
  },
  successContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  successTitle: {
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: 20,
    marginBottom: 10,
  },
  successText: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 10,
  },
  emailText: {
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  infoText: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  resendButton: {
    marginBottom: 10,
    width: '100%',
  },
  backToLoginButton: {
    width: '100%',
  },
  helpCard: {
    marginTop: 10,
  },
  helpTitle: {
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  helpText: {
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  contactButton: {
    marginTop: 10,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
