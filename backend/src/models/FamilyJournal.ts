/**
 * Family Journal Model
 * Shared journals for families and groups
 * © 2024 Gratitude Journal. All Rights Reserved.
 */

import mongoose, { Schema, Document } from 'mongoose';

export interface IFamilyJournal extends Document {
  name: string;
  description: string;
  icon: string;
  color: string;
  coverImage?: string;

  createdBy: mongoose.Types.ObjectId;

  members: {
    userId: mongoose.Types.ObjectId;
    role: 'owner' | 'admin' | 'member';
    joinedAt: Date;
    nickname?: string;
    color?: string;
  }[];

  invitations: {
    email: string;
    invitedBy: mongoose.Types.ObjectId;
    invitedAt: Date;
    token: string;
    expiresAt: Date;
    status: 'pending' | 'accepted' | 'declined' | 'expired';
  }[];

  entries: mongoose.Types.ObjectId[];

  settings: {
    allowComments: boolean;
    allowReactions: boolean;
    moderationEnabled: boolean;
    entryApprovalRequired: boolean;
    visibleToChildren: boolean;
    allowMediaSharing: boolean;
    maxMembersLimit: number;
  };

  stats: {
    totalEntries: number;
    totalMembers: number;
    lastActivity: Date;
  };

  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const FamilyJournalSchema: Schema = new Schema({
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
    default: 'person.3.fill',
  },

  color: {
    type: String,
    default: '#34C759',
  },

  coverImage: String,

  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  members: [{
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      enum: ['owner', 'admin', 'member'],
      default: 'member',
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    nickname: String,
    color: String,
  }],

  invitations: [{
    email: {
      type: String,
      required: true,
      lowercase: true,
    },
    invitedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    invitedAt: {
      type: Date,
      default: Date.now,
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined', 'expired'],
      default: 'pending',
    },
  }],

  entries: [{
    type: Schema.Types.ObjectId,
    ref: 'JournalEntry',
  }],

  settings: {
    allowComments: {
      type: Boolean,
      default: true,
    },
    allowReactions: {
      type: Boolean,
      default: true,
    },
    moderationEnabled: {
      type: Boolean,
      default: false,
    },
    entryApprovalRequired: {
      type: Boolean,
      default: false,
    },
    visibleToChildren: {
      type: Boolean,
      default: true,
    },
    allowMediaSharing: {
      type: Boolean,
      default: true,
    },
    maxMembersLimit: {
      type: Number,
      default: 10,
    },
  },

  stats: {
    totalEntries: {
      type: Number,
      default: 0,
    },
    totalMembers: {
      type: Number,
      default: 1,
    },
    lastActivity: {
      type: Date,
      default: Date.now,
    },
  },

  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Indexes
FamilyJournalSchema.index({ 'members.userId': 1 });
FamilyJournalSchema.index({ createdBy: 1 });
FamilyJournalSchema.index({ 'invitations.email': 1 });
FamilyJournalSchema.index({ 'invitations.token': 1 });

export default mongoose.model<IFamilyJournal>('FamilyJournal', FamilyJournalSchema);
