/**
 * Entries Routes
 * Journal entries CRUD and features
 * © 2024 Gratitude Journal. All Rights Reserved.
 */

const express = require('express');
const router = express.Router();
const Entry = require('../models/Entry');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { analyzeWithAI } = require('../services/aiService');

// All routes require authentication
router.use(auth);

/**
 * @route   GET /api/entries
 * @desc    Get all entries for user (with filters)
 * @access  Private
 */
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      mood,
      tag,
      search,
      startDate,
      endDate,
      type
    } = req.query;

    // Build query
    const query = {
      userId: req.user._id,
      isDraft: false
    };

    if (mood) query.mood = mood;
    if (tag) query.tags = tag;
    if (type) query.type = type;

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    const entries = await Entry.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('categories', 'name icon color');

    const total = await Entry.countDocuments(query);

    res.json({
      success: true,
      entries,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get entries error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @route   GET /api/entries/:id
 * @desc    Get single entry
 * @access  Private
 */
router.get('/:id', async (req, res) => {
  try {
    const entry = await Entry.findOne({
      _id: req.params.id,
      userId: req.user._id
    }).populate('categories');

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Entry not found'
      });
    }

    // Increment views
    await entry.incrementViews();

    res.json({
      success: true,
      entry
    });
  } catch (error) {
    console.error('Get entry error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @route   POST /api/entries
 * @desc    Create new entry
 * @access  Private
 */
router.post('/', async (req, res) => {
  try {
    const {
      content,
      mood,
      tags,
      categories,
      photoUrls,
      location,
      weather,
      music,
      type,
      isDraft
    } = req.body;

    // Validate required fields
    if (!content || !mood) {
      return res.status(400).json({
        success: false,
        message: 'Content and mood are required'
      });
    }

    // Create entry
    const entry = await Entry.create({
      userId: req.user._id,
      content,
      mood,
      tags: tags || [],
      categories: categories || [],
      photoUrls: photoUrls || [],
      location,
      weather,
      music,
      type: type || 'regular',
      isDraft: isDraft || false
    });

    // AI Analysis (async, don't wait)
    if (!isDraft) {
      analyzeWithAI(entry._id, content).catch(err =>
        console.error('AI analysis error:', err)
      );

      // Update user stats
      const user = await User.findById(req.user._id);
      user.stats.totalEntries += 1;
      user.stats.totalWords += entry.wordCount;
      if (photoUrls && photoUrls.length > 0) {
        user.stats.totalPhotos += photoUrls.length;
      }

      // Add experience
      await user.addExperience(10);

      // Check and update streak
      const streakData = await Entry.getStreakData(req.user._id);
      user.stats.currentStreak = streakData.currentStreak;
      user.stats.longestStreak = streakData.longestStreak;

      await user.save();
    }

    res.status(201).json({
      success: true,
      message: 'Entry created successfully',
      entry
    });
  } catch (error) {
    console.error('Create entry error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

/**
 * @route   PUT /api/entries/:id
 * @desc    Update entry
 * @access  Private
 */
router.put('/:id', async (req, res) => {
  try {
    const entry = await Entry.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Entry not found'
      });
    }

    // Update fields
    const allowedUpdates = [
      'content',
      'mood',
      'tags',
      'categories',
      'photoUrls',
      'location',
      'weather',
      'music',
      'isDraft',
      'isPinned'
    ];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        entry[field] = req.body[field];
      }
    });

    await entry.save();

    // Re-run AI analysis if content changed
    if (req.body.content && !entry.isDraft) {
      analyzeWithAI(entry._id, entry.content).catch(err =>
        console.error('AI analysis error:', err)
      );
    }

    res.json({
      success: true,
      message: 'Entry updated successfully',
      entry
    });
  } catch (error) {
    console.error('Update entry error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @route   DELETE /api/entries/:id
 * @desc    Delete entry
 * @access  Private
 */
router.delete('/:id', async (req, res) => {
  try {
    const entry = await Entry.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Entry not found'
      });
    }

    // Update user stats
    const user = await User.findById(req.user._id);
    user.stats.totalEntries = Math.max(0, user.stats.totalEntries - 1);
    user.stats.totalWords = Math.max(0, user.stats.totalWords - entry.wordCount);
    await user.save();

    res.json({
      success: true,
      message: 'Entry deleted successfully'
    });
  } catch (error) {
    console.error('Delete entry error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @route   GET /api/entries/stats/streak
 * @desc    Get user streak data
 * @access  Private
 */
router.get('/stats/streak', async (req, res) => {
  try {
    const streakData = await Entry.getStreakData(req.user._id);

    res.json({
      success: true,
      streak: streakData
    });
  } catch (error) {
    console.error('Get streak error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @route   GET /api/entries/nearby
 * @desc    Get entries near a location
 * @access  Private
 */
router.get('/nearby', async (req, res) => {
  try {
    const { latitude, longitude, maxDistance = 10000 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    const entries = await Entry.find({
      userId: req.user._id,
      'location.coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseInt(maxDistance)
        }
      }
    }).limit(50);

    res.json({
      success: true,
      entries
    });
  } catch (error) {
    console.error('Get nearby entries error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @route   POST /api/entries/:id/like
 * @desc    Like/unlike an entry
 * @access  Private
 */
router.post('/:id/like', async (req, res) => {
  try {
    const entry = await Entry.findById(req.params.id);

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Entry not found'
      });
    }

    // Check if entry is public or from friend
    if (entry.isPrivate && entry.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Cannot like private entry'
      });
    }

    await entry.addLike();

    res.json({
      success: true,
      likes: entry.likes
    });
  } catch (error) {
    console.error('Like entry error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
