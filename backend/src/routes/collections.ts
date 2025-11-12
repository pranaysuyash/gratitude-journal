/**
 * Collections Routes
 * Entry collections and organization
 * © 2024 Gratitude Journal. All Rights Reserved.
 */

import express from 'express';
import { body, validationResult } from 'express-validator';
import { Collection, JournalEntry } from '../models';
import logger from '../utils/logger';

const router = express.Router();

// Get all collections
router.get('/', async (req: any, res) => {
  try {
    const collections = await Collection.find({ userId: req.user._id })
      .sort({ isFavorite: -1, name: 1 });

    res.json({ collections });
  } catch (error: any) {
    logger.error('Get collections error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single collection with entries
router.get('/:id', async (req: any, res) => {
  try {
    const collection = await Collection.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!collection) {
      return res.status(404).json({ error: 'Collection not found' });
    }

    // Get entries in this collection
    const entries = await JournalEntry.find({
      _id: { $in: collection.entries },
    }).sort({ date: -1 });

    res.json({ collection, entries });
  } catch (error: any) {
    logger.error('Get collection error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create collection
router.post('/', [
  body('name').trim().isLength({ min: 1, max: 100 }),
], async (req: any, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const collection = await Collection.create({
      userId: req.user._id,
      ...req.body,
    });

    res.status(201).json({ message: 'Collection created', collection });
  } catch (error: any) {
    logger.error('Create collection error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update collection
router.put('/:id', async (req: any, res) => {
  try {
    const collection = await Collection.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!collection) {
      return res.status(404).json({ error: 'Collection not found' });
    }

    res.json({ message: 'Collection updated', collection });
  } catch (error: any) {
    logger.error('Update collection error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete collection
router.delete('/:id', async (req: any, res) => {
  try {
    const collection = await Collection.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!collection) {
      return res.status(404).json({ error: 'Collection not found' });
    }

    res.json({ message: 'Collection deleted' });
  } catch (error: any) {
    logger.error('Delete collection error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add entry to collection
router.post('/:id/entries/:entryId', async (req: any, res) => {
  try {
    const collection = await Collection.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!collection) {
      return res.status(404).json({ error: 'Collection not found' });
    }

    // Verify entry belongs to user
    const entry = await JournalEntry.findOne({
      _id: req.params.entryId,
      userId: req.user._id,
    });

    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    // Add entry if not already in collection
    if (!collection.entries.includes(entry._id)) {
      collection.entries.push(entry._id);
      collection.stats.totalEntries += 1;
      collection.stats.lastAddedAt = new Date();
      await collection.save();
    }

    res.json({ message: 'Entry added to collection', collection });
  } catch (error: any) {
    logger.error('Add entry to collection error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Remove entry from collection
router.delete('/:id/entries/:entryId', async (req: any, res) => {
  try {
    const collection = await Collection.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!collection) {
      return res.status(404).json({ error: 'Collection not found' });
    }

    const index = collection.entries.indexOf(req.params.entryId as any);
    if (index > -1) {
      collection.entries.splice(index, 1);
      collection.stats.totalEntries = Math.max(0, collection.stats.totalEntries - 1);
      await collection.save();
    }

    res.json({ message: 'Entry removed from collection', collection });
  } catch (error: any) {
    logger.error('Remove entry from collection error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
