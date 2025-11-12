/**
 * Template Model
 * Writing templates for guided journaling
 * © 2024 Gratitude Journal. All Rights Reserved.
 */

import mongoose, { Schema, Document } from 'mongoose';

export interface ITemplate extends Document {
  userId?: mongoose.Types.ObjectId;

  name: string;
  description: string;
  category: string;

  structure: {
    sections: {
      title: string;
      prompt: string;
      placeholder?: string;
      required: boolean;
      type: 'text' | 'list' | 'mood' | 'rating' | 'media';
      order: number;
    }[];
  };

  icon: string;
  color: string;

  isSystem: boolean;
  isPublic: boolean;
  isPremium: boolean;

  tags: string[];

  usageCount: number;
  rating: number;
  ratingCount: number;

  createdAt: Date;
  updatedAt: Date;
}

const TemplateSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    index: true,
  },

  name: {
    type: String,
    required: true,
    maxlength: 100,
  },

  description: {
    type: String,
    required: true,
    maxlength: 500,
  },

  category: {
    type: String,
    required: true,
    index: true,
  },

  structure: {
    sections: [{
      title: {
        type: String,
        required: true,
      },
      prompt: {
        type: String,
        required: true,
      },
      placeholder: String,
      required: {
        type: Boolean,
        default: false,
      },
      type: {
        type: String,
        enum: ['text', 'list', 'mood', 'rating', 'media'],
        default: 'text',
      },
      order: {
        type: Number,
        required: true,
      },
    }],
  },

  icon: {
    type: String,
    default: 'doc.text.fill',
  },

  color: {
    type: String,
    default: '#007AFF',
  },

  isSystem: {
    type: Boolean,
    default: false,
    index: true,
  },

  isPublic: {
    type: Boolean,
    default: false,
  },

  isPremium: {
    type: Boolean,
    default: false,
  },

  tags: [{
    type: String,
    lowercase: true,
  }],

  usageCount: {
    type: Number,
    default: 0,
  },

  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },

  ratingCount: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Indexes
TemplateSchema.index({ category: 1, isSystem: 1 });
TemplateSchema.index({ isPublic: 1, rating: -1 });
TemplateSchema.index({ tags: 1 });

export default mongoose.model<ITemplate>('Template', TemplateSchema);
