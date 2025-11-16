/**
 * Login Screen
 * User authentication with email/password and OAuth
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
  Divider,
  HelperText,
  ActivityIndicator,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ApiService from '../../services/ApiService';
import AnalyticsService, { AnalyticsEvent } from '../../services/AnalyticsService';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};

    // Email validation
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Invalid email format';
    }

    // Password validation
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const response = await ApiService.login(email, password);

      if (response.success && response.data) {
        const { token, user } = response.data;

        // Save auth token
        await ApiService.setAuthToken(token);
        await AsyncStorage.setItem('user', JSON.stringify(user));

        // Set analytics user
        AnalyticsService.setUserId(user._id);
        await AnalyticsService.trackEvent(AnalyticsEvent.LOGIN, {
          method: 'email',
        });

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        navigation.replace('Main');
      } else {
        throw new Error(response.error || 'Login failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      Alert.alert('Login Failed', errorMessage);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      setLoading(true);

      // TODO: Implement Google Sign-In
      // const { idToken } = await GoogleSignin.signIn();
      // const response = await ApiService.loginWithGoogle(idToken);

      await AnalyticsService.trackEvent(AnalyticsEvent.LOGIN, {
        method: 'google',
      });

      Alert.alert(
        'Coming Soon',
        'Google Sign-In will be available in the next update!'
      );
    } catch (error) {
      Alert.alert('Error', 'Google Sign-In failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      setLoading(true);

      // TODO: Implement Apple Sign-In
      // const appleAuthRequestResponse = await AppleAuthentication.signInAsync({...});
      // const response = await ApiService.loginWithApple(identityToken, authorizationCode);

      await AnalyticsService.trackEvent(AnalyticsEvent.LOGIN, {
        method: 'apple',
      });

      Alert.alert(
        'Coming Soon',
        'Apple Sign-In will be available in the next update!'
      );
    } catch (error) {
      Alert.alert('Error', 'Apple Sign-In failed');
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Coming Soon',
      'Facebook Sign-In will be available in the next update!'
    );
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
            🙏
          </Text>
          <Text variant="headlineLarge" style={styles.appName}>
            Gratitude Journal
          </Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            Welcome back! Sign in to continue your gratitude journey.
          </Text>
        </View>

        <Card style={styles.card}>
          <Card.Content>
            {/* Email Input */}
            <TextInput
              label="Email"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setErrors({ ...errors, email: undefined });
              }}
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

            {/* Password Input */}
            <TextInput
              label="Password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setErrors({ ...errors, password: undefined });
              }}
              mode="outlined"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoComplete="password"
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

            {/* Forgot Password */}
            <TouchableOpacity
              onPress={() => navigation.navigate('ForgotPassword')}
              style={styles.forgotPassword}
              disabled={loading}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <Button
              mode="contained"
              onPress={handleLogin}
              loading={loading}
              disabled={loading}
              style={styles.loginButton}
              contentStyle={styles.buttonContent}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <Divider style={styles.divider} />
              <Text style={styles.dividerText}>OR</Text>
              <Divider style={styles.divider} />
            </View>

            {/* Social Login Buttons */}
            <Button
              mode="outlined"
              onPress={handleGoogleLogin}
              disabled={loading}
              style={styles.socialButton}
              contentStyle={styles.buttonContent}
              icon={({ size, color }) => (
                <Icon name="google" size={size} color={color} />
              )}
            >
              Continue with Google
            </Button>

            <Button
              mode="outlined"
              onPress={handleAppleLogin}
              disabled={loading}
              style={styles.socialButton}
              contentStyle={styles.buttonContent}
              icon={({ size, color }) => (
                <Icon name="apple" size={size} color={color} />
              )}
            >
              Continue with Apple
            </Button>

            <Button
              mode="outlined"
              onPress={handleFacebookLogin}
              disabled={loading}
              style={styles.socialButton}
              contentStyle={styles.buttonContent}
              icon={({ size, color }) => (
                <Icon name="facebook" size={size} color={color} />
              )}
            >
              Continue with Facebook
            </Button>
          </Card.Content>
        </Card>

        {/* Sign Up Link */}
        <View style={styles.signUpContainer}>
          <Text style={styles.signUpText}>Don't have an account? </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Register')}
            disabled={loading}
          >
            <Text style={styles.signUpLink}>Sign Up</Text>
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: 10,
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  loginButton: {
    marginBottom: 20,
  },
  buttonContent: {
    height: 50,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  divider: {
    flex: 1,
  },
  dividerText: {
    marginHorizontal: 10,
    color: '#666',
  },
  socialButton: {
    marginBottom: 10,
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  signUpText: {
    color: '#666',
  },
  signUpLink: {
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
