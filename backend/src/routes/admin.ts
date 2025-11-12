/**
 * Admin Routes
 * Administrative endpoints for managing the platform
 * © 2024 Gratitude Journal. All Rights Reserved.
 */

import express from 'express';
import { User, JournalEntry, Badge, Template, Challenge } from '../models';
import { requireAdmin } from '../middleware/auth';
import logger from '../utils/logger';

const router = express.Router();

// All admin routes require admin authentication
router.use(requireAdmin);

// Get platform statistics
router.get('/stats', async (req: any, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalEntries = await JournalEntry.countDocuments();
    const totalBadges = await Badge.countDocuments();

    const activeUsers = await User.countDocuments({
      lastLogin: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    });

    const premiumUsers = await User.countDocuments({
      'subscription.tier': { $in: ['premium', 'family'] },
      'subscription.status': 'active',
    });

    const entriesThisMonth = await JournalEntry.countDocuments({
      createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
    });

    res.json({
      users: {
        total: totalUsers,
        active: activeUsers,
        premium: premiumUsers,
      },
      entries: {
        total: totalEntries,
        thisMonth: entriesThisMonth,
      },
      badges: {
        total: totalBadges,
      },
    });
  } catch (error: any) {
    logger.error('Get admin stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all users (paginated)
router.get('/users', async (req: any, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    const users = await User.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-password');

    const total = await User.countDocuments();

    res.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    logger.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user details
router.get('/users/:id', async (req: any, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('stats.badges')
      .populate('familyJournalId');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const entries = await JournalEntry.find({ userId: user._id })
      .sort({ date: -1 })
      .limit(10);

    res.json({ user, recentEntries: entries });
  } catch (error: any) {
    logger.error('Get user details error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user subscription
router.patch('/users/:id/subscription', async (req: any, res) => {
  try {
    const { tier, status, expiresAt } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        'subscription.tier': tier,
        'subscription.status': status,
        'subscription.expiresAt': expiresAt,
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'Subscription updated', user });
  } catch (error: any) {
    logger.error('Update subscription error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create system badge
router.post('/badges', async (req: any, res) => {
  try {
    const badge = await Badge.create(req.body);
    res.status(201).json({ message: 'Badge created', badge });
  } catch (error: any) {
    logger.error('Create badge error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update badge
router.put('/badges/:id', async (req: any, res) => {
  try {
    const badge = await Badge.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!badge) {
      return res.status(404).json({ error: 'Badge not found' });
    }

    res.json({ message: 'Badge updated', badge });
  } catch (error: any) {
    logger.error('Update badge error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete badge
router.delete('/badges/:id', async (req: any, res) => {
  try {
    const badge = await Badge.findByIdAndDelete(req.params.id);

    if (!badge) {
      return res.status(404).json({ error: 'Badge not found' });
    }

    res.json({ message: 'Badge deleted' });
  } catch (error: any) {
    logger.error('Delete badge error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create system template
router.post('/templates', async (req: any, res) => {
  try {
    const template = await Template.create({
      ...req.body,
      isSystem: true,
    });

    res.status(201).json({ message: 'Template created', template });
  } catch (error: any) {
    logger.error('Create template error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create community challenge
router.post('/challenges', async (req: any, res) => {
  try {
    const challenge = await Challenge.create({
      ...req.body,
      type: 'community',
      createdBy: req.user._id,
    });

    res.status(201).json({ message: 'Challenge created', challenge });
  } catch (error: any) {
    logger.error('Create challenge error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get reported content
router.get('/reports', async (req: any, res) => {
  try {
    // TODO: Implement content reporting system
    res.status(501).json({ error: 'Content reporting coming soon' });
  } catch (error: any) {
    logger.error('Get reports error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Ban/suspend user
router.post('/users/:id/ban', async (req: any, res) => {
  try {
    const { reason, duration } = req.body;

    // TODO: Implement user suspension system
    logger.info(`User ${req.params.id} banned by ${req.user._id}. Reason: ${reason}`);

    res.status(501).json({ error: 'User ban system coming soon' });
  } catch (error: any) {
    logger.error('Ban user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Send announcement
router.post('/announcements', async (req: any, res) => {
  try {
    const { title, message, targetUsers } = req.body;

    // TODO: Implement announcement system
    logger.info(`Announcement created by ${req.user._id}: ${title}`);

    res.status(501).json({ error: 'Announcement system coming soon' });
  } catch (error: any) {
    logger.error('Send announcement error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
