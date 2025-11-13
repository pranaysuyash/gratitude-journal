/**
 * Goal Model
 * User goals and milestones
 * © 2024 Gratitude Journal. All Rights Reserved.
 */

const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 100
  },
  description: {
    type: String,
    maxlength: 500
  },
  type: {
    type: String,
    enum: ['streak', 'entries', 'words', 'gratitude_items', 'friends', 'badges', 'custom'],
    required: true
  },
  targetValue: {
    type: Number,
    required: true,
    min: 1
  },
  currentValue: {
    type: Number,
    default: 0,
    min: 0
  },
  unit: {
    type: String,
    default: 'days'
  },
  deadline: Date,
  startDate: {
    type: Date,
    default: Date.now
  },
  completedAt: Date,
  status: {
    type: String,
    enum: ['active', 'completed', 'failed', 'paused'],
    default: 'active'
  },
  category: {
    type: String,
    enum: ['personal', 'social', 'wellness', 'creative', 'mindfulness']
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  milestones: [{
    value: Number,
    label: String,
    reached: {
      type: Boolean,
      default: false
    },
    reachedAt: Date
  }],
  reward: {
    type: String,
    enum: ['badge', 'points', 'nft', 'premium_feature'],
    badgeId: mongoose.Schema.Types.ObjectId,
    points: Number,
    nftId: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true }
});

// Indexes
goalSchema.index({ userId: 1, status: 1 });
goalSchema.index({ userId: 1, deadline: 1 });

// Virtuals
goalSchema.virtual('progress').get(function() {
  return Math.min((this.currentValue / this.targetValue) * 100, 100);
});

goalSchema.virtual('isCompleted').get(function() {
  return this.currentValue >= this.targetValue;
});

goalSchema.virtual('daysRemaining').get(function() {
  if (!this.deadline) return null;
  const now = new Date();
  const diff = this.deadline - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

// Methods
goalSchema.methods.updateProgress = async function(value) {
  this.currentValue = value;

  // Check milestones
  for (const milestone of this.milestones) {
    if (!milestone.reached && this.currentValue >= milestone.value) {
      milestone.reached = true;
      milestone.reachedAt = new Date();
    }
  }

  // Check completion
  if (this.currentValue >= this.targetValue && this.status !== 'completed') {
    this.status = 'completed';
    this.completedAt = new Date();
  }

  await this.save();
  return this;
};

goalSchema.methods.incrementProgress = async function(amount = 1) {
  return this.updateProgress(this.currentValue + amount);
};

module.exports = mongoose.model('Goal', goalSchema);
