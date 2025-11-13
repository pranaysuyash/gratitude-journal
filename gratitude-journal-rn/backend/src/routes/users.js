/**
 * Users Routes
 * User profile and settings management
 * © 2024 Gratitude Journal. All Rights Reserved.
 */

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Entry = require('../models/Entry');
const { auth } = require('../middleware/auth');

// All routes require authentication
router.use(auth);

/**
 * @route   GET /api/users/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('badges', 'name icon color rarity')
      .select('-password');

    res.json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @route   PUT /api/users/me
 * @desc    Update user profile
 * @access  Private
 */
router.put('/me', async (req, res) => {
  try {
    const allowedUpdates = ['displayName', 'bio', 'avatar', 'coverPhoto'];
    const updates = {};

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @route   PUT /api/users/preferences
 * @desc    Update user preferences
 * @access  Private
 */
router.put('/preferences', async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    Object.assign(user.preferences, req.body);
    await user.save();

    res.json({
      success: true,
      preferences: user.preferences
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @route   GET /api/users/:id
 * @desc    Get user profile by ID
 * @access  Private
 */
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('username displayName avatar bio stats level badges createdAt')
      .populate('badges', 'name icon color rarity');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check privacy settings
    if (user.preferences.privacyLevel === 'private' &&
        user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'This profile is private'
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @route   GET /api/users/leaderboard
 * @desc    Get leaderboard
 * @access  Private
 */
router.get('/leaderboard', async (req, res) => {
  try {
    const { type = 'streak', limit = 100 } = req.query;

    let sortField = 'stats.currentStreak';
    if (type === 'entries') sortField = 'stats.totalEntries';
    if (type === 'level') sortField = 'level';

    const leaders = await User.find({
      isActive: true,
      'preferences.privacyLevel': { $ne: 'private' }
    })
      .sort({ [sortField]: -1 })
      .limit(parseInt(limit))
      .select('username displayName avatar stats level');

    res.json({
      success: true,
      leaders,
      type
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
