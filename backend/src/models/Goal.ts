/**
 * Gratitude Goal Model
 * Goals and milestones for gratitude practice
 * © 2024 Gratitude Journal. All Rights Reserved.
 */

import mongoose, { Schema, Document } from 'mongoose';

export interface IGoal extends Document {
  userId: mongoose.Types.ObjectId;

  title: string;
  description: string;
  type: 'streak' | 'entries' | 'words' | 'custom';

  target: number;
  current: number;
  unit: string;

  startDate: Date;
  endDate?: Date;
  deadline?: Date;

  frequency: 'daily' | 'weekly' | 'monthly' | 'once';
  reminderEnabled: boolean;
  reminderTime?: string;

  status: 'active' | 'completed' | 'paused' | 'cancelled';
  completedAt?: Date;

  milestones: {
    value: number;
    label: string;
    reached: boolean;
    reachedAt?: Date;
  }[];

  rewards: {
    badgeId?: mongoose.Types.ObjectId;
    points: number;
    message: string;
  };

  isPublic: boolean;
  category?: string;

  createdAt: Date;
  updatedAt: Date;
}

const GoalSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },

  title: {
    type: String,
    required: true,
    maxlength: 100,
  },

  description: {
    type: String,
    maxlength: 500,
  },

  type: {
    type: String,
    enum: ['streak', 'entries', 'words', 'custom'],
    required: true,
  },

  target: {
    type: Number,
    required: true,
    min: 1,
  },

  current: {
    type: Number,
    default: 0,
    min: 0,
  },

  unit: {
    type: String,
    default: 'days',
  },

  startDate: {
    type: Date,
    required: true,
  },

  endDate: Date,
  deadline: Date,

  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'once'],
    default: 'once',
  },

  reminderEnabled: {
    type: Boolean,
    default: false,
  },

  reminderTime: String,

  status: {
    type: String,
    enum: ['active', 'completed', 'paused', 'cancelled'],
    default: 'active',
    index: true,
  },

  completedAt: Date,

  milestones: [{
    value: {
      type: Number,
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
    reached: {
      type: Boolean,
      default: false,
    },
    reachedAt: Date,
  }],

  rewards: {
    badgeId: {
      type: Schema.Types.ObjectId,
      ref: 'Badge',
    },
    points: {
      type: Number,
      default: 0,
    },
    message: String,
  },

  isPublic: {
    type: Boolean,
    default: false,
  },

  category: String,
}, {
  timestamps: true,
});

// Indexes
GoalSchema.index({ userId: 1, status: 1 });
GoalSchema.index({ userId: 1, deadline: 1 });

// Virtual for progress percentage
GoalSchema.virtual('progress').get(function() {
  return Math.min((this.current / this.target) * 100, 100);
});

// Virtual for is completed
GoalSchema.virtual('isCompleted').get(function() {
  return this.current >= this.target;
});

GoalSchema.set('toJSON', { virtuals: true });
GoalSchema.set('toObject', { virtuals: true });

export default mongoose.model<IGoal>('Goal', GoalSchema);
