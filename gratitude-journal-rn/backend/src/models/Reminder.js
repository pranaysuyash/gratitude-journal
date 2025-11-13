/**
 * Reminder Model
 * User reminders and notifications
 * © 2024 Gratitude Journal. All Rights Reserved.
 */

const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
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
  message: String,
  time: {
    type: String, // HH:MM format
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
  },
  timezone: {
    type: String,
    default: 'UTC'
  },
  daysOfWeek: [{
    type: Number,
    min: 0,
    max: 6
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isRecurring: {
    type: Boolean,
    default: true
  },
  soundEnabled: {
    type: Boolean,
    default: true
  },
  vibrationEnabled: {
    type: Boolean,
    default: true
  },
  promptId: mongoose.Schema.Types.ObjectId,
  lastTriggered: Date,
  triggerCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes
reminderSchema.index({ userId: 1, isActive: 1 });
reminderSchema.index({ time: 1, isActive: 1 });

module.exports = mongoose.model('Reminder', reminderSchema);
