/**
 * AI Service
 * OpenAI integration for sentiment analysis, keywords, and insights
 * © 2024 Gratitude Journal. All Rights Reserved.
 */

import OpenAI from 'openai';
import logger from '../utils/logger';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface SentimentAnalysis {
  sentiment: number;
  emotions: {
    joy: number;
    gratitude: number;
    hope: number;
    love: number;
    peace: number;
  };
  themes: string[];
}

/**
 * Analyze sentiment of journal entry content
 */
export async function analyzeSentiment(content: string): Promise<SentimentAnalysis> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      logger.warn('OpenAI API key not configured');
      return {
        sentiment: 0.5,
        emotions: { joy: 0, gratitude: 0, hope: 0, love: 0, peace: 0 },
        themes: [],
      };
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are a sentiment analysis expert specializing in gratitude journaling. Analyze the following journal entry and return a JSON object with:
- sentiment: overall sentiment score (0-1, where 1 is most positive)
- emotions: object with scores (0-1) for joy, gratitude, hope, love, peace
- themes: array of 3-5 key themes or topics mentioned

Return ONLY valid JSON, no other text.`,
        },
        {
          role: 'user',
          content,
        },
      ],
      temperature: 0.3,
      max_tokens: 300,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return result;
  } catch (error) {
    logger.error('Sentiment analysis error:', error);
    return {
      sentiment: 0.5,
      emotions: { joy: 0, gratitude: 0, hope: 0, love: 0, peace: 0 },
      themes: [],
    };
  }
}

/**
 * Generate keywords from journal entry
 */
export async function generateKeywords(content: string): Promise<string[]> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return [];
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'Extract 5-10 key words or short phrases from this journal entry. Return as a JSON array of strings.',
        },
        {
          role: 'user',
          content,
        },
      ],
      temperature: 0.3,
      max_tokens: 150,
    });

    const keywords = JSON.parse(response.choices[0].message.content || '[]');
    return keywords;
  } catch (error) {
    logger.error('Keyword generation error:', error);
    return [];
  }
}

/**
 * Generate insights and suggestions
 */
export async function generateInsights(content: string): Promise<string[]> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return [];
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `Based on this gratitude journal entry, provide 2-3 brief, encouraging insights or reflection prompts. Return as a JSON array of strings. Keep each insight under 100 characters.`,
        },
        {
          role: 'user',
          content,
        },
      ],
      temperature: 0.7,
      max_tokens: 200,
    });

    const insights = JSON.parse(response.choices[0].message.content || '[]');
    return insights;
  } catch (error) {
    logger.error('Insights generation error:', error);
    return [];
  }
}

/**
 * Generate a daily gratitude prompt
 */
export async function generateDailyPrompt(category?: string): Promise<string> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return 'What are you grateful for today?';
    }

    const categoryPrompt = category ? ` related to ${category}` : '';

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `Generate a thoughtful, engaging gratitude journal prompt${categoryPrompt}. Make it specific and introspective. Return only the prompt text, no quotes.`,
        },
        {
          role: 'user',
          content: 'Generate a prompt',
        },
      ],
      temperature: 0.9,
      max_tokens: 100,
    });

    return response.choices[0].message.content || 'What are you grateful for today?';
  } catch (error) {
    logger.error('Prompt generation error:', error);
    return 'What are you grateful for today?';
  }
}

/**
 * Generate weekly insights from multiple entries
 */
export async function generateWeeklyInsights(entries: string[]): Promise<string> {
  try {
    if (!process.env.OPENAI_API_KEY || entries.length === 0) {
      return 'Keep up the great work with your gratitude practice!';
    }

    const combinedContent = entries.join('\n\n---\n\n');

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are a thoughtful gratitude journal coach. Analyze these week's journal entries and provide a brief (3-4 sentences) encouraging summary highlighting patterns, growth, and suggestions. Be warm and supportive.`,
        },
        {
          role: 'user',
          content: combinedContent,
        },
      ],
      temperature: 0.7,
      max_tokens: 300,
    });

    return response.choices[0].message.content || 'Keep up the great work!';
  } catch (error) {
    logger.error('Weekly insights error:', error);
    return 'Keep up the great work with your gratitude practice!';
  }
}

/**
 * Transcribe voice note using Whisper
 */
export async function transcribeAudio(audioUrl: string): Promise<string> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return '';
    }

    // TODO: Download audio file and transcribe
    // This requires file handling which is more complex
    logger.warn('Audio transcription not yet implemented');
    return '';
  } catch (error) {
    logger.error('Audio transcription error:', error);
    return '';
  }
}
