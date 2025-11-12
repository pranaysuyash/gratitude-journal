/**
 * User Model
 * Complete user schema with authentication, preferences, and social features
 * © 2024 Gratitude Journal. All Rights Reserved.
 */

import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  password: string;
  username: string;
  displayName: string;
  avatar?: string;
  bio?: string;

  // Authentication
  isVerified: boolean;
  verificationToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  lastLogin?: Date;
  loginStreak: number;

  // Preferences
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    accentColor: string;
    fontSize: 'small' | 'medium' | 'large';
    fontFamily: string;
    language: string;
    timezone: string;
    dateFormat: string;
    firstDayOfWeek: number;
  };

  // Privacy
  privacySettings: {
    profileVisibility: 'public' | 'private' | 'friends';
    showEmail: boolean;
    showStats: boolean;
    allowFriendRequests: boolean;
    allowMessages: boolean;
    dataCollectionConsent: boolean;
  };

  // Notifications
  notificationSettings: {
    email: boolean;
    push: boolean;
    reminderTime?: string;
    weeklyReport: boolean;
    monthlyReport: boolean;
    achievements: boolean;
    social: boolean;
  };

  // Gamification
  stats: {
    totalEntries: number;
    currentStreak: number;
    longestStreak: number;
    totalWords: number;
    favoriteTime: string;
    badges: mongoose.Types.ObjectId[];
    level: number;
    experience: number;
  };

  // Social
  friends: mongoose.Types.ObjectId[];
  friendRequests: {
    from: mongoose.Types.ObjectId;
    createdAt: Date;
  }[];
  blockedUsers: mongoose.Types.ObjectId[];

  // Subscription
  subscription: {
    tier: 'free' | 'premium' | 'family';
    status: 'active' | 'cancelled' | 'expired';
    expiresAt?: Date;
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
  };

  // Family & Groups
  familyJournalId?: mongoose.Types.ObjectId;
  groupChallenges: mongoose.Types.ObjectId[];

  // Wellness Integration
  wellnessSync: {
    apple: {
      enabled: boolean;
      lastSync?: Date;
    };
    google: {
      enabled: boolean;
      lastSync?: Date;
    };
    spotify: {
      enabled: boolean;
      accessToken?: string;
      refreshToken?: string;
    };
  };

  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>;

  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    select: false,
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
    match: /^[a-zA-Z0-9_]+$/,
  },
  displayName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50,
  },
  avatar: String,
  bio: {
    type: String,
    maxlength: 500,
  },

  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  lastLogin: Date,
  loginStreak: {
    type: Number,
    default: 0,
  },

  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'auto',
    },
    accentColor: {
      type: String,
      default: '#007AFF',
    },
    fontSize: {
      type: String,
      enum: ['small', 'medium', 'large'],
      default: 'medium',
    },
    fontFamily: {
      type: String,
      default: 'System',
    },
    language: {
      type: String,
      default: 'en',
    },
    timezone: {
      type: String,
      default: 'UTC',
    },
    dateFormat: {
      type: String,
      default: 'MMM dd, yyyy',
    },
    firstDayOfWeek: {
      type: Number,
      default: 0,
      min: 0,
      max: 6,
    },
  },

  privacySettings: {
    profileVisibility: {
      type: String,
      enum: ['public', 'private', 'friends'],
      default: 'private',
    },
    showEmail: {
      type: Boolean,
      default: false,
    },
    showStats: {
      type: Boolean,
      default: true,
    },
    allowFriendRequests: {
      type: Boolean,
      default: true,
    },
    allowMessages: {
      type: Boolean,
      default: true,
    },
    dataCollectionConsent: {
      type: Boolean,
      default: false,
    },
  },

  notificationSettings: {
    email: {
      type: Boolean,
      default: true,
    },
    push: {
      type: Boolean,
      default: true,
    },
    reminderTime: String,
    weeklyReport: {
      type: Boolean,
      default: true,
    },
    monthlyReport: {
      type: Boolean,
      default: true,
    },
    achievements: {
      type: Boolean,
      default: true,
    },
    social: {
      type: Boolean,
      default: true,
    },
  },

  stats: {
    totalEntries: {
      type: Number,
      default: 0,
    },
    currentStreak: {
      type: Number,
      default: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
    },
    totalWords: {
      type: Number,
      default: 0,
    },
    favoriteTime: String,
    badges: [{
      type: Schema.Types.ObjectId,
      ref: 'Badge',
    }],
    level: {
      type: Number,
      default: 1,
    },
    experience: {
      type: Number,
      default: 0,
    },
  },

  friends: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],

  friendRequests: [{
    from: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],

  blockedUsers: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],

  subscription: {
    tier: {
      type: String,
      enum: ['free', 'premium', 'family'],
      default: 'free',
    },
    status: {
      type: String,
      enum: ['active', 'cancelled', 'expired'],
      default: 'active',
    },
    expiresAt: Date,
    stripeCustomerId: String,
    stripeSubscriptionId: String,
  },

  familyJournalId: {
    type: Schema.Types.ObjectId,
    ref: 'FamilyJournal',
  },

  groupChallenges: [{
    type: Schema.Types.ObjectId,
    ref: 'GroupChallenge',
  }],

  wellnessSync: {
    apple: {
      enabled: {
        type: Boolean,
        default: false,
      },
      lastSync: Date,
    },
    google: {
      enabled: {
        type: Boolean,
        default: false,
      },
      lastSync: Date,
    },
    spotify: {
      enabled: {
        type: Boolean,
        default: false,
      },
      accessToken: String,
      refreshToken: String,
    },
  },
}, {
  timestamps: true,
});

// Indexes
UserSchema.index({ email: 1 });
UserSchema.index({ username: 1 });
UserSchema.index({ 'stats.level': 1 });
UserSchema.index({ 'subscription.tier': 1 });

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    return false;
  }
};

export default mongoose.model<IUser>('User', UserSchema);
