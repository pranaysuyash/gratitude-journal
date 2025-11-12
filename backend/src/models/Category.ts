/**
 * Category Model
 * Categorize entries by themes and topics
 * © 2024 Gratitude Journal. All Rights Reserved.
 */

import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
  userId?: mongoose.Types.ObjectId;

  name: string;
  description: string;
  icon: string;
  color: string;

  isDefault: boolean;
  isSystem: boolean;

  entryCount: number;

  parentCategory?: mongoose.Types.ObjectId;
  subCategories: mongoose.Types.ObjectId[];

  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    index: true,
  },

  name: {
    type: String,
    required: true,
    maxlength: 50,
  },

  description: {
    type: String,
    maxlength: 200,
  },

  icon: {
    type: String,
    default: 'tag.fill',
  },

  color: {
    type: String,
    default: '#007AFF',
  },

  isDefault: {
    type: Boolean,
    default: false,
  },

  isSystem: {
    type: Boolean,
    default: false,
  },

  entryCount: {
    type: Number,
    default: 0,
  },

  parentCategory: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
  },

  subCategories: [{
    type: Schema.Types.ObjectId,
    ref: 'Category',
  }],
}, {
  timestamps: true,
});

// Compound index for user categories
CategorySchema.index({ userId: 1, name: 1 }, { unique: true, sparse: true });

// Index for system categories
CategorySchema.index({ isSystem: 1, name: 1 });

export default mongoose.model<ICategory>('Category', CategorySchema);
