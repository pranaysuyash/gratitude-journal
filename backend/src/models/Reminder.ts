/**
 * Reminder Model
 * Notifications and reminders for journaling
 * © 2024 Gratitude Journal. All Rights Reserved.
 */

import mongoose, { Schema, Document } from 'mongoose';

export interface IReminder extends Document {
  userId: mongoose.Types.ObjectId;

  title: string;
  message: string;
  type: 'daily' | 'weekly' | 'monthly' | 'custom' | 'prompt';

  time: string; // HH:mm format
  timezone: string;

  daysOfWeek: number[]; // 0-6 (Sunday-Saturday)
  daysOfMonth: number[]; // 1-31

  isEnabled: boolean;
  isRecurring: boolean;

  startDate: Date;
  endDate?: Date;

  prompt?: string;
  promptCategory?: string;

  sound: string;
  vibrate: boolean;

  lastTriggered?: Date;
  nextTrigger?: Date;

  stats: {
    totalSent: number;
    totalOpened: number;
    totalCompleted: number;
  };

  createdAt: Date;
  updatedAt: Date;
}

const ReminderSchema: Schema = new Schema({
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

  message: {
    type: String,
    maxlength: 300,
  },

  type: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'custom', 'prompt'],
    default: 'daily',
  },

  time: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
  },

  timezone: {
    type: String,
    default: 'UTC',
  },

  daysOfWeek: [{
    type: Number,
    min: 0,
    max: 6,
  }],

  daysOfMonth: [{
    type: Number,
    min: 1,
    max: 31,
  }],

  isEnabled: {
    type: Boolean,
    default: true,
    index: true,
  },

  isRecurring: {
    type: Boolean,
    default: true,
  },

  startDate: {
    type: Date,
    required: true,
  },

  endDate: Date,

  prompt: String,
  promptCategory: String,

  sound: {
    type: String,
    default: 'default',
  },

  vibrate: {
    type: Boolean,
    default: true,
  },

  lastTriggered: Date,
  nextTrigger: Date,

  stats: {
    totalSent: {
      type: Number,
      default: 0,
    },
    totalOpened: {
      type: Number,
      default: 0,
    },
    totalCompleted: {
      type: Number,
      default: 0,
    },
  },
}, {
  timestamps: true,
});

// Indexes
ReminderSchema.index({ userId: 1, isEnabled: 1 });
ReminderSchema.index({ nextTrigger: 1, isEnabled: 1 });

export default mongoose.model<IReminder>('Reminder', ReminderSchema);
