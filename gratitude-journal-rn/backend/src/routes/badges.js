/**
 * Badges Routes
 * Achievement system
 * © 2024 Gratitude Journal. All Rights Reserved.
 */

const express = require('express');
const router = express.Router();
const Badge = require('../models/Badge');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

router.use(auth);

// Get all badges
router.get('/', async (req, res) => {
  try {
    const badges = await Badge.find({ isActive: true });
    const userBadges = req.user.badges.map(b => b.toString());

    const badgesWithStatus = badges.map(badge => ({
      ...badge.toObject(),
      unlocked: userBadges.includes(badge._id.toString())
    }));

    res.json({
      success: true,
      badges: badgesWithStatus
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Unlock badge (internal use)
router.post('/:id/unlock', async (req, res) => {
  try {
    const badge = await Badge.findById(req.params.id);

    if (!badge) {
      return res.status(404).json({ success: false, message: 'Badge not found' });
    }

    await req.user.unlockBadge(badge._id);
    await req.user.addExperience(badge.points);

    res.json({
      success: true,
      message: 'Badge unlocked!',
      badge
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
