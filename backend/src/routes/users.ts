/**
 * Users Routes
 * User profile, settings, and social features
 * © 2024 Gratitude Journal. All Rights Reserved.
 */

import express from 'express';
import { body, validationResult } from 'express-validator';
import { User } from '../models';
import { upload, uploadMedia } from '../services/storage';
import logger from '../utils/logger';

const router = express.Router();

/**
 * @swagger
 * /api/v1/users/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.get('/me', async (req: any, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('stats.badges', 'name icon color rarity')
      .populate('familyJournalId', 'name members')
      .populate('friends', 'username displayName avatar');

    res.json(user);
  } catch (error: any) {
    logger.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/v1/users/me:
 *   put:
 *     summary: Update user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.put('/me', [
  body('displayName').optional().trim().isLength({ min: 1, max: 50 }),
  body('bio').optional().isLength({ max: 500 }),
  body('username').optional().isLength({ min: 3, max: 30 }).matches(/^[a-zA-Z0-9_]+$/),
], async (req: any, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const allowedUpdates = ['displayName', 'bio', 'username'];
    const updates: any = {};

    for (const field of allowedUpdates) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    // Check username uniqueness
    if (updates.username) {
      const existing = await User.findOne({
        username: updates.username,
        _id: { $ne: req.user._id }
      });
      if (existing) {
        return res.status(409).json({ error: 'Username already taken' });
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    );

    res.json({ message: 'Profile updated', user });
  } catch (error: any) {
    logger.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/v1/users/me/avatar:
 *   post:
 *     summary: Upload avatar
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.post('/me/avatar', upload.single('avatar'), async (req: any, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { url } = await uploadMedia(req.file);

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: url },
      { new: true }
    );

    res.json({ message: 'Avatar uploaded', avatar: url });
  } catch (error: any) {
    logger.error('Upload avatar error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/v1/users/me/preferences:
 *   put:
 *     summary: Update user preferences
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.put('/me/preferences', async (req: any, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    Object.assign(user.preferences, req.body);
    await user.save();

    res.json({ message: 'Preferences updated', preferences: user.preferences });
  } catch (error: any) {
    logger.error('Update preferences error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/v1/users/me/privacy:
 *   put:
 *     summary: Update privacy settings
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.put('/me/privacy', async (req: any, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    Object.assign(user.privacySettings, req.body);
    await user.save();

    res.json({ message: 'Privacy settings updated', privacySettings: user.privacySettings });
  } catch (error: any) {
    logger.error('Update privacy error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/v1/users/me/notifications:
 *   put:
 *     summary: Update notification settings
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.put('/me/notifications', async (req: any, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    Object.assign(user.notificationSettings, req.body);
    await user.save();

    res.json({ message: 'Notification settings updated', notificationSettings: user.notificationSettings });
  } catch (error: any) {
    logger.error('Update notifications error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/v1/users/search:
 *   get:
 *     summary: Search users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.get('/search', async (req: any, res) => {
  try {
    const query = req.query.q as string;
    if (!query) {
      return res.status(400).json({ error: 'Query parameter required' });
    }

    const users = await User.find({
      $or: [
        { username: new RegExp(query, 'i') },
        { displayName: new RegExp(query, 'i') },
      ],
      'privacySettings.profileVisibility': { $in: ['public', 'friends'] },
    })
      .select('username displayName avatar bio stats.level')
      .limit(20);

    res.json({ users });
  } catch (error: any) {
    logger.error('Search users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/v1/users/{id}:
 *   get:
 *     summary: Get user profile by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', async (req: any, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('username displayName avatar bio stats createdAt');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check privacy settings
    if (user.privacySettings.profileVisibility === 'private') {
      return res.status(403).json({ error: 'Profile is private' });
    }

    res.json(user);
  } catch (error: any) {
    logger.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/v1/users/me:
 *   delete:
 *     summary: Delete user account
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/me', async (req: any, res) => {
  try {
    // TODO: Delete all user data (entries, goals, etc.)
    await User.findByIdAndDelete(req.user._id);

    res.json({ message: 'Account deleted successfully' });
  } catch (error: any) {
    logger.error('Delete account error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
