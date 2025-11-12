/**
 * Badge Model
 * Achievement badges for gamification
 * © 2024 Gratitude Journal. All Rights Reserved.
 */

import mongoose, { Schema, Document } from 'mongoose';

export interface IBadge extends Document {
  name: string;
  description: string;
  category: 'streak' | 'milestone' | 'social' | 'creative' | 'special';

  icon: string;
  color: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

  requirements: {
    type: string;
    value: number;
    description: string;
  };

  points: number;
  level: number;

  isHidden: boolean;
  isActive: boolean;

  unlockMessage: string;

  totalUnlocked: number;

  createdAt: Date;
  updatedAt: Date;
}

export interface IUserBadge extends Document {
  userId: mongoose.Types.ObjectId;
  badgeId: mongoose.Types.ObjectId;
  unlockedAt: Date;
  progress: number;
  isNew: boolean;
}

const BadgeSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    maxlength: 100,
  },

  description: {
    type: String,
    required: true,
    maxlength: 300,
  },

  category: {
    type: String,
    enum: ['streak', 'milestone', 'social', 'creative', 'special'],
    required: true,
    index: true,
  },

  icon: {
    type: String,
    required: true,
  },

  color: {
    type: String,
    required: true,
  },

  rarity: {
    type: String,
    enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
    default: 'common',
    index: true,
  },

  requirements: {
    type: {
      type: String,
      required: true,
    },
    value: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
  },

  points: {
    type: Number,
    required: true,
    default: 10,
  },

  level: {
    type: Number,
    default: 1,
  },

  isHidden: {
    type: Boolean,
    default: false,
  },

  isActive: {
    type: Boolean,
    default: true,
  },

  unlockMessage: {
    type: String,
    required: true,
  },

  totalUnlocked: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

const UserBadgeSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },

  badgeId: {
    type: Schema.Types.ObjectId,
    ref: 'Badge',
    required: true,
  },

  unlockedAt: {
    type: Date,
    default: Date.now,
  },

  progress: {
    type: Number,
    default: 100,
  },

  isNew: {
    type: Boolean,
    default: true,
  },
});

// Compound index to prevent duplicate unlocks
UserBadgeSchema.index({ userId: 1, badgeId: 1 }, { unique: true });

export const Badge = mongoose.model<IBadge>('Badge', BadgeSchema);
export const UserBadge = mongoose.model<IUserBadge>('UserBadge', UserBadgeSchema);
