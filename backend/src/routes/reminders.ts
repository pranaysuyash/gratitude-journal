/**
 * Reminders Routes
 * Notification reminders for journaling
 * © 2024 Gratitude Journal. All Rights Reserved.
 */

import express from 'express';
import { body, validationResult } from 'express-validator';
import { Reminder } from '../models';
import logger from '../utils/logger';

const router = express.Router();

// Get all reminders
router.get('/', async (req: any, res) => {
  try {
    const reminders = await Reminder.find({ userId: req.user._id }).sort({ time: 1 });
    res.json({ reminders });
  } catch (error: any) {
    logger.error('Get reminders error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create reminder
router.post('/', [
  body('title').trim().isLength({ min: 1, max: 100 }),
  body('time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
], async (req: any, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const reminder = await Reminder.create({
      userId: req.user._id,
      ...req.body,
      startDate: req.body.startDate || new Date(),
    });

    res.status(201).json({ message: 'Reminder created', reminder });
  } catch (error: any) {
    logger.error('Create reminder error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update reminder
router.put('/:id', async (req: any, res) => {
  try {
    const reminder = await Reminder.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!reminder) {
      return res.status(404).json({ error: 'Reminder not found' });
    }

    res.json({ message: 'Reminder updated', reminder });
  } catch (error: any) {
    logger.error('Update reminder error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete reminder
router.delete('/:id', async (req: any, res) => {
  try {
    const reminder = await Reminder.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!reminder) {
      return res.status(404).json({ error: 'Reminder not found' });
    }

    res.json({ message: 'Reminder deleted' });
  } catch (error: any) {
    logger.error('Delete reminder error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Toggle reminder
router.patch('/:id/toggle', async (req: any, res) => {
  try {
    const reminder = await Reminder.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!reminder) {
      return res.status(404).json({ error: 'Reminder not found' });
    }

    reminder.isEnabled = !reminder.isEnabled;
    await reminder.save();

    res.json({ message: 'Reminder toggled', isEnabled: reminder.isEnabled });
  } catch (error: any) {
    logger.error('Toggle reminder error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
