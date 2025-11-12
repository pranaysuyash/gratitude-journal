/**
 * Analytics Routes
 * Statistics and insights for user journal data
 * © 2024 Gratitude Journal. All Rights Reserved.
 */

import express from 'express';
import { JournalEntry, User } from '../models';
import { generateWeeklyInsights } from '../services/ai';
import logger from '../utils/logger';

const router = express.Router();

// Get overall stats
router.get('/stats', async (req: any, res) => {
  try {
    const user = await User.findById(req.user._id);
    const entries = await JournalEntry.find({ userId: req.user._id });

    const totalWords = entries.reduce((sum, entry) => {
      return sum + entry.content.split(/\s+/).length;
    }, 0);

    const avgWordsPerEntry = entries.length > 0 ? totalWords / entries.length : 0;

    // Calculate mood distribution
    const moodCounts: any = {};
    entries.forEach(entry => {
      moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
    });

    // Calculate sentiment trend
    const avgSentiment = entries
      .filter(e => e.aiAnalysis?.sentiment)
      .reduce((sum, e) => sum + (e.aiAnalysis?.sentiment || 0), 0) / entries.length;

    res.json({
      stats: user?.stats,
      totalWords,
      avgWordsPerEntry,
      moodDistribution: moodCounts,
      avgSentiment,
      firstEntry: entries.length > 0 ? entries[entries.length - 1].date : null,
    });
  } catch (error: any) {
    logger.error('Get stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get mood trends
router.get('/mood-trends', async (req: any, res) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const entries = await JournalEntry.find({
      userId: req.user._id,
      date: { $gte: startDate },
    }).sort({ date: 1 });

    const trends = entries.map(entry => ({
      date: entry.date,
      mood: entry.mood,
      moodScore: entry.moodScore,
      sentiment: entry.aiAnalysis?.sentiment,
    }));

    res.json({ trends });
  } catch (error: any) {
    logger.error('Get mood trends error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get word cloud data
router.get('/word-cloud', async (req: any, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;

    const entries = await JournalEntry.find({ userId: req.user._id });

    // Combine all content
    const allText = entries.map(e => e.content).join(' ').toLowerCase();

    // Simple word frequency (in production, use a proper library)
    const words = allText.split(/\s+/);
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'my', 'your', 'his', 'her', 'its', 'our', 'their']);

    const wordFreq: any = {};
    words.forEach(word => {
      const cleaned = word.replace(/[^a-z]/g, '');
      if (cleaned.length > 3 && !stopWords.has(cleaned)) {
        wordFreq[cleaned] = (wordFreq[cleaned] || 0) + 1;
      }
    });

    const wordCloud = Object.entries(wordFreq)
      .sort(([, a]: any, [, b]: any) => b - a)
      .slice(0, limit)
      .map(([word, count]) => ({ word, count }));

    res.json({ wordCloud });
  } catch (error: any) {
    logger.error('Get word cloud error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get weekly insights
router.get('/weekly-insights', async (req: any, res) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    const entries = await JournalEntry.find({
      userId: req.user._id,
      date: { $gte: startDate },
    }).sort({ date: -1 });

    const contents = entries.map(e => e.content);
    const insights = await generateWeeklyInsights(contents);

    res.json({
      insights,
      entryCount: entries.length,
      period: { start: startDate, end: new Date() },
    });
  } catch (error: any) {
    logger.error('Get weekly insights error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get streak history
router.get('/streak-history', async (req: any, res) => {
  try {
    const entries = await JournalEntry.find({ userId: req.user._id })
      .sort({ date: -1 })
      .select('date');

    const streaks: any[] = [];
    let currentStreak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const entry of entries) {
      const entryDate = new Date(entry.date);
      entryDate.setHours(0, 0, 0, 0);

      const diffDays = Math.floor((currentDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === currentStreak || (currentStreak === 0 && diffDays === 0)) {
        currentStreak++;
        currentDate = entryDate;
      } else {
        if (currentStreak > 0) {
          streaks.push({ length: currentStreak, endDate: currentDate });
        }
        currentStreak = 1;
        currentDate = entryDate;
      }
    }

    if (currentStreak > 0) {
      streaks.push({ length: currentStreak, endDate: currentDate });
    }

    res.json({ streaks });
  } catch (error: any) {
    logger.error('Get streak history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get themes and patterns
router.get('/themes', async (req: any, res) => {
  try {
    const entries = await JournalEntry.find({
      userId: req.user._id,
      'aiAnalysis.themes': { $exists: true },
    });

    const themeCounts: any = {};
    entries.forEach(entry => {
      entry.aiAnalysis?.themes?.forEach(theme => {
        themeCounts[theme] = (themeCounts[theme] || 0) + 1;
      });
    });

    const themes = Object.entries(themeCounts)
      .sort(([, a]: any, [, b]: any) => b - a)
      .slice(0, 20)
      .map(([theme, count]) => ({ theme, count }));

    res.json({ themes });
  } catch (error: any) {
    logger.error('Get themes error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
