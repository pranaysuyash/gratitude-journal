/**
 * AI Routes
 * AI-powered features and insights
 * © 2024 Gratitude Journal. All Rights Reserved.
 */

import express from 'express';
import { JournalEntry } from '../models';
import { analyzeSentiment, generateDailyPrompt, generateInsights, generateWeeklyInsights } from '../services/ai';
import logger from '../utils/logger';

const router = express.Router();

// Generate daily prompt
router.get('/prompt', async (req: any, res) => {
  try {
    const category = req.query.category as string;
    const prompt = await generateDailyPrompt(category);

    res.json({ prompt, category });
  } catch (error: any) {
    logger.error('Generate prompt error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Analyze text sentiment
router.post('/analyze', async (req: any, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const analysis = await analyzeSentiment(text);

    res.json({ analysis });
  } catch (error: any) {
    logger.error('Analyze sentiment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get insights for entry
router.get('/insights/:entryId', async (req: any, res) => {
  try {
    const entry = await JournalEntry.findOne({
      _id: req.params.entryId,
      userId: req.user._id,
    });

    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    const insights = await generateInsights(entry.content);

    res.json({ insights });
  } catch (error: any) {
    logger.error('Get insights error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get weekly summary
router.get('/weekly-summary', async (req: any, res) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    const entries = await JournalEntry.find({
      userId: req.user._id,
      date: { $gte: startDate },
    }).sort({ date: -1 });

    if (entries.length === 0) {
      return res.json({
        summary: 'No entries this week. Start journaling to get personalized insights!',
        entryCount: 0,
      });
    }

    const contents = entries.map(e => e.content);
    const summary = await generateWeeklyInsights(contents);

    // Calculate weekly stats
    const totalWords = entries.reduce((sum, e) => sum + e.content.split(/\s+/).length, 0);
    const avgSentiment = entries
      .filter(e => e.aiAnalysis?.sentiment)
      .reduce((sum, e) => sum + (e.aiAnalysis?.sentiment || 0), 0) / entries.length;

    res.json({
      summary,
      entryCount: entries.length,
      totalWords,
      avgSentiment,
      period: { start: startDate, end: new Date() },
    });
  } catch (error: any) {
    logger.error('Get weekly summary error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get personalized recommendations
router.get('/recommendations', async (req: any, res) => {
  try {
    const recentEntries = await JournalEntry.find({
      userId: req.user._id,
    })
      .sort({ date: -1 })
      .limit(10);

    // Analyze patterns
    const recommendations: string[] = [];

    if (recentEntries.length < 3) {
      recommendations.push('Try to journal consistently. Daily entries help build a strong gratitude practice.');
    }

    const avgSentiment = recentEntries
      .filter(e => e.aiAnalysis?.sentiment)
      .reduce((sum, e) => sum + (e.aiAnalysis?.sentiment || 0), 0) / recentEntries.length;

    if (avgSentiment < 0.4) {
      recommendations.push('Consider exploring deeper gratitude. Try focusing on small, everyday moments.');
    }

    const avgWords = recentEntries.reduce((sum, e) => sum + e.content.split(/\s+/).length, 0) / recentEntries.length;

    if (avgWords < 30) {
      recommendations.push('Try writing more detailed entries. Elaborating on your gratitude can deepen your practice.');
    }

    const hasMedia = recentEntries.some(e => e.media.length > 0);
    if (!hasMedia) {
      recommendations.push('Add photos to your entries! Visual memories can enhance your gratitude experience.');
    }

    if (recommendations.length === 0) {
      recommendations.push('Great work! Keep up your consistent gratitude practice.');
      recommendations.push('Consider trying themed entries or gratitude challenges.');
    }

    res.json({ recommendations });
  } catch (error: any) {
    logger.error('Get recommendations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
