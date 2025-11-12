/**
 * Export Routes
 * Export journal data in various formats
 * © 2024 Gratitude Journal. All Rights Reserved.
 */

import express from 'express';
import { JournalEntry, User, Goal, Collection } from '../models';
import logger from '../utils/logger';

const router = express.Router();

// Export as JSON
router.get('/json', async (req: any, res) => {
  try {
    const entries = await JournalEntry.find({ userId: req.user._id })
      .populate('categories', 'name')
      .populate('collections', 'name')
      .sort({ date: -1 });

    const user = await User.findById(req.user._id);
    const goals = await Goal.find({ userId: req.user._id });
    const collections = await Collection.find({ userId: req.user._id });

    const exportData = {
      exportDate: new Date(),
      user: {
        username: user?.username,
        displayName: user?.displayName,
        email: user?.email,
        stats: user?.stats,
      },
      entries: entries.map(e => ({
        id: e._id,
        title: e.title,
        content: e.content,
        date: e.date,
        mood: e.mood,
        moodScore: e.moodScore,
        gratitudeItems: e.gratitudeItems,
        tags: e.tags,
        categories: e.categories,
        sentiment: e.aiAnalysis?.sentiment,
        themes: e.aiAnalysis?.themes,
        wordCount: e.content.split(/\s+/).length,
      })),
      goals,
      collections,
    };

    res.json(exportData);
  } catch (error: any) {
    logger.error('Export JSON error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Export as CSV
router.get('/csv', async (req: any, res) => {
  try {
    const entries = await JournalEntry.find({ userId: req.user._id }).sort({ date: -1 });

    const csvRows = [
      ['Date', 'Title', 'Content', 'Mood', 'Mood Score', 'Tags', 'Sentiment', 'Word Count'],
    ];

    entries.forEach(entry => {
      csvRows.push([
        entry.date.toISOString(),
        entry.title || '',
        entry.content.replace(/"/g, '""'), // Escape quotes
        entry.mood,
        entry.moodScore.toString(),
        entry.tags.join('; '),
        entry.aiAnalysis?.sentiment?.toString() || '',
        entry.content.split(/\s+/).length.toString(),
      ]);
    });

    const csv = csvRows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=gratitude-journal.csv');
    res.send(csv);
  } catch (error: any) {
    logger.error('Export CSV error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Export as PDF (basic)
router.get('/pdf', async (req: any, res) => {
  try {
    // TODO: Implement PDF generation using PDFKit or similar
    res.status(501).json({ error: 'PDF export coming soon' });
  } catch (error: any) {
    logger.error('Export PDF error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Export as Markdown
router.get('/markdown', async (req: any, res) => {
  try {
    const entries = await JournalEntry.find({ userId: req.user._id }).sort({ date: -1 });

    let markdown = '# My Gratitude Journal\n\n';
    markdown += `Exported on ${new Date().toLocaleDateString()}\n\n`;
    markdown += '---\n\n';

    entries.forEach(entry => {
      markdown += `## ${entry.date.toLocaleDateString()}${entry.title ? ` - ${entry.title}` : ''}\n\n`;
      markdown += `**Mood:** ${entry.mood} (${entry.moodScore}/10)\n\n`;

      if (entry.gratitudeItems.length > 0) {
        markdown += '**Grateful for:**\n';
        entry.gratitudeItems.forEach(item => {
          markdown += `- ${item}\n`;
        });
        markdown += '\n';
      }

      markdown += `${entry.content}\n\n`;

      if (entry.tags.length > 0) {
        markdown += `*Tags: ${entry.tags.join(', ')}*\n\n`;
      }

      markdown += '---\n\n';
    });

    res.setHeader('Content-Type', 'text/markdown');
    res.setHeader('Content-Disposition', 'attachment; filename=gratitude-journal.md');
    res.send(markdown);
  } catch (error: any) {
    logger.error('Export Markdown error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Export specific date range
router.get('/range', async (req: any, res) => {
  try {
    const { startDate, endDate, format } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start and end dates are required' });
    }

    const entries = await JournalEntry.find({
      userId: req.user._id,
      date: {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string),
      },
    }).sort({ date: -1 });

    if (format === 'json') {
      res.json({ entries });
    } else if (format === 'csv') {
      const csvRows = [
        ['Date', 'Title', 'Content', 'Mood', 'Mood Score'],
      ];

      entries.forEach(entry => {
        csvRows.push([
          entry.date.toISOString(),
          entry.title || '',
          entry.content.replace(/"/g, '""'),
          entry.mood,
          entry.moodScore.toString(),
        ]);
      });

      const csv = csvRows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=gratitude-journal-range.csv');
      res.send(csv);
    } else {
      res.json({ entries });
    }
  } catch (error: any) {
    logger.error('Export range error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
