/**
 * Analytics Routes
 * User statistics and insights
 * © 2024 Gratitude Journal. All Rights Reserved.
 */

const express = require('express');
const router = express.Router();
const Entry = require('../models/Entry');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { generateMonthlyInsights } = require('../services/aiService');

router.use(auth);

/**
 * Get overall stats
 */
router.get('/stats', async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const streakData = await Entry.getStreakData(req.user._id);

    // Get entries for this month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const entriesThisMonth = await Entry.countDocuments({
      userId: req.user._id,
      createdAt: { $gte: startOfMonth },
      isDraft: false
    });

    res.json({
      success: true,
      stats: {
        ...user.stats,
        ...streakData,
        entriesThisMonth,
        level: user.level,
        experience: user.experience,
        experienceToNextLevel: user.experienceToNextLevel
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * Get mood trends
 */
router.get('/mood-trends', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const entries = await Entry.find({
      userId: req.user._id,
      createdAt: { $gte: startDate },
      isDraft: false
    })
      .select('mood createdAt')
      .sort({ createdAt: 1 });

    // Group by mood
    const moodCounts = {};
    entries.forEach(entry => {
      moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
    });

    res.json({
      success: true,
      trends: entries.map(e => ({
        date: e.createdAt,
        mood: e.mood
      })),
      summary: moodCounts
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * Get monthly insights
 */
router.get('/insights/monthly', async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const entries = await Entry.find({
      userId: req.user._id,
      createdAt: { $gte: startOfMonth },
      isDraft: false
    }).select('content');

    const insights = await generateMonthlyInsights(entries);

    res.json({
      success: true,
      insights,
      entryCount: entries.length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
