/**
 * Badges Routes
 * Achievement badges and gamification
 * © 2024 Gratitude Journal. All Rights Reserved.
 */

import express from 'express';
import { Badge, UserBadge, User } from '../models';
import logger from '../utils/logger';

const router = express.Router();

// Get all available badges
router.get('/', async (req: any, res) => {
  try {
    const badges = await Badge.find({ isActive: true }).sort({ level: 1, points: 1 });

    // Get user's unlocked badges
    const userBadges = await UserBadge.find({ userId: req.user._id });
    const unlockedIds = userBadges.map(ub => ub.badgeId.toString());

    const badgesWithStatus = badges.map(badge => ({
      ...badge.toObject(),
      unlocked: unlockedIds.includes(badge._id.toString()),
    }));

    res.json({ badges: badgesWithStatus });
  } catch (error: any) {
    logger.error('Get badges error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's unlocked badges
router.get('/me', async (req: any, res) => {
  try {
    const userBadges = await UserBadge.find({ userId: req.user._id })
      .populate('badgeId')
      .sort({ unlockedAt: -1 });

    res.json({ badges: userBadges });
  } catch (error: any) {
    logger.error('Get user badges error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Unlock a badge (internal use)
router.post('/:badgeId/unlock', async (req: any, res) => {
  try {
    const badge = await Badge.findById(req.params.badgeId);
    if (!badge) {
      return res.status(404).json({ error: 'Badge not found' });
    }

    // Check if already unlocked
    const existing = await UserBadge.findOne({
      userId: req.user._id,
      badgeId: badge._id,
    });

    if (existing) {
      return res.status(409).json({ error: 'Badge already unlocked' });
    }

    // Create user badge
    const userBadge = await UserBadge.create({
      userId: req.user._id,
      badgeId: badge._id,
    });

    // Update user stats
    const user = await User.findById(req.user._id);
    if (user) {
      user.stats.badges.push(badge._id);
      user.stats.experience += badge.points;

      // Level up calculation
      const newLevel = Math.floor(user.stats.experience / 100) + 1;
      if (newLevel > user.stats.level) {
        user.stats.level = newLevel;
      }

      await user.save();
    }

    // Update badge stats
    badge.totalUnlocked += 1;
    await badge.save();

    res.status(201).json({
      message: 'Badge unlocked!',
      badge: userBadge,
      unlockMessage: badge.unlockMessage,
    });
  } catch (error: any) {
    logger.error('Unlock badge error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mark badge as seen
router.patch('/:badgeId/seen', async (req: any, res) => {
  try {
    const userBadge = await UserBadge.findOneAndUpdate(
      { userId: req.user._id, badgeId: req.params.badgeId },
      { isNew: false },
      { new: true }
    );

    if (!userBadge) {
      return res.status(404).json({ error: 'Badge not found' });
    }

    res.json({ message: 'Badge marked as seen' });
  } catch (error: any) {
    logger.error('Mark badge seen error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
