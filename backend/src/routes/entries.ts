/**
 * Journal Entries Routes
 * Complete CRUD operations for journal entries with AI analysis
 * © 2024 Gratitude Journal. All Rights Reserved.
 */

import express from 'express';
import { body, query, validationResult } from 'express-validator';
import { JournalEntry, User } from '../models';
import { analyzeSentiment, generateKeywords, generateInsights } from '../services/ai';
import { uploadMedia } from '../services/storage';
import logger from '../utils/logger';

const router = express.Router();

/**
 * @swagger
 * /api/v1/entries:
 *   get:
 *     summary: Get all entries for authenticated user
 *     tags: [Entries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: mood
 *         schema:
 *           type: string
 *       - in: query
 *         name: tags
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of entries
 */
router.get('/', async (req: any, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const filter: any = { userId: req.user._id };

    // Search filter
    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }

    // Mood filter
    if (req.query.mood) {
      filter.mood = req.query.mood;
    }

    // Tags filter
    if (req.query.tags) {
      const tags = (req.query.tags as string).split(',');
      filter.tags = { $in: tags };
    }

    // Date range filter
    if (req.query.startDate || req.query.endDate) {
      filter.date = {};
      if (req.query.startDate) {
        filter.date.$gte = new Date(req.query.startDate as string);
      }
      if (req.query.endDate) {
        filter.date.$lte = new Date(req.query.endDate as string);
      }
    }

    // Visibility filters
    if (!filter.isArchived) {
      filter.isArchived = false;
    }

    if (!filter.isInVault) {
      filter.isInVault = false;
    }

    const entries = await JournalEntry.find(filter)
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .populate('categories', 'name icon color')
      .populate('collections', 'name color');

    const total = await JournalEntry.countDocuments(filter);

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
    logger.error('Get entries error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/v1/entries/{id}:
 *   get:
 *     summary: Get a single entry by ID
 *     tags: [Entries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Entry details
 *       404:
 *         description: Entry not found
 */
router.get('/:id', async (req: any, res) => {
  try {
    const entry = await JournalEntry.findOne({
      _id: req.params.id,
      userId: req.user._id,
    })
      .populate('categories', 'name icon color')
      .populate('collections', 'name color')
      .populate('templateId', 'name category')
      .populate('challengeId', 'title');

    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    res.json(entry);
  } catch (error: any) {
    logger.error('Get entry error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/v1/entries:
 *   post:
 *     summary: Create a new journal entry
 *     tags: [Entries]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *               - mood
 *               - moodScore
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               mood:
 *                 type: string
 *               moodScore:
 *                 type: number
 *               gratitudeItems:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Entry created successfully
 */
router.post('/', [
  body('content').trim().isLength({ min: 1, max: 10000 }),
  body('mood').isIn(['amazing', 'great', 'good', 'okay', 'sad', 'anxious', 'angry']),
  body('moodScore').isInt({ min: 1, max: 10 }),
  body('title').optional().trim().isLength({ max: 200 }),
  body('gratitudeItems').optional().isArray(),
  body('tags').optional().isArray(),
], async (req: any, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const entryData = {
      userId: req.user._id,
      ...req.body,
      date: req.body.date ? new Date(req.body.date) : new Date(),
      timezone: req.body.timezone || 'UTC',
    };

    // Create entry
    const entry = await JournalEntry.create(entryData);

    // AI Analysis (async, don't wait)
    analyzeSentiment(entry.content)
      .then(async (analysis) => {
        entry.aiAnalysis = {
          sentiment: analysis.sentiment,
          emotions: analysis.emotions,
          themes: analysis.themes,
          keywords: await generateKeywords(entry.content),
          suggestions: await generateInsights(entry.content),
          insightGenerated: true,
        };
        await entry.save();
      })
      .catch((error) => logger.error('AI analysis error:', error));

    // Update user stats
    const user = await User.findById(req.user._id);
    if (user) {
      user.stats.totalEntries += 1;
      user.stats.totalWords += entry.content.split(/\s+/).length;

      // Calculate streak
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const lastEntry = await JournalEntry.findOne({
        userId: req.user._id,
        _id: { $ne: entry._id },
      }).sort({ date: -1 });

      if (lastEntry) {
        const lastEntryDate = new Date(lastEntry.date);
        lastEntryDate.setHours(0, 0, 0, 0);

        if (lastEntryDate.getTime() === yesterday.getTime()) {
          user.stats.currentStreak += 1;
          if (user.stats.currentStreak > user.stats.longestStreak) {
            user.stats.longestStreak = user.stats.currentStreak;
          }
        } else if (lastEntryDate.getTime() < yesterday.getTime()) {
          user.stats.currentStreak = 1;
        }
      } else {
        user.stats.currentStreak = 1;
      }

      await user.save();
    }

    res.status(201).json({
      message: 'Entry created successfully',
      entry,
    });
  } catch (error: any) {
    logger.error('Create entry error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/v1/entries/{id}:
 *   put:
 *     summary: Update an entry
 *     tags: [Entries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Entry updated successfully
 *       404:
 *         description: Entry not found
 */
router.put('/:id', async (req: any, res) => {
  try {
    const entry = await JournalEntry.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    // Save old content to history
    entry.editHistory.push({
      content: entry.content,
      editedAt: new Date(),
    });

    // Update fields
    Object.assign(entry, req.body);
    await entry.save();

    // Re-run AI analysis if content changed
    if (req.body.content) {
      analyzeSentiment(entry.content)
        .then(async (analysis) => {
          entry.aiAnalysis = {
            sentiment: analysis.sentiment,
            emotions: analysis.emotions,
            themes: analysis.themes,
            keywords: await generateKeywords(entry.content),
            suggestions: await generateInsights(entry.content),
            insightGenerated: true,
          };
          await entry.save();
        })
        .catch((error) => logger.error('AI analysis error:', error));
    }

    res.json({
      message: 'Entry updated successfully',
      entry,
    });
  } catch (error: any) {
    logger.error('Update entry error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/v1/entries/{id}:
 *   delete:
 *     summary: Delete an entry
 *     tags: [Entries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Entry deleted successfully
 *       404:
 *         description: Entry not found
 */
router.delete('/:id', async (req: any, res) => {
  try {
    const entry = await JournalEntry.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    // Update user stats
    const user = await User.findById(req.user._id);
    if (user) {
      user.stats.totalEntries = Math.max(0, user.stats.totalEntries - 1);
      await user.save();
    }

    res.json({ message: 'Entry deleted successfully' });
  } catch (error: any) {
    logger.error('Delete entry error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/v1/entries/{id}/favorite:
 *   patch:
 *     summary: Toggle favorite status
 *     tags: [Entries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Favorite status updated
 */
router.patch('/:id/favorite', async (req: any, res) => {
  try {
    const entry = await JournalEntry.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    entry.isFavorite = !entry.isFavorite;
    await entry.save();

    res.json({
      message: 'Favorite status updated',
      isFavorite: entry.isFavorite,
    });
  } catch (error: any) {
    logger.error('Toggle favorite error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/v1/entries/{id}/archive:
 *   patch:
 *     summary: Toggle archive status
 *     tags: [Entries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Archive status updated
 */
router.patch('/:id/archive', async (req: any, res) => {
  try {
    const entry = await JournalEntry.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    entry.isArchived = !entry.isArchived;
    await entry.save();

    res.json({
      message: 'Archive status updated',
      isArchived: entry.isArchived,
    });
  } catch (error: any) {
    logger.error('Toggle archive error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/v1/entries/{id}/like:
 *   post:
 *     summary: Like an entry
 *     tags: [Entries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Entry liked
 */
router.post('/:id/like', async (req: any, res) => {
  try {
    const entry = await JournalEntry.findById(req.params.id);

    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    // Check visibility
    if (entry.visibility === 'private' && entry.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Cannot like private entry' });
    }

    const likeIndex = entry.likes.indexOf(req.user._id);
    if (likeIndex > -1) {
      entry.likes.splice(likeIndex, 1);
    } else {
      entry.likes.push(req.user._id);
    }

    await entry.save();

    res.json({
      message: 'Like status updated',
      likesCount: entry.likes.length,
      isLiked: entry.likes.includes(req.user._id),
    });
  } catch (error: any) {
    logger.error('Like entry error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/v1/entries/{id}/comments:
 *   post:
 *     summary: Add a comment to an entry
 *     tags: [Entries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Comment added
 */
router.post('/:id/comments', [
  body('content').trim().isLength({ min: 1, max: 1000 }),
], async (req: any, res) => {
  try {
    const entry = await JournalEntry.findById(req.params.id);

    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    // Check visibility
    if (entry.visibility === 'private' && entry.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Cannot comment on private entry' });
    }

    entry.comments.push({
      userId: req.user._id,
      content: req.body.content,
      createdAt: new Date(),
    });

    await entry.save();

    res.status(201).json({
      message: 'Comment added successfully',
      comment: entry.comments[entry.comments.length - 1],
    });
  } catch (error: any) {
    logger.error('Add comment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
