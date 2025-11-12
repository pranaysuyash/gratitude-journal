/**
 * Journal Entry Model
 * © 2024 Gratitude Journal. All Rights Reserved.
 */

const mongoose = require('mongoose');

const entrySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  content: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 10000
  },
  mood: {
    type: String,
    enum: ['grateful', 'joyful', 'peaceful', 'hopeful', 'content', 'reflective', 'calm', 'inspired', 'blessed', 'thankful'],
    required: true
  },
  emotions: [{
    type: String
  }],
  tags: [{
    type: String,
    maxlength: 50
  }],
  categories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  peopleMentioned: [{
    type: String,
    maxlength: 100
  }],
  photoUrls: [{
    type: String
  }],
  voiceNoteUrl: String,
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere'
    },
    name: String,
    placeName: String
  },
  weather: {
    condition: String,
    temperature: Number,
    emoji: String
  },
  music: {
    trackId: String,
    trackTitle: String,
    artist: String,
    artworkUrl: String
  },
  aiAnalysis: {
    sentimentScore: {
      type: Number,
      min: 0,
      max: 1
    },
    summary: String,
    keyThemes: [String],
    suggestedTags: [String]
  },
  type: {
    type: String,
    enum: ['regular', 'letter', 'dream', 'timeCapsule'],
    default: 'regular'
  },
  letterRecipient: String,
  timeCapsuleUnlockDate: Date,
  isPrivate: {
    type: Boolean,
    default: false
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  isDraft: {
    type: Boolean,
    default: false
  },
  wordCount: Number,
  readingTime: Number, // in seconds
  shareableLink: String,
  likes: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  nftMinted: {
    type: Boolean,
    default: false
  },
  nftTokenId: String,
  nftContractAddress: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
entrySchema.index({ userId: 1, createdAt: -1 });
entrySchema.index({ userId: 1, isPinned: -1, createdAt: -1 });
entrySchema.index({ userId: 1, mood: 1 });
entrySchema.index({ tags: 1 });
entrySchema.index({ createdAt: -1 });
entrySchema.index({ 'location.coordinates': '2dsphere' });

// Text search index
entrySchema.index({ content: 'text', tags: 'text' });

// Virtual for formatted date
entrySchema.virtual('formattedDate').get(function() {
  return this.createdAt.toLocaleDateString();
});

// Pre-save middleware
entrySchema.pre('save', function(next) {
  // Calculate word count
  if (this.isModified('content')) {
    this.wordCount = this.content.split(/\s+/).length;
    this.readingTime = Math.ceil(this.wordCount / 200 * 60); // 200 words per minute
  }
  next();
});

// Instance methods
entrySchema.methods.incrementViews = async function() {
  this.views += 1;
  return this.save();
};

entrySchema.methods.addLike = async function() {
  this.likes += 1;
  return this.save();
};

// Static methods
entrySchema.statics.getEntriesByDateRange = function(userId, startDate, endDate) {
  return this.find({
    userId,
    createdAt: { $gte: startDate, $lte: endDate },
    isDraft: false
  }).sort({ createdAt: -1 });
};

entrySchema.statics.getStreakData = async function(userId) {
  const entries = await this.find({ userId, isDraft: false })
    .sort({ createdAt: -1 })
    .select('createdAt');

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  let lastDate = null;

  for (const entry of entries) {
    const entryDate = new Date(entry.createdAt).toDateString();

    if (!lastDate) {
      tempStreak = 1;
      const today = new Date().toDateString();
      if (entryDate === today || entryDate === new Date(Date.now() - 86400000).toDateString()) {
        currentStreak = 1;
      }
    } else {
      const dayDiff = Math.floor((new Date(lastDate) - new Date(entryDate)) / 86400000);

      if (dayDiff === 1) {
        tempStreak += 1;
        if (currentStreak > 0) currentStreak += 1;
      } else if (dayDiff > 1) {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
        currentStreak = 0;
      }
    }

    lastDate = entryDate;
  }

  longestStreak = Math.max(longestStreak, tempStreak);

  return {
    currentStreak,
    longestStreak,
    totalEntries: entries.length
  };
};

module.exports = mongoose.model('Entry', entrySchema);
