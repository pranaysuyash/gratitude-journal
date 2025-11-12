/**
 * Social Routes
 * Friends, family journals, and community features
 * © 2024 Gratitude Journal. All Rights Reserved.
 */

import express from 'express';
import { User, FamilyJournal, JournalEntry } from '../models';
import { sendEmail } from '../utils/email';
import crypto from 'crypto';
import logger from '../utils/logger';

const router = express.Router();

// Get friends
router.get('/friends', async (req: any, res) => {
  try {
    const user = await User.findById(req.user._id).populate('friends', 'username displayName avatar stats.level');
    res.json({ friends: user?.friends || [] });
  } catch (error: any) {
    logger.error('Get friends error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Send friend request
router.post('/friends/:userId/request', async (req: any, res) => {
  try {
    const targetUser = await User.findById(req.params.userId);
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!targetUser.privacySettings.allowFriendRequests) {
      return res.status(403).json({ error: 'User is not accepting friend requests' });
    }

    // Check if already friends
    if (targetUser.friends.includes(req.user._id)) {
      return res.status(409).json({ error: 'Already friends' });
    }

    // Check if request already sent
    const existing = targetUser.friendRequests.find(
      fr => fr.from.toString() === req.user._id.toString()
    );

    if (existing) {
      return res.status(409).json({ error: 'Friend request already sent' });
    }

    targetUser.friendRequests.push({
      from: req.user._id,
      createdAt: new Date(),
    });

    await targetUser.save();

    res.json({ message: 'Friend request sent' });
  } catch (error: any) {
    logger.error('Send friend request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Accept/reject friend request
router.post('/friends/requests/:requestUserId/:action', async (req: any, res) => {
  try {
    const action = req.params.action; // 'accept' or 'reject'

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const requestIndex = user.friendRequests.findIndex(
      fr => fr.from.toString() === req.params.requestUserId
    );

    if (requestIndex === -1) {
      return res.status(404).json({ error: 'Friend request not found' });
    }

    user.friendRequests.splice(requestIndex, 1);

    if (action === 'accept') {
      user.friends.push(req.params.requestUserId);

      const requester = await User.findById(req.params.requestUserId);
      if (requester) {
        requester.friends.push(req.user._id);
        await requester.save();
      }
    }

    await user.save();

    res.json({ message: action === 'accept' ? 'Friend request accepted' : 'Friend request rejected' });
  } catch (error: any) {
    logger.error('Handle friend request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get family journals
router.get('/family-journals', async (req: any, res) => {
  try {
    const journals = await FamilyJournal.find({
      'members.userId': req.user._id,
      isActive: true,
    }).populate('members.userId', 'username displayName avatar');

    res.json({ journals });
  } catch (error: any) {
    logger.error('Get family journals error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create family journal
router.post('/family-journals', async (req: any, res) => {
  try {
    const journal = await FamilyJournal.create({
      ...req.body,
      createdBy: req.user._id,
      members: [{
        userId: req.user._id,
        role: 'owner',
        joinedAt: new Date(),
      }],
    });

    res.status(201).json({ message: 'Family journal created', journal });
  } catch (error: any) {
    logger.error('Create family journal error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Invite to family journal
router.post('/family-journals/:id/invite', async (req: any, res) => {
  try {
    const { email } = req.body;

    const journal = await FamilyJournal.findOne({
      _id: req.params.id,
      'members.userId': req.user._id,
      'members.role': { $in: ['owner', 'admin'] },
    });

    if (!journal) {
      return res.status(404).json({ error: 'Family journal not found or insufficient permissions' });
    }

    // Generate invitation token
    const token = crypto.randomBytes(32).toString('hex');

    journal.invitations.push({
      email,
      invitedBy: req.user._id,
      invitedAt: new Date(),
      token,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      status: 'pending',
    });

    await journal.save();

    // Send invitation email
    try {
      await sendEmail({
        to: email,
        subject: `Invitation to join ${journal.name}`,
        html: `
          <h1>You've been invited to join a family journal!</h1>
          <p>${req.user.displayName} has invited you to join "${journal.name}".</p>
          <a href="${process.env.FRONTEND_URL}/family-journals/accept?token=${token}">Accept Invitation</a>
        `,
      });
    } catch (emailError) {
      logger.error('Failed to send invitation email:', emailError);
    }

    res.json({ message: 'Invitation sent' });
  } catch (error: any) {
    logger.error('Invite to family journal error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get public entries feed
router.get('/feed', async (req: any, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    // Get entries from friends or public
    const user = await User.findById(req.user._id);
    const friendIds = user?.friends || [];

    const entries = await JournalEntry.find({
      $or: [
        { visibility: 'public' },
        { visibility: 'friends', userId: { $in: friendIds } },
      ],
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'username displayName avatar');

    const total = await JournalEntry.countDocuments({
      $or: [
        { visibility: 'public' },
        { visibility: 'friends', userId: { $in: friendIds } },
      ],
    });

    res.json({
      entries,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    logger.error('Get feed error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
