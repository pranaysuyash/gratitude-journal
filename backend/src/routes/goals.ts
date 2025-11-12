/**
 * Goals Routes
 * Gratitude goals and milestones management
 * © 2024 Gratitude Journal. All Rights Reserved.
 */

import express from 'express';
import { body, validationResult } from 'express-validator';
import { Goal, User } from '../models';
import logger from '../utils/logger';

const router = express.Router();

// Get all goals for user
router.get('/', async (req: any, res) => {
  try {
    const status = req.query.status;
    const filter: any = { userId: req.user._id };

    if (status) {
      filter.status = status;
    }

    const goals = await Goal.find(filter).sort({ createdAt: -1 });
    res.json({ goals });
  } catch (error: any) {
    logger.error('Get goals error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single goal
router.get('/:id', async (req: any, res) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, userId: req.user._id });
    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }
    res.json(goal);
  } catch (error: any) {
    logger.error('Get goal error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create goal
router.post('/', [
  body('title').trim().isLength({ min: 1, max: 100 }),
  body('type').isIn(['streak', 'entries', 'words', 'custom']),
  body('target').isInt({ min: 1 }),
], async (req: any, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const goal = await Goal.create({
      userId: req.user._id,
      ...req.body,
      startDate: req.body.startDate || new Date(),
    });

    res.status(201).json({ message: 'Goal created', goal });
  } catch (error: any) {
    logger.error('Create goal error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update goal
router.put('/:id', async (req: any, res) => {
  try {
    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    // Check if goal is completed
    if (goal.current >= goal.target && goal.status !== 'completed') {
      goal.status = 'completed';
      goal.completedAt = new Date();
      await goal.save();
    }

    res.json({ message: 'Goal updated', goal });
  } catch (error: any) {
    logger.error('Update goal error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete goal
router.delete('/:id', async (req: any, res) => {
  try {
    const goal = await Goal.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    res.json({ message: 'Goal deleted' });
  } catch (error: any) {
    logger.error('Delete goal error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update goal progress
router.patch('/:id/progress', async (req: any, res) => {
  try {
    const { current } = req.body;

    const goal = await Goal.findOne({ _id: req.params.id, userId: req.user._id });
    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    goal.current = current;

    // Check milestones
    for (const milestone of goal.milestones) {
      if (!milestone.reached && current >= milestone.value) {
        milestone.reached = true;
        milestone.reachedAt = new Date();
      }
    }

    // Check completion
    if (current >= goal.target && goal.status !== 'completed') {
      goal.status = 'completed';
      goal.completedAt = new Date();
    }

    await goal.save();

    res.json({ message: 'Progress updated', goal });
  } catch (error: any) {
    logger.error('Update progress error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
