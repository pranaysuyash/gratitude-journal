/**
 * Feature Flags Service - A/B Testing & Remote Config
 * PM Priority: High - Enable experimentation
 * © 2024 Gratitude Journal. All Rights Reserved.
 */

import remoteConfig from '@react-native-firebase/remote-config';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Feature flags enum
export enum FeatureFlag {
  // UI Experiments
  NEW_HOME_SCREEN = 'new_home_screen',
  SIMPLIFIED_ONBOARDING = 'simplified_onboarding',
  DARK_MODE_DEFAULT = 'dark_mode_default',

  // Feature Toggles
  AI_COACH_ENABLED = 'ai_coach_enabled',
  NFT_MINTING_ENABLED = 'nft_minting_enabled',
  SOCIAL_FEED_ENABLED = 'social_feed_enabled',
  VOICE_ENTRIES_ENABLED = 'voice_entries_enabled',
  AR_FEATURES_ENABLED = 'ar_features_enabled',

  // Monetization
  PAYWALL_VERSION = 'paywall_version',
  TRIAL_DAYS = 'trial_days',
  PREMIUM_DISCOUNT_PERCENT = 'premium_discount_percent',

  // Engagement
  STREAK_REMINDER_ENABLED = 'streak_reminder_enabled',
  GAMIFICATION_LEVEL = 'gamification_level',
  DAILY_PROMPT_STYLE = 'daily_prompt_style',

  // Performance
  IMAGE_COMPRESSION_QUALITY = 'image_compression_quality',
  MAX_ENTRIES_PER_PAGE = 'max_entries_per_page',
  CACHE_DURATION_HOURS = 'cache_duration_hours',
}

// Default values
const DEFAULT_VALUES: Record<FeatureFlag, boolean | string | number> = {
  // UI
  [FeatureFlag.NEW_HOME_SCREEN]: false,
  [FeatureFlag.SIMPLIFIED_ONBOARDING]: false,
  [FeatureFlag.DARK_MODE_DEFAULT]: false,

  // Features
  [FeatureFlag.AI_COACH_ENABLED]: true,
  [FeatureFlag.NFT_MINTING_ENABLED]: false,
  [FeatureFlag.SOCIAL_FEED_ENABLED]: true,
  [FeatureFlag.VOICE_ENTRIES_ENABLED]: true,
  [FeatureFlag.AR_FEATURES_ENABLED]: false,

  // Monetization
  [FeatureFlag.PAYWALL_VERSION]: 'v1',
  [FeatureFlag.TRIAL_DAYS]: 7,
  [FeatureFlag.PREMIUM_DISCOUNT_PERCENT]: 0,

  // Engagement
  [FeatureFlag.STREAK_REMINDER_ENABLED]: true,
  [FeatureFlag.GAMIFICATION_LEVEL]: 'full',
  [FeatureFlag.DAILY_PROMPT_STYLE]: 'personalized',

  // Performance
  [FeatureFlag.IMAGE_COMPRESSION_QUALITY]: 0.8,
  [FeatureFlag.MAX_ENTRIES_PER_PAGE]: 20,
  [FeatureFlag.CACHE_DURATION_HOURS]: 24,
};

class FeatureFlagsService {
  private static instance: FeatureFlagsService;
  private initialized = false;
  private localOverrides: Map<FeatureFlag, any> = new Map();

  private constructor() {}

  static getInstance(): FeatureFlagsService {
    if (!FeatureFlagsService.instance) {
      FeatureFlagsService.instance = new FeatureFlagsService();
    }
    return FeatureFlagsService.instance;
  }

  /**
   * Initialize remote config
   */
  async initialize(): Promise<void> {
    try {
      // Set default values
      await remoteConfig().setDefaults(DEFAULT_VALUES);

      // Set config settings
      await remoteConfig().setConfigSettings({
        minimumFetchIntervalMillis: 3600000, // 1 hour
      });

      // Fetch and activate
      await remoteConfig().fetchAndActivate();

      // Load local overrides (for testing)
      await this.loadLocalOverrides();

      this.initialized = true;

      if (__DEV__) {
        console.log('✅ Feature flags initialized');
      }
    } catch (error) {
      console.error('Feature flags initialization error:', error);
      this.initialized = true; // Use defaults
    }
  }

  /**
   * Get boolean flag value
   */
  getBooleanFlag(flag: FeatureFlag): boolean {
    // Check local override first (for testing)
    if (this.localOverrides.has(flag)) {
      return this.localOverrides.get(flag) as boolean;
    }

    try {
      return remoteConfig().getBoolean(flag);
    } catch {
      return DEFAULT_VALUES[flag] as boolean;
    }
  }

  /**
   * Get string flag value
   */
  getStringFlag(flag: FeatureFlag): string {
    if (this.localOverrides.has(flag)) {
      return this.localOverrides.get(flag) as string;
    }

    try {
      return remoteConfig().getString(flag);
    } catch {
      return DEFAULT_VALUES[flag] as string;
    }
  }

  /**
   * Get number flag value
   */
  getNumberFlag(flag: FeatureFlag): number {
    if (this.localOverrides.has(flag)) {
      return this.localOverrides.get(flag) as number;
    }

    try {
      return remoteConfig().getNumber(flag);
    } catch {
      return DEFAULT_VALUES[flag] as number;
    }
  }

  /**
   * Set local override (for testing)
   */
  async setLocalOverride(
    flag: FeatureFlag,
    value: boolean | string | number
  ): Promise<void> {
    this.localOverrides.set(flag, value);
    await this.saveLocalOverrides();

    if (__DEV__) {
      console.log(`🧪 Feature flag override: ${flag} = ${value}`);
    }
  }

  /**
   * Clear local override
   */
  async clearLocalOverride(flag: FeatureFlag): Promise<void> {
    this.localOverrides.delete(flag);
    await this.saveLocalOverrides();
  }

  /**
   * Clear all local overrides
   */
  async clearAllOverrides(): Promise<void> {
    this.localOverrides.clear();
    await AsyncStorage.removeItem('feature_flag_overrides');
  }

  /**
   * Get all active experiments
   */
  getActiveExperiments(): Record<string, any> {
    const experiments: Record<string, any> = {};

    Object.values(FeatureFlag).forEach((flag) => {
      const value = remoteConfig().getValue(flag);
      experiments[flag] = value.asString();
    });

    return experiments;
  }

  /**
   * Save local overrides
   */
  private async saveLocalOverrides(): Promise<void> {
    try {
      const data = JSON.stringify(Array.from(this.localOverrides.entries()));
      await AsyncStorage.setItem('feature_flag_overrides', data);
    } catch (error) {
      console.error('Error saving feature flag overrides:', error);
    }
  }

  /**
   * Load local overrides
   */
  private async loadLocalOverrides(): Promise<void> {
    try {
      const data = await AsyncStorage.getItem('feature_flag_overrides');
      if (data) {
        const entries = JSON.parse(data);
        this.localOverrides = new Map(entries);
      }
    } catch (error) {
      console.error('Error loading feature flag overrides:', error);
    }
  }

  /**
   * Refresh config from server
   */
  async refresh(): Promise<void> {
    try {
      await remoteConfig().fetch(0);
      await remoteConfig().activate();
    } catch (error) {
      console.error('Error refreshing feature flags:', error);
    }
  }
}

export default FeatureFlagsService.getInstance();
