/**
 * Goals Routes
 * User goals and milestones
 * © 2024 Gratitude Journal. All Rights Reserved.
 */

const express = require('express');
const router = express.Router();
const Goal = require('../models/Goal');
const { auth } = require('../middleware/auth');

router.use(auth);

// Get all user goals
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    const query = { userId: req.user._id };

    if (status) query.status = status;

    const goals = await Goal.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      goals
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create goal
router.post('/', async (req, res) => {
  try {
    const goal = await Goal.create({
      userId: req.user._id,
      ...req.body
    });

    res.status(201).json({
      success: true,
      goal
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update goal progress
router.put('/:id/progress', async (req, res) => {
  try {
    const goal = await Goal.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!goal) {
      return res.status(404).json({ success: false, message: 'Goal not found' });
    }

    await goal.updateProgress(req.body.value);

    res.json({
      success: true,
      goal
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete goal
router.delete('/:id', async (req, res) => {
  try {
    await Goal.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    res.json({
      success: true,
      message: 'Goal deleted'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
