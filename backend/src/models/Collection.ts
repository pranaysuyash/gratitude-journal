/**
 * Collection Model
 * Organize entries into themed collections
 * © 2024 Gratitude Journal. All Rights Reserved.
 */

import mongoose, { Schema, Document } from 'mongoose';

export interface ICollection extends Document {
  userId: mongoose.Types.ObjectId;

  name: string;
  description: string;
  icon: string;
  color: string;

  entries: mongoose.Types.ObjectId[];

  isDefault: boolean;
  isFavorite: boolean;
  isPublic: boolean;

  sortOrder: 'date' | 'title' | 'mood' | 'custom';
  viewStyle: 'grid' | 'list' | 'timeline';

  coverImage?: string;

  stats: {
    totalEntries: number;
    lastAddedAt?: Date;
  };

  createdAt: Date;
  updatedAt: Date;
}

const CollectionSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },

  name: {
    type: String,
    required: true,
    maxlength: 100,
  },

  description: {
    type: String,
    maxlength: 500,
  },

  icon: {
    type: String,
    default: 'folder.fill',
  },

  color: {
    type: String,
    default: '#007AFF',
  },

  entries: [{
    type: Schema.Types.ObjectId,
    ref: 'JournalEntry',
  }],

  isDefault: {
    type: Boolean,
    default: false,
  },

  isFavorite: {
    type: Boolean,
    default: false,
    index: true,
  },

  isPublic: {
    type: Boolean,
    default: false,
  },

  sortOrder: {
    type: String,
    enum: ['date', 'title', 'mood', 'custom'],
    default: 'date',
  },

  viewStyle: {
    type: String,
    enum: ['grid', 'list', 'timeline'],
    default: 'list',
  },

  coverImage: String,

  stats: {
    totalEntries: {
      type: Number,
      default: 0,
    },
    lastAddedAt: Date,
  },
}, {
  timestamps: true,
});

// Indexes
CollectionSchema.index({ userId: 1, name: 1 });
CollectionSchema.index({ userId: 1, isFavorite: 1 });

export default mongoose.model<ICollection>('Collection', CollectionSchema);
