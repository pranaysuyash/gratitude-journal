/**
 * Premium Screen - Subscription pricing and features
 * © 2024 Gratitude Journal. All Rights Reserved.
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  ActivityIndicator,
  Snackbar,
  List,
  Chip,
} from 'react-native-paper';
import * as Haptics from 'expo-haptics';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ApiService from '../../services/ApiService';
import AnalyticsService, { AnalyticsEvent } from '../../services/AnalyticsService';

const { width } = Dimensions.get('window');

type PlanInterval = 'monthly' | 'yearly';

interface PricingPlan {
  id: 'premium' | 'family';
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
  color: string;
}

export default function PremiumScreen() {
  const [loading, setLoading] = useState(false);
  const [interval, setInterval] = useState<PlanInterval>('monthly');
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    AnalyticsService.trackScreenView('premium_screen');
    AnalyticsService.trackEvent(AnalyticsEvent.SUBSCRIPTION_VIEWED);
  }, []);

  const plans: PricingPlan[] = [
    {
      id: 'premium',
      name: 'Premium',
      monthlyPrice: 4.99,
      yearlyPrice: 49.99,
      color: '#4CAF50',
      features: [
        'Unlimited journal entries',
        'Advanced AI insights & analysis',
        'Custom themes & templates',
        'Priority support',
        'Export to PDF, JSON, CSV',
        'Cloud backup & sync',
        'Remove all ads',
        'Video & voice notes',
        'Advanced analytics',
      ],
    },
    {
      id: 'family',
      name: 'Family',
      monthlyPrice: 9.99,
      yearlyPrice: 99.99,
      color: '#2196F3',
      features: [
        'All Premium features',
        'Up to 6 family members',
        'Shared family journal',
        'Family challenges',
        'Parental controls',
        'Individual & family analytics',
        'Private family space',
        'Custom family badges',
      ],
    },
  ];

  const handleSubscribe = async (planId: 'premium' | 'family') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      setLoading(true);

      // Track subscription attempt
      AnalyticsService.trackEvent('subscription_clicked' as AnalyticsEvent, {
        plan: planId,
        interval,
      });

      const response = await ApiService.createCheckoutSession(planId, interval);

      if (response.success && response.data) {
        // In a real app, this would open Stripe checkout
        showSnackbar('Coming Soon: Stripe integration will be added here!');

        // Simulate successful subscription for demo
        // In production, this would redirect to Stripe and handle webhook
        setTimeout(() => {
          AnalyticsService.trackEvent(AnalyticsEvent.SUBSCRIPTION_PURCHASED, {
            plan: planId,
            interval,
            price: interval === 'monthly'
              ? plans.find(p => p.id === planId)?.monthlyPrice
              : plans.find(p => p.id === planId)?.yearlyPrice,
          });
        }, 1000);
      } else {
        showSnackbar(response.error || 'Failed to start checkout');
      }
    } catch (error) {
      showSnackbar('Error starting checkout');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  const getPrice = (plan: PricingPlan) => {
    return interval === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
  };

  const getSavings = (plan: PricingPlan) => {
    const monthlyTotal = plan.monthlyPrice * 12;
    const yearlySavings = monthlyTotal - plan.yearlyPrice;
    const savingsPercent = Math.round((yearlySavings / monthlyTotal) * 100);
    return savingsPercent;
  };

  const renderPlan = (plan: PricingPlan) => {
    const price = getPrice(plan);
    const savings = getSavings(plan);
    const isRecommended = plan.id === 'premium';

    return (
      <Card key={plan.id} style={[styles.planCard, isRecommended && styles.recommendedCard]}>
        {isRecommended && (
          <View style={styles.recommendedBadge}>
            <Text variant="labelSmall" style={styles.recommendedText}>
              MOST POPULAR
            </Text>
          </View>
        )}
        <Card.Content>
          <View style={styles.planHeader}>
            <Icon name="crown" size={32} color={plan.color} />
            <View style={styles.planTitleContainer}>
              <Text variant="headlineSmall" style={styles.planName}>
                {plan.name}
              </Text>
              {interval === 'yearly' && (
                <Chip
                  mode="flat"
                  compact
                  style={styles.savingsChip}
                  textStyle={styles.savingsText}
                >
                  Save {savings}%
                </Chip>
              )}
            </View>
          </View>

          <View style={styles.priceContainer}>
            <Text variant="displayMedium" style={[styles.price, { color: plan.color }]}>
              ${price.toFixed(2)}
            </Text>
            <Text variant="bodyLarge" style={styles.priceInterval}>
              /{interval === 'monthly' ? 'month' : 'year'}
            </Text>
          </View>

          {interval === 'yearly' && (
            <Text variant="bodySmall" style={styles.priceNote}>
              ${(plan.yearlyPrice / 12).toFixed(2)}/month billed annually
            </Text>
          )}

          <List.Section style={styles.featuresList}>
            {plan.features.map((feature, index) => (
              <List.Item
                key={index}
                title={feature}
                titleNumberOfLines={2}
                left={props => <List.Icon {...props} icon="check-circle" color={plan.color} />}
                titleStyle={styles.featureText}
              />
            ))}
          </List.Section>

          <Button
            mode="contained"
            onPress={() => handleSubscribe(plan.id)}
            loading={loading}
            disabled={loading}
            style={[styles.subscribeButton, { backgroundColor: plan.color }]}
            contentStyle={styles.subscribeButtonContent}
          >
            Subscribe Now
          </Button>
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Icon name="crown" size={48} color="#FFD700" />
          <Text variant="headlineMedium" style={styles.headerTitle}>
            Upgrade to Premium
          </Text>
          <Text variant="bodyLarge" style={styles.headerSubtitle}>
            Unlock the full potential of your gratitude practice
          </Text>
        </View>

        {/* Interval Toggle */}
        <View style={styles.intervalToggle}>
          <Button
            mode={interval === 'monthly' ? 'contained' : 'outlined'}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setInterval('monthly');
            }}
            style={styles.intervalButton}
          >
            Monthly
          </Button>
          <Button
            mode={interval === 'yearly' ? 'contained' : 'outlined'}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setInterval('yearly');
            }}
            style={styles.intervalButton}
          >
            Yearly (Save up to 17%)
          </Button>
        </View>

        {/* Pricing Plans */}
        {plans.map(renderPlan)}

        {/* Free Features */}
        <Card style={styles.freeCard}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.freeTitle}>
              Free Forever
            </Text>
            <Text variant="bodyMedium" style={styles.freeSubtitle}>
              Basic features available to all users
            </Text>
            <List.Section>
              {[
                'Up to 50 entries per month',
                'Basic mood tracking',
                'Search & filter entries',
                'Daily reminders',
                'Basic analytics',
              ].map((feature, index) => (
                <List.Item
                  key={index}
                  title={feature}
                  left={props => <List.Icon {...props} icon="check" color="#666" />}
                  titleStyle={styles.freeFeatureText}
                />
              ))}
            </List.Section>
          </Card.Content>
        </Card>

        {/* FAQ */}
        <Card style={styles.faqCard}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.faqTitle}>
              Frequently Asked Questions
            </Text>

            <View style={styles.faqItem}>
              <Text variant="titleMedium" style={styles.faqQuestion}>
                Can I cancel anytime?
              </Text>
              <Text variant="bodyMedium" style={styles.faqAnswer}>
                Yes! You can cancel your subscription at any time. You'll continue to have access until the end of your billing period.
              </Text>
            </View>

            <View style={styles.faqItem}>
              <Text variant="titleMedium" style={styles.faqQuestion}>
                What payment methods do you accept?
              </Text>
              <Text variant="bodyMedium" style={styles.faqAnswer}>
                We accept all major credit cards, debit cards, and digital wallets through Stripe.
              </Text>
            </View>

            <View style={styles.faqItem}>
              <Text variant="titleMedium" style={styles.faqQuestion}>
                Is my data secure?
              </Text>
              <Text variant="bodyMedium" style={styles.faqAnswer}>
                Absolutely! We use industry-standard encryption and security practices to protect your data. Your journal entries are private and secure.
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Coming Soon Notice */}
        <Card style={styles.comingSoonCard}>
          <Card.Content>
            <View style={styles.comingSoonContent}>
              <Icon name="information" size={24} color="#2196F3" />
              <Text variant="bodyMedium" style={styles.comingSoonText}>
                Payment processing is coming soon! This is a demo of the premium features.
              </Text>
            </View>
          </Card.Content>
        </Card>

        <View style={{ height: 32 }} />
      </ScrollView>

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
  content: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  headerSubtitle: {
    color: '#666',
    textAlign: 'center',
  },
  intervalToggle: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  intervalButton: {
    flex: 1,
  },
  planCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    position: 'relative',
  },
  recommendedCard: {
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  recommendedBadge: {
    position: 'absolute',
    top: -12,
    alignSelf: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  recommendedText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  planTitleContainer: {
    flex: 1,
    marginLeft: 12,
  },
  planName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  savingsChip: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFE57F',
  },
  savingsText: {
    color: '#F57C00',
    fontWeight: 'bold',
    fontSize: 11,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  price: {
    fontWeight: 'bold',
  },
  priceInterval: {
    color: '#666',
    marginLeft: 4,
  },
  priceNote: {
    color: '#666',
    marginBottom: 16,
  },
  featuresList: {
    marginVertical: 8,
  },
  featureText: {
    fontSize: 14,
  },
  subscribeButton: {
    marginTop: 16,
  },
  subscribeButtonContent: {
    paddingVertical: 8,
  },
  freeCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  freeTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  freeSubtitle: {
    color: '#666',
    marginBottom: 16,
  },
  freeFeatureText: {
    fontSize: 14,
    color: '#666',
  },
  faqCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  faqTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  faqItem: {
    marginBottom: 16,
  },
  faqQuestion: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  faqAnswer: {
    color: '#666',
    lineHeight: 20,
  },
  comingSoonCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#E3F2FD',
  },
  comingSoonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  comingSoonText: {
    flex: 1,
    marginLeft: 12,
    color: '#1976D2',
  },
});
