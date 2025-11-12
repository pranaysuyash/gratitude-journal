/**
 * Journal Entry Model
 * Complete journal entry schema with multimedia, AI analysis, and social features
 * © 2024 Gratitude Journal. All Rights Reserved.
 */

import mongoose, { Schema, Document } from 'mongoose';

export interface IMedia {
  type: 'image' | 'video' | 'audio' | 'drawing';
  url: string;
  thumbnail?: string;
  duration?: number;
  size: number;
  mimeType: string;
}

export interface ILocation {
  type: string;
  coordinates: [number, number];
  address?: string;
  placeName?: string;
}

export interface IJournalEntry extends Document {
  userId: mongoose.Types.ObjectId;

  // Content
  title?: string;
  content: string;
  gratitudeItems: string[];
  mood: 'amazing' | 'great' | 'good' | 'okay' | 'sad' | 'anxious' | 'angry';
  moodScore: number;

  // Multimedia
  media: IMedia[];
  voiceNote?: {
    url: string;
    duration: number;
    transcription?: string;
  };
  drawing?: {
    url: string;
    thumbnail: string;
  };

  // Metadata
  date: Date;
  timezone: string;
  weather?: {
    condition: string;
    temperature: number;
    icon: string;
  };
  location?: ILocation;

  // Music
  music?: {
    trackId: string;
    title: string;
    artist: string;
    albumArt?: string;
    spotifyUri?: string;
    appleMusicId?: string;
  };

  // AI Analysis
  aiAnalysis?: {
    sentiment: number;
    emotions: {
      joy: number;
      gratitude: number;
      hope: number;
      love: number;
      peace: number;
    };
    themes: string[];
    keywords: string[];
    suggestions: string[];
    insightGenerated: boolean;
  };

  // Organization
  tags: string[];
  categories: mongoose.Types.ObjectId[];
  collections: mongoose.Types.ObjectId[];
  isFavorite: boolean;
  isPinned: boolean;

  // Privacy
  visibility: 'private' | 'friends' | 'public' | 'family';
  isArchived: boolean;
  isInVault: boolean;

  // Social
  likes: mongoose.Types.ObjectId[];
  comments: {
    userId: mongoose.Types.ObjectId;
    content: string;
    createdAt: Date;
  }[];
  shares: number;

  // Wellness Integration
  healthData?: {
    steps: number;
    sleepHours: number;
    heartRate: number;
    mindfulMinutes: number;
  };

  // Prompts & Templates
  prompt?: string;
  templateId?: mongoose.Types.ObjectId;
  challengeId?: mongoose.Types.ObjectId;

  // Reminders & Future
  reminderDate?: Date;
  isTimeCapsule: boolean;
  timeCapsuleOpenDate?: Date;

  // Streak tracking
  streakDay: number;

  // Version history (for edits)
  editHistory: {
    content: string;
    editedAt: Date;
  }[];

  createdAt: Date;
  updatedAt: Date;
}

const MediaSchema = new Schema({
  type: {
    type: String,
    enum: ['image', 'video', 'audio', 'drawing'],
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  thumbnail: String,
  duration: Number,
  size: {
    type: Number,
    required: true,
  },
  mimeType: {
    type: String,
    required: true,
  },
}, { _id: false });

const LocationSchema = new Schema({
  type: {
    type: String,
    enum: ['Point'],
    default: 'Point',
  },
  coordinates: {
    type: [Number],
    required: true,
    validate: {
      validator: function(v: number[]) {
        return v.length === 2 && v[0] >= -180 && v[0] <= 180 && v[1] >= -90 && v[1] <= 90;
      },
      message: 'Invalid coordinates',
    },
  },
  address: String,
  placeName: String,
}, { _id: false });

const JournalEntrySchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },

  title: {
    type: String,
    maxlength: 200,
  },

  content: {
    type: String,
    required: true,
    maxlength: 10000,
  },

  gratitudeItems: [{
    type: String,
    maxlength: 500,
  }],

  mood: {
    type: String,
    enum: ['amazing', 'great', 'good', 'okay', 'sad', 'anxious', 'angry'],
    required: true,
  },

  moodScore: {
    type: Number,
    min: 1,
    max: 10,
    required: true,
  },

  media: [MediaSchema],

  voiceNote: {
    url: String,
    duration: Number,
    transcription: String,
  },

  drawing: {
    url: String,
    thumbnail: String,
  },

  date: {
    type: Date,
    required: true,
    index: true,
  },

  timezone: {
    type: String,
    default: 'UTC',
  },

  weather: {
    condition: String,
    temperature: Number,
    icon: String,
  },

  location: LocationSchema,

  music: {
    trackId: String,
    title: String,
    artist: String,
    albumArt: String,
    spotifyUri: String,
    appleMusicId: String,
  },

  aiAnalysis: {
    sentiment: {
      type: Number,
      min: 0,
      max: 1,
    },
    emotions: {
      joy: Number,
      gratitude: Number,
      hope: Number,
      love: Number,
      peace: Number,
    },
    themes: [String],
    keywords: [String],
    suggestions: [String],
    insightGenerated: {
      type: Boolean,
      default: false,
    },
  },

  tags: [{
    type: String,
    lowercase: true,
    trim: true,
  }],

  categories: [{
    type: Schema.Types.ObjectId,
    ref: 'Category',
  }],

  collections: [{
    type: Schema.Types.ObjectId,
    ref: 'Collection',
  }],

  isFavorite: {
    type: Boolean,
    default: false,
    index: true,
  },

  isPinned: {
    type: Boolean,
    default: false,
  },

  visibility: {
    type: String,
    enum: ['private', 'friends', 'public', 'family'],
    default: 'private',
    index: true,
  },

  isArchived: {
    type: Boolean,
    default: false,
    index: true,
  },

  isInVault: {
    type: Boolean,
    default: false,
  },

  likes: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],

  comments: [{
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],

  shares: {
    type: Number,
    default: 0,
  },

  healthData: {
    steps: Number,
    sleepHours: Number,
    heartRate: Number,
    mindfulMinutes: Number,
  },

  prompt: String,

  templateId: {
    type: Schema.Types.ObjectId,
    ref: 'Template',
  },

  challengeId: {
    type: Schema.Types.ObjectId,
    ref: 'Challenge',
  },

  reminderDate: Date,

  isTimeCapsule: {
    type: Boolean,
    default: false,
  },

  timeCapsuleOpenDate: Date,

  streakDay: {
    type: Number,
    default: 0,
  },

  editHistory: [{
    content: String,
    editedAt: Date,
  }],
}, {
  timestamps: true,
});

// Indexes for performance
JournalEntrySchema.index({ userId: 1, date: -1 });
JournalEntrySchema.index({ userId: 1, isFavorite: 1 });
JournalEntrySchema.index({ userId: 1, tags: 1 });
JournalEntrySchema.index({ userId: 1, 'aiAnalysis.sentiment': 1 });
JournalEntrySchema.index({ location: '2dsphere' });
JournalEntrySchema.index({ createdAt: -1 });
JournalEntrySchema.index({ visibility: 1, createdAt: -1 });

// Text search index
JournalEntrySchema.index({ content: 'text', title: 'text', tags: 'text' });

// Virtual for word count
JournalEntrySchema.virtual('wordCount').get(function() {
  return this.content.split(/\s+/).filter((word: string) => word.length > 0).length;
});

// Virtual for likes count
JournalEntrySchema.virtual('likesCount').get(function() {
  return this.likes.length;
});

// Virtual for comments count
JournalEntrySchema.virtual('commentsCount').get(function() {
  return this.comments.length;
});

// Ensure virtuals are included in JSON
JournalEntrySchema.set('toJSON', { virtuals: true });
JournalEntrySchema.set('toObject', { virtuals: true });

export default mongoose.model<IJournalEntry>('JournalEntry', JournalEntrySchema);
