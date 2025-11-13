/**
 * User Model
 * Complete user schema with all features
 * © 2024 Gratitude Journal. All Rights Reserved.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Authentication
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  password: {
    type: String,
    required: function() { return !this.oauthProvider; },
    minlength: 8,
    select: false
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
    match: /^[a-zA-Z0-9_]+$/
  },

  // OAuth
  oauthProvider: {
    type: String,
    enum: ['google', 'apple', 'facebook', null]
  },
  oauthId: String,

  // Profile
  displayName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  avatar: String,
  bio: {
    type: String,
    maxlength: 500
  },
  coverPhoto: String,

  // Verification & Security
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  twoFactorSecret: String,

  // Settings
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto', 'calm', 'vibrant', 'minimal'],
      default: 'auto'
    },
    language: {
      type: String,
      default: 'en'
    },
    timezone: {
      type: String,
      default: 'UTC'
    },
    reminderTime: String,
    enableNotifications: {
      type: Boolean,
      default: true
    },
    enableSounds: {
      type: Boolean,
      default: true
    },
    enableHaptics: {
      type: Boolean,
      default: true
    },
    privacyLevel: {
      type: String,
      enum: ['public', 'friends', 'private'],
      default: 'private'
    }
  },

  // Gamification
  level: {
    type: Number,
    default: 1,
    min: 1
  },
  experience: {
    type: Number,
    default: 0,
    min: 0
  },
  badges: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Badge'
  }],
  achievements: [{
    achievementId: mongoose.Schema.Types.ObjectId,
    unlockedAt: Date,
    progress: Number
  }],

  // Statistics
  stats: {
    totalEntries: {
      type: Number,
      default: 0
    },
    currentStreak: {
      type: Number,
      default: 0
    },
    longestStreak: {
      type: Number,
      default: 0
    },
    totalWords: {
      type: Number,
      default: 0
    },
    totalPhotos: {
      type: Number,
      default: 0
    },
    totalVoiceNotes: {
      type: Number,
      default: 0
    },
    totalLikes: {
      type: Number,
      default: 0
    },
    totalShares: {
      type: Number,
      default: 0
    },
    joinedChallenges: {
      type: Number,
      default: 0
    },
    completedChallenges: {
      type: Number,
      default: 0
    }
  },

  // Social
  friends: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  pendingFriendRequests: [{
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    sentAt: Date
  }],
  blockedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],

  // Premium
  subscription: {
    tier: {
      type: String,
      enum: ['free', 'premium', 'family', 'enterprise'],
      default: 'free'
    },
    status: {
      type: String,
      enum: ['active', 'cancelled', 'expired', 'trial'],
      default: 'active'
    },
    startDate: Date,
    endDate: Date,
    autoRenew: {
      type: Boolean,
      default: true
    },
    stripeCustomerId: String,
    stripeSubscriptionId: String
  },

  // Integrations
  integrations: {
    spotify: {
      connected: Boolean,
      accessToken: String,
      refreshToken: String,
      expiresAt: Date
    },
    googleCalendar: {
      connected: Boolean,
      accessToken: String,
      refreshToken: String
    },
    appleHealth: {
      connected: Boolean,
      lastSync: Date
    },
    googleFit: {
      connected: Boolean,
      lastSync: Date
    }
  },

  // Blockchain/Web3
  walletAddress: String,
  nftCount: {
    type: Number,
    default: 0
  },
  tokenBalance: {
    type: Number,
    default: 0
  },

  // Admin
  role: {
    type: String,
    enum: ['user', 'moderator', 'admin', 'superadmin'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isBanned: {
    type: Boolean,
    default: false
  },
  banReason: String,
  banExpires: Date,

  // Metadata
  lastLogin: Date,
  lastActive: Date,
  deviceTokens: [String], // For push notifications
  ipAddress: String,
  userAgent: String

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ 'stats.currentStreak': -1 });
userSchema.index({ level: -1 });
userSchema.index({ createdAt: -1 });

// Virtuals
userSchema.virtual('experienceToNextLevel').get(function() {
  return this.level * 100; // 100 XP per level
});

userSchema.virtual('experienceProgress').get(function() {
  return (this.experience % 100) / 100;
});

userSchema.virtual('friendsCount').get(function() {
  return this.friends.length;
});

userSchema.virtual('followersCount').get(function() {
  return this.followers.length;
});

// Pre-save middleware
userSchema.pre('save', async function(next) {
  // Hash password if modified
  if (this.isModified('password') && this.password) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }

  // Check for level up
  const requiredXP = this.level * 100;
  if (this.experience >= requiredXP) {
    this.level += 1;
    this.experience = this.experience - requiredXP;
  }

  next();
});

// Instance methods
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.addExperience = async function(amount) {
  this.experience += amount;
  await this.save();
  return this;
};

userSchema.methods.unlockBadge = async function(badgeId) {
  if (!this.badges.includes(badgeId)) {
    this.badges.push(badgeId);
    await this.save();
  }
  return this;
};

userSchema.methods.incrementStreak = async function() {
  this.stats.currentStreak += 1;
  if (this.stats.currentStreak > this.stats.longestStreak) {
    this.stats.longestStreak = this.stats.currentStreak;
  }
  await this.save();
  return this;
};

userSchema.methods.resetStreak = async function() {
  this.stats.currentStreak = 0;
  await this.save();
  return this;
};

// Static methods
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

userSchema.statics.findByUsername = function(username) {
  return this.findOne({ username });
};

userSchema.statics.getLeaderboard = function(limit = 10) {
  return this.find({ isActive: true })
    .sort({ 'stats.currentStreak': -1, level: -1 })
    .limit(limit)
    .select('username displayName avatar stats level');
};

module.exports = mongoose.model('User', userSchema);
