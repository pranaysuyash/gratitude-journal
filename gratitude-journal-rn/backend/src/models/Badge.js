/**
 * Badge Model
 * Achievements and badges for gamification
 * © 2024 Gratitude Journal. All Rights Reserved.
 */

const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['streak', 'entries', 'social', 'creative', 'special', 'seasonal'],
    required: true
  },
  rarity: {
    type: String,
    enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
    default: 'common'
  },
  points: {
    type: Number,
    default: 10,
    min: 0
  },
  requirements: {
    type: {
      type: String,
      required: true
    },
    value: Number,
    description: String
  },
  unlockMessage: {
    type: String,
    required: true
  },
  isHidden: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  totalUnlocked: {
    type: Number,
    default: 0
  },
  color: String,
  animationUrl: String
}, {
  timestamps: true
});

// Indexes
badgeSchema.index({ category: 1, rarity: 1 });
badgeSchema.index({ isActive: 1, isHidden: 1 });

module.exports = mongoose.model('Badge', badgeSchema);
