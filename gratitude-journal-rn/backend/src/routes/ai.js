/**
 * AI Routes
 * AI-powered features and coach
 * © 2024 Gratitude Journal. All Rights Reserved.
 */

const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { generatePrompt, askCoach } = require('../services/aiService');

router.use(auth);

/**
 * Generate daily prompt
 */
router.get('/prompt', async (req, res) => {
  try {
    const { category } = req.query;
    const prompt = await generatePrompt(category);

    res.json({
      success: true,
      prompt
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * AI Coach - ask question
 */
router.post('/coach', async (req, res) => {
  try {
    const { question, history = [] } = req.body;

    if (!question) {
      return res.status(400).json({
        success: false,
        message: 'Question is required'
      });
    }

    const response = await askCoach(question, history);

    res.json({
      success: true,
      response
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
