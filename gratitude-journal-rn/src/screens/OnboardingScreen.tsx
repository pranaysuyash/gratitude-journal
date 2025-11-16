/**
 * Onboarding Screen - First-Time User Experience
 * PM Priority: High - Critical for conversion
 * © 2024 Gratitude Journal. All Rights Reserved.
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import LottieView from 'lottie-react-native';

const { width, height } = Dimensions.get('window');

const ONBOARDING_STEPS = [
  {
    id: 1,
    title: 'Welcome to Gratitude Journal',
    description: 'Transform your mindset with daily gratitude practice',
    emoji: '🙏',
    color: '#4CAF50',
    features: [
      '✍️ Write daily entries',
      '📊 Track your mood',
      '🔥 Build streaks',
      '🏆 Earn badges',
    ],
  },
  {
    id: 2,
    title: 'AI-Powered Insights',
    description: 'Get personalized insights from your journal',
    emoji: '🤖',
    color: '#2196F3',
    features: [
      '🧠 Sentiment analysis',
      '💡 Daily prompts',
      '📈 Trend analysis',
      '🎯 Goal suggestions',
    ],
  },
  {
    id: 3,
    title: 'Join the Community',
    description: 'Share gratitude with friends and family',
    emoji: '👥',
    color: '#FF9800',
    features: [
      '👨‍👩‍👧‍👦 Family journals',
      '🤝 Friend connections',
      '🎮 Group challenges',
      '🌍 Public feed',
    ],
  },
];

export default function OnboardingScreen() {
  const navigation = useNavigation();
  const [currentStep, setCurrentStep] = useState(0);
  const slideAnim = useSharedValue(0);

  const step = ONBOARDING_STEPS[currentStep];

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (currentStep < ONBOARDING_STEPS.length - 1) {
      slideAnim.value = withSpring(0);
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding
      // Track event: onboarding_completed
      navigation.navigate('Auth' as never);
    }
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Track event: onboarding_skipped
    navigation.navigate('Auth' as never);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: slideAnim.value }],
  }));

  return (
    <View style={[styles.container, { backgroundColor: step.color }]}>
      {/* Skip Button */}
      {currentStep < ONBOARDING_STEPS.length - 1 && (
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      )}

      {/* Content */}
      <Animated.View style={[styles.content, animatedStyle]}>
        {/* Emoji/Animation */}
        <View style={styles.emojiContainer}>
          <Text style={styles.emoji}>{step.emoji}</Text>
        </View>

        {/* Title */}
        <Text variant="headlineLarge" style={styles.title}>
          {step.title}
        </Text>

        {/* Description */}
        <Text variant="bodyLarge" style={styles.description}>
          {step.description}
        </Text>

        {/* Features */}
        <View style={styles.featuresContainer}>
          {step.features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>
      </Animated.View>

      {/* Pagination Dots */}
      <View style={styles.pagination}>
        {ONBOARDING_STEPS.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              index === currentStep && styles.activeDot,
            ]}
          />
        ))}
      </View>

      {/* Next Button */}
      <Button
        mode="contained"
        onPress={handleNext}
        style={styles.nextButton}
        contentStyle={styles.nextButtonContent}
        labelStyle={styles.nextButtonLabel}
      >
        {currentStep === ONBOARDING_STEPS.length - 1
          ? 'Get Started'
          : 'Next'}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  skipButton: {
    alignSelf: 'flex-end',
    padding: 10,
  },
  skipText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  emoji: {
    fontSize: 64,
  },
  title: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    color: '#fff',
    textAlign: 'center',
    opacity: 0.9,
    marginBottom: 40,
  },
  featuresContainer: {
    width: '100%',
  },
  featureItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  featureText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    marginHorizontal: 4,
  },
  activeDot: {
    width: 24,
    backgroundColor: '#fff',
  },
  nextButton: {
    backgroundColor: '#fff',
  },
  nextButtonContent: {
    paddingVertical: 8,
  },
  nextButtonLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
