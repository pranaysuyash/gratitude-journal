/**
 * Register Screen
 * New user registration
 * © 2024 Gratitude Journal. All Rights Reserved.
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Card,
  Checkbox,
  HelperText,
  ActivityIndicator,
} from 'react-native-paper';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ApiService from '../../services/ApiService';
import AnalyticsService, { AnalyticsEvent } from '../../services/AnalyticsService';

export default function RegisterScreen({ navigation }: any) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    displayName: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    // Username validation
    if (!formData.username) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    }

    // Display name validation
    if (!formData.displayName) {
      newErrors.displayName = 'Display name is required';
    } else if (formData.displayName.length < 2) {
      newErrors.displayName = 'Display name must be at least 2 characters';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Terms agreement
    if (!agreedToTerms) {
      newErrors.terms = 'You must agree to the Terms and Privacy Policy';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const response = await ApiService.register(
        formData.email,
        formData.password,
        formData.username,
        formData.displayName
      );

      if (response.success && response.data) {
        const { token, user } = response.data;

        // Save auth token
        await ApiService.setAuthToken(token);
        await AsyncStorage.setItem('user', JSON.stringify(user));

        // Mark onboarding as complete
        await AsyncStorage.setItem('hasLaunched', 'true');

        // Set analytics user
        AnalyticsService.setUserId(user._id);
        await AnalyticsService.trackEvent(AnalyticsEvent.REGISTRATION_COMPLETED, {
          method: 'email',
        });

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        Alert.alert(
          'Welcome! 🎉',
          'Your account has been created successfully. Please check your email to verify your account.',
          [{ text: 'Get Started', onPress: () => navigation.replace('Main') }]
        );
      } else {
        throw new Error(response.error || 'Registration failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      Alert.alert('Registration Failed', errorMessage);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    setErrors({ ...errors, [field]: undefined });
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
        <View style={styles.header}>
          <Text variant="displaySmall" style={styles.title}>
            🌟
          </Text>
          <Text variant="headlineLarge" style={styles.appName}>
            Create Account
          </Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            Start your gratitude journey today
          </Text>
        </View>

        <Card style={styles.card}>
          <Card.Content>
            {/* Email Input */}
            <TextInput
              label="Email"
              value={formData.email}
              onChangeText={(text) => updateFormData('email', text)}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              left={<TextInput.Icon icon="email" />}
              error={!!errors.email}
              disabled={loading}
              style={styles.input}
            />
            {errors.email && (
              <HelperText type="error" visible={!!errors.email}>
                {errors.email}
              </HelperText>
            )}

            {/* Username Input */}
            <TextInput
              label="Username"
              value={formData.username}
              onChangeText={(text) => updateFormData('username', text.toLowerCase())}
              mode="outlined"
              autoCapitalize="none"
              left={<TextInput.Icon icon="at" />}
              error={!!errors.username}
              disabled={loading}
              style={styles.input}
            />
            {errors.username && (
              <HelperText type="error" visible={!!errors.username}>
                {errors.username}
              </HelperText>
            )}

            {/* Display Name Input */}
            <TextInput
              label="Display Name"
              value={formData.displayName}
              onChangeText={(text) => updateFormData('displayName', text)}
              mode="outlined"
              left={<TextInput.Icon icon="account" />}
              error={!!errors.displayName}
              disabled={loading}
              style={styles.input}
            />
            {errors.displayName && (
              <HelperText type="error" visible={!!errors.displayName}>
                {errors.displayName}
              </HelperText>
            )}

            {/* Password Input */}
            <TextInput
              label="Password"
              value={formData.password}
              onChangeText={(text) => updateFormData('password', text)}
              mode="outlined"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              left={<TextInput.Icon icon="lock" />}
              right={
                <TextInput.Icon
                  icon={showPassword ? 'eye-off' : 'eye'}
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
              error={!!errors.password}
              disabled={loading}
              style={styles.input}
            />
            {errors.password && (
              <HelperText type="error" visible={!!errors.password}>
                {errors.password}
              </HelperText>
            )}

            {/* Confirm Password Input */}
            <TextInput
              label="Confirm Password"
              value={formData.confirmPassword}
              onChangeText={(text) => updateFormData('confirmPassword', text)}
              mode="outlined"
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
              left={<TextInput.Icon icon="lock-check" />}
              right={
                <TextInput.Icon
                  icon={showConfirmPassword ? 'eye-off' : 'eye'}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                />
              }
              error={!!errors.confirmPassword}
              disabled={loading}
              style={styles.input}
            />
            {errors.confirmPassword && (
              <HelperText type="error" visible={!!errors.confirmPassword}>
                {errors.confirmPassword}
              </HelperText>
            )}

            {/* Terms & Privacy */}
            <View style={styles.checkboxContainer}>
              <Checkbox
                status={agreedToTerms ? 'checked' : 'unchecked'}
                onPress={() => {
                  setAgreedToTerms(!agreedToTerms);
                  setErrors({ ...errors, terms: undefined });
                }}
                disabled={loading}
              />
              <Text style={styles.checkboxText}>
                I agree to the{' '}
                <Text style={styles.link}>Terms of Service</Text> and{' '}
                <Text style={styles.link}>Privacy Policy</Text>
              </Text>
            </View>
            {errors.terms && (
              <HelperText type="error" visible={!!errors.terms}>
                {errors.terms}
              </HelperText>
            )}

            {/* Register Button */}
            <Button
              mode="contained"
              onPress={handleRegister}
              loading={loading}
              disabled={loading}
              style={styles.registerButton}
              contentStyle={styles.buttonContent}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </Card.Content>
        </Card>

        {/* Sign In Link */}
        <View style={styles.signInContainer}>
          <Text style={styles.signInText}>Already have an account? </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            disabled={loading}
          >
            <Text style={styles.signInLink}>Sign In</Text>
          </TouchableOpacity>
        </View>

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
  title: {
    fontSize: 60,
    marginBottom: 10,
  },
  appName: {
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 10,
  },
  subtitle: {
    textAlign: 'center',
    color: '#666',
    paddingHorizontal: 20,
  },
  card: {
    marginBottom: 20,
  },
  input: {
    marginBottom: 5,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 15,
  },
  checkboxText: {
    flex: 1,
    marginLeft: 8,
    color: '#666',
  },
  link: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  registerButton: {
    marginTop: 10,
  },
  buttonContent: {
    height: 50,
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  signInText: {
    color: '#666',
  },
  signInLink: {
    color: '#4CAF50',
    fontWeight: 'bold',
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
