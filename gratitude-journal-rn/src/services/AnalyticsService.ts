/**
 * Analytics Service - Track All User Events
 * PM Priority: Critical - Data-driven decisions
 * © 2024 Gratitude Journal. All Rights Reserved.
 */

import analytics from '@react-native-firebase/analytics';
import * as Sentry from '@sentry/react-native';

// Event types for type safety
export enum AnalyticsEvent {
  // Onboarding
  ONBOARDING_STARTED = 'onboarding_started',
  ONBOARDING_COMPLETED = 'onboarding_completed',
  ONBOARDING_SKIPPED = 'onboarding_skipped',

  // Authentication
  SIGNUP_STARTED = 'signup_started',
  SIGNUP_COMPLETED = 'signup_completed',
  LOGIN_SUCCESS = 'login_success',
  LOGIN_FAILED = 'login_failed',
  LOGOUT = 'logout',

  // Entry Management
  ENTRY_CREATED = 'entry_created',
  ENTRY_UPDATED = 'entry_updated',
  ENTRY_DELETED = 'entry_deleted',
  ENTRY_VIEWED = 'entry_viewed',
  ENTRY_SHARED = 'entry_shared',

  // Engagement
  STREAK_ACHIEVED = 'streak_achieved',
  BADGE_UNLOCKED = 'badge_unlocked',
  LEVEL_UP = 'level_up',
  GOAL_CREATED = 'goal_created',
  GOAL_COMPLETED = 'goal_completed',

  // Social
  FRIEND_ADDED = 'friend_added',
  ENTRY_LIKED = 'entry_liked',
  ENTRY_COMMENTED = 'entry_commented',
  FAMILY_JOURNAL_CREATED = 'family_journal_created',

  // Monetization
  SUBSCRIPTION_VIEWED = 'subscription_viewed',
  SUBSCRIPTION_PURCHASED = 'subscription_purchased',
  SUBSCRIPTION_CANCELLED = 'subscription_cancelled',

  // Content
  PROMPT_USED = 'prompt_used',
  TEMPLATE_USED = 'template_used',
  AI_FEATURE_USED = 'ai_feature_used',

  // Retention
  APP_OPENED = 'app_opened',
  NOTIFICATION_OPENED = 'notification_opened',
  REMINDER_SET = 'reminder_set',
}

// User properties
export enum UserProperty {
  SUBSCRIPTION_TIER = 'subscription_tier',
  USER_LEVEL = 'user_level',
  TOTAL_ENTRIES = 'total_entries',
  CURRENT_STREAK = 'current_streak',
  BADGES_COUNT = 'badges_count',
}

class AnalyticsService {
  private static instance: AnalyticsService;
  private userId: string | null = null;

  private constructor() {
    // Initialize Sentry
    if (__DEV__) {
      console.log('Analytics initialized in dev mode');
    }
  }

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  /**
   * Set user ID for tracking
   */
  setUserId(userId: string) {
    this.userId = userId;
    analytics().setUserId(userId);
    Sentry.setUser({ id: userId });
  }

  /**
   * Set user properties
   */
  setUserProperty(property: UserProperty, value: string | number) {
    const props = { [property]: value.toString() };
    analytics().setUserProperties(props);
    Sentry.setContext('user_properties', props);
  }

  /**
   * Track event
   */
  async trackEvent(
    event: AnalyticsEvent,
    params?: Record<string, any>
  ): Promise<void> {
    try {
      // Firebase Analytics
      await analytics().logEvent(event, {
        ...params,
        timestamp: Date.now(),
        user_id: this.userId,
      });

      // Log to console in development
      if (__DEV__) {
        console.log('📊 Analytics Event:', event, params);
      }

      // Sentry breadcrumb
      Sentry.addBreadcrumb({
        category: 'analytics',
        message: event,
        data: params,
        level: 'info',
      });
    } catch (error) {
      console.error('Analytics error:', error);
    }
  }

  /**
   * Track screen view
   */
  async trackScreenView(screenName: string): Promise<void> {
    await analytics().logScreenView({
      screen_name: screenName,
      screen_class: screenName,
    });
  }

  /**
   * Track conversion funnel
   */
  async trackFunnelStep(
    funnelName: string,
    step: number,
    stepName: string
  ): Promise<void> {
    await this.trackEvent(`funnel_${funnelName}` as AnalyticsEvent, {
      step,
      step_name: stepName,
    });
  }

  /**
   * Track revenue
   */
  async trackPurchase(
    productId: string,
    value: number,
    currency: string = 'USD'
  ): Promise<void> {
    await analytics().logPurchase({
      value,
      currency,
      items: [{ item_id: productId }],
    });
  }

  /**
   * Track retention metrics
   */
  async trackRetention(daysSinceInstall: number): Promise<void> {
    await this.trackEvent('retention_day' as AnalyticsEvent, {
      days: daysSinceInstall,
    });
  }
}

export default AnalyticsService.getInstance();
