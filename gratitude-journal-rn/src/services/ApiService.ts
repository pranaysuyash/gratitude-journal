/**
 * API Service
 * Handles all backend API communications
 * © 2024 Gratitude Journal. All Rights Reserved.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import AnalyticsService from './AnalyticsService';

const API_BASE_URL = __DEV__
  ? 'http://localhost:3000/api'
  : 'https://api.gratitudejournal.com/api';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

interface User {
  _id: string;
  email: string;
  username: string;
  displayName: string;
  level: number;
  experience: number;
  subscription: {
    tier: 'free' | 'premium' | 'family' | 'enterprise';
    status: 'active' | 'cancelled' | 'expired' | 'trial';
  };
  stats: {
    totalEntries: number;
    currentStreak: number;
    longestStreak: number;
  };
}

interface Entry {
  _id: string;
  userId: string;
  content: string;
  mood: string;
  tags: string[];
  categories: string[];
  photoUrls: string[];
  videoUrl?: string;
  voiceNoteUrl?: string;
  location?: {
    type: string;
    coordinates: number[];
    name?: string;
  };
  weather?: {
    temperature: number;
    condition: string;
    icon: string;
  };
  aiAnalysis?: {
    sentimentScore: number;
    summary: string;
    keyThemes: string[];
    suggestedTags: string[];
  };
  createdAt: string;
  updatedAt: string;
}

interface Goal {
  _id: string;
  userId: string;
  title: string;
  description: string;
  category: string;
  targetDate: string;
  progress: number;
  milestones: Array<{
    title: string;
    completed: boolean;
  }>;
  status: 'active' | 'completed' | 'archived';
}

interface Badge {
  _id: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  unlocked?: boolean;
}

class ApiService {
  private static instance: ApiService;
  private authToken: string | null = null;

  private constructor() {
    this.loadAuthToken();
  }

  static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  private async loadAuthToken(): Promise<void> {
    try {
      const token = await AsyncStorage.getItem('authToken');
      this.authToken = token;
    } catch (error) {
      console.error('Failed to load auth token:', error);
    }
  }

  async setAuthToken(token: string | null): Promise<void> {
    this.authToken = token;
    if (token) {
      await AsyncStorage.setItem('authToken', token);
    } else {
      await AsyncStorage.removeItem('authToken');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
      };

      if (this.authToken) {
        headers['Authorization'] = `Bearer ${this.authToken}`;
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }

      return { success: true, data };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`API Error [${endpoint}]:`, errorMessage);

      AnalyticsService.trackEvent('api_error', {
        endpoint,
        error: errorMessage,
      });

      return { success: false, error: errorMessage };
    }
  }

  // ==================== Authentication ====================

  async register(
    email: string,
    password: string,
    username: string,
    displayName: string
  ): Promise<ApiResponse<{ token: string; user: User }>> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, username, displayName }),
    });
  }

  async login(
    email: string,
    password: string
  ): Promise<ApiResponse<{ token: string; user: User }>> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async loginWithGoogle(
    idToken: string
  ): Promise<ApiResponse<{ token: string; user: User }>> {
    return this.request('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ idToken }),
    });
  }

  async loginWithApple(
    identityToken: string,
    authorizationCode: string
  ): Promise<ApiResponse<{ token: string; user: User }>> {
    return this.request('/auth/apple', {
      method: 'POST',
      body: JSON.stringify({ identityToken, authorizationCode }),
    });
  }

  async forgotPassword(email: string): Promise<ApiResponse> {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token: string, newPassword: string): Promise<ApiResponse> {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
  }

  async verifyEmail(token: string): Promise<ApiResponse> {
    return this.request('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  async logout(): Promise<void> {
    await this.setAuthToken(null);
  }

  // ==================== Entries ====================

  async createEntry(entryData: {
    content: string;
    mood: string;
    tags?: string[];
    categories?: string[];
    photoUrls?: string[];
    videoUrl?: string;
    voiceNoteUrl?: string;
    location?: any;
    weather?: any;
  }): Promise<ApiResponse<Entry>> {
    return this.request('/entries', {
      method: 'POST',
      body: JSON.stringify(entryData),
    });
  }

  async getEntries(params?: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
    mood?: string;
    tags?: string[];
    search?: string;
  }): Promise<ApiResponse<{ entries: Entry[]; total: number; pages: number }>> {
    const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return this.request(`/entries${queryString}`);
  }

  async getEntry(id: string): Promise<ApiResponse<Entry>> {
    return this.request(`/entries/${id}`);
  }

  async updateEntry(id: string, updates: Partial<Entry>): Promise<ApiResponse<Entry>> {
    return this.request(`/entries/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteEntry(id: string): Promise<ApiResponse> {
    return this.request(`/entries/${id}`, {
      method: 'DELETE',
    });
  }

  async searchEntries(query: string): Promise<ApiResponse<Entry[]>> {
    return this.request(`/entries/search?q=${encodeURIComponent(query)}`);
  }

  async getRandomEntry(): Promise<ApiResponse<Entry>> {
    return this.request('/entries/random');
  }

  // ==================== User ====================

  async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.request('/users/me');
  }

  async updateProfile(updates: {
    displayName?: string;
    bio?: string;
    avatarUrl?: string;
    preferences?: any;
  }): Promise<ApiResponse<User>> {
    return this.request('/users/me', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async updatePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<ApiResponse> {
    return this.request('/users/me/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  async deleteAccount(): Promise<ApiResponse> {
    return this.request('/users/me', {
      method: 'DELETE',
    });
  }

  async getUserStats(): Promise<ApiResponse<any>> {
    return this.request('/users/me/stats');
  }

  async getLeaderboard(timeframe: 'week' | 'month' | 'all' = 'week'): Promise<ApiResponse<any[]>> {
    return this.request(`/users/leaderboard?timeframe=${timeframe}`);
  }

  // ==================== Goals ====================

  async getGoals(status?: 'active' | 'completed' | 'archived'): Promise<ApiResponse<Goal[]>> {
    const query = status ? `?status=${status}` : '';
    return this.request(`/goals${query}`);
  }

  async createGoal(goalData: {
    title: string;
    description: string;
    category: string;
    targetDate: string;
    milestones?: Array<{ title: string }>;
  }): Promise<ApiResponse<Goal>> {
    return this.request('/goals', {
      method: 'POST',
      body: JSON.stringify(goalData),
    });
  }

  async updateGoal(id: string, updates: Partial<Goal>): Promise<ApiResponse<Goal>> {
    return this.request(`/goals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteGoal(id: string): Promise<ApiResponse> {
    return this.request(`/goals/${id}`, {
      method: 'DELETE',
    });
  }

  async updateGoalProgress(id: string, progress: number): Promise<ApiResponse<Goal>> {
    return this.request(`/goals/${id}/progress`, {
      method: 'PUT',
      body: JSON.stringify({ progress }),
    });
  }

  // ==================== Badges ====================

  async getBadges(): Promise<ApiResponse<Badge[]>> {
    return this.request('/badges');
  }

  async unlockBadge(id: string): Promise<ApiResponse<Badge>> {
    return this.request(`/badges/${id}/unlock`, {
      method: 'POST',
    });
  }

  // ==================== Analytics ====================

  async getAnalytics(params?: {
    startDate?: string;
    endDate?: string;
    groupBy?: 'day' | 'week' | 'month';
  }): Promise<ApiResponse<any>> {
    const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return this.request(`/analytics${queryString}`);
  }

  async getMoodTrends(timeframe: number = 30): Promise<ApiResponse<any>> {
    return this.request(`/analytics/mood-trends?days=${timeframe}`);
  }

  async getWordCloud(): Promise<ApiResponse<any>> {
    return this.request('/analytics/word-cloud');
  }

  async getInsights(): Promise<ApiResponse<any>> {
    return this.request('/analytics/insights');
  }

  // ==================== Social ====================

  async getFriends(): Promise<ApiResponse<any[]>> {
    return this.request('/social/friends');
  }

  async searchUsers(query: string): Promise<ApiResponse<any[]>> {
    return this.request(`/social/search?q=${encodeURIComponent(query)}`);
  }

  async sendFriendRequest(userId: string): Promise<ApiResponse> {
    return this.request('/social/friends/request', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  }

  async acceptFriendRequest(requestId: string): Promise<ApiResponse> {
    return this.request(`/social/friends/request/${requestId}/accept`, {
      method: 'POST',
    });
  }

  async getFeed(page: number = 1, limit: number = 20): Promise<ApiResponse<any>> {
    return this.request(`/social/feed?page=${page}&limit=${limit}`);
  }

  async likeEntry(entryId: string): Promise<ApiResponse> {
    return this.request(`/social/entries/${entryId}/like`, {
      method: 'POST',
    });
  }

  async commentOnEntry(entryId: string, content: string): Promise<ApiResponse> {
    return this.request(`/social/entries/${entryId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  // ==================== AI ====================

  async generatePrompt(category?: string): Promise<ApiResponse<{ prompt: string }>> {
    const query = category ? `?category=${category}` : '';
    return this.request(`/ai/prompt${query}`);
  }

  async askAICoach(question: string, history?: any[]): Promise<ApiResponse<{ response: string }>> {
    return this.request('/ai/coach', {
      method: 'POST',
      body: JSON.stringify({ question, history }),
    });
  }

  // ==================== Export ====================

  async exportData(format: 'json' | 'pdf' | 'csv'): Promise<ApiResponse<{ url: string }>> {
    return this.request(`/export?format=${format}`);
  }

  async generateVideoMontage(entryIds: string[]): Promise<ApiResponse<{ videoUrl: string }>> {
    return this.request('/export/video-montage', {
      method: 'POST',
      body: JSON.stringify({ entryIds }),
    });
  }

  // ==================== Payments ====================

  async createCheckoutSession(
    tier: 'premium' | 'family',
    interval: 'monthly' | 'yearly'
  ): Promise<ApiResponse<{ sessionId: string; url: string }>> {
    return this.request('/payments/create-checkout', {
      method: 'POST',
      body: JSON.stringify({ tier, interval }),
    });
  }

  async cancelSubscription(): Promise<ApiResponse> {
    return this.request('/payments/cancel-subscription', {
      method: 'POST',
    });
  }

  async getSubscriptionStatus(): Promise<ApiResponse<any>> {
    return this.request('/payments/subscription-status');
  }

  // ==================== Blockchain/NFT ====================

  async mintNFT(entryId: string): Promise<ApiResponse<{ tokenId: string; txHash: string }>> {
    return this.request('/blockchain/mint-nft', {
      method: 'POST',
      body: JSON.stringify({ entryId }),
    });
  }

  async getNFTs(): Promise<ApiResponse<any[]>> {
    return this.request('/blockchain/nfts');
  }

  // ==================== Reminders ====================

  async getReminders(): Promise<ApiResponse<any[]>> {
    return this.request('/reminders');
  }

  async createReminder(reminderData: {
    time: string;
    days: number[];
    enabled: boolean;
    message?: string;
  }): Promise<ApiResponse<any>> {
    return this.request('/reminders', {
      method: 'POST',
      body: JSON.stringify(reminderData),
    });
  }

  async updateReminder(id: string, updates: any): Promise<ApiResponse<any>> {
    return this.request(`/reminders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteReminder(id: string): Promise<ApiResponse> {
    return this.request(`/reminders/${id}`, {
      method: 'DELETE',
    });
  }

  // ==================== Community ====================

  async getChallenges(): Promise<ApiResponse<any[]>> {
    return this.request('/community/challenges');
  }

  async joinChallenge(challengeId: string): Promise<ApiResponse> {
    return this.request(`/community/challenges/${challengeId}/join`, {
      method: 'POST',
    });
  }

  async getFamilyJournal(): Promise<ApiResponse<any>> {
    return this.request('/community/family');
  }

  async inviteFamilyMember(email: string): Promise<ApiResponse> {
    return this.request('/community/family/invite', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }
}

export default ApiService.getInstance();
export type { User, Entry, Goal, Badge, ApiResponse };
