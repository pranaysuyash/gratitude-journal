/**
 * Challenge Model
 * Writing challenges and group challenges
 * © 2024 Gratitude Journal. All Rights Reserved.
 */

import mongoose, { Schema, Document } from 'mongoose';

export interface IChallenge extends Document {
  title: string;
  description: string;
  type: 'personal' | 'group' | 'community';

  category: string;
  difficulty: 'easy' | 'medium' | 'hard';

  duration: number; // in days
  startDate: Date;
  endDate: Date;

  requirements: {
    entriesPerDay?: number;
    totalEntries?: number;
    minWords?: number;
    includeMood?: boolean;
    includeMedia?: boolean;
    specificPrompts?: string[];
  };

  prompts: {
    day: number;
    prompt: string;
    category?: string;
  }[];

  rewards: {
    badge?: mongoose.Types.ObjectId;
    points: number;
    title?: string;
  };

  participants: {
    userId: mongoose.Types.ObjectId;
    joinedAt: Date;
    progress: number;
    completed: boolean;
    completedAt?: Date;
  }[];

  createdBy?: mongoose.Types.ObjectId;

  isActive: boolean;
  isPublic: boolean;
  isPremium: boolean;

  stats: {
    totalParticipants: number;
    totalCompleted: number;
    averageCompletion: number;
  };

  icon: string;
  color: string;
  coverImage?: string;

  createdAt: Date;
  updatedAt: Date;
}

const ChallengeSchema: Schema = new Schema({
  title: {
    type: String,
    required: true,
    maxlength: 100,
  },

  description: {
    type: String,
    required: true,
    maxlength: 1000,
  },

  type: {
    type: String,
    enum: ['personal', 'group', 'community'],
    default: 'personal',
    index: true,
  },

  category: {
    type: String,
    required: true,
    index: true,
  },

  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium',
  },

  duration: {
    type: Number,
    required: true,
    min: 1,
  },

  startDate: {
    type: Date,
    required: true,
  },

  endDate: {
    type: Date,
    required: true,
  },

  requirements: {
    entriesPerDay: Number,
    totalEntries: Number,
    minWords: Number,
    includeMood: Boolean,
    includeMedia: Boolean,
    specificPrompts: [String],
  },

  prompts: [{
    day: {
      type: Number,
      required: true,
    },
    prompt: {
      type: String,
      required: true,
    },
    category: String,
  }],

  rewards: {
    badge: {
      type: Schema.Types.ObjectId,
      ref: 'Badge',
    },
    points: {
      type: Number,
      default: 0,
    },
    title: String,
  },

  participants: [{
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    completedAt: Date,
  }],

  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },

  isActive: {
    type: Boolean,
    default: true,
    index: true,
  },

  isPublic: {
    type: Boolean,
    default: true,
  },

  isPremium: {
    type: Boolean,
    default: false,
  },

  stats: {
    totalParticipants: {
      type: Number,
      default: 0,
    },
    totalCompleted: {
      type: Number,
      default: 0,
    },
    averageCompletion: {
      type: Number,
      default: 0,
    },
  },

  icon: {
    type: String,
    default: 'trophy.fill',
  },

  color: {
    type: String,
    default: '#FF9500',
  },

  coverImage: String,
}, {
  timestamps: true,
});

// Indexes
ChallengeSchema.index({ type: 1, isActive: 1 });
ChallengeSchema.index({ category: 1, isActive: 1 });
ChallengeSchema.index({ startDate: 1, endDate: 1 });
ChallengeSchema.index({ 'participants.userId': 1 });

export default mongoose.model<IChallenge>('Challenge', ChallengeSchema);
