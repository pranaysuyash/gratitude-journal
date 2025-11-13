/**
 * Reminders Routes
 * © 2024 Gratitude Journal. All Rights Reserved.
 */

const express = require('express');
const router = express.Router();
const Reminder = require('../models/Reminder');
const { auth } = require('../middleware/auth');

router.use(auth);

router.get('/', async (req, res) => {
  try {
    const reminders = await Reminder.find({ userId: req.user._id });
    res.json({ success: true, reminders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const reminder = await Reminder.create({ userId: req.user._id, ...req.body });
    res.status(201).json({ success: true, reminder });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Reminder.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
