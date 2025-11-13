/**
 * AI Service
 * OpenAI GPT-4 integration for analysis and insights
 * © 2024 Gratitude Journal. All Rights Reserved.
 */

const OpenAI = require('openai');
const Entry = require('../models/Entry');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Analyze entry content with AI
 */
const analyzeWithAI = async (entryId, content) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      console.log('OpenAI API key not configured');
      return null;
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: `You are a gratitude journal AI coach. Analyze the following gratitude entry and return a JSON object with:
- sentimentScore: number between 0-1 (1 is most positive)
- summary: brief 1-sentence summary
- keyThemes: array of 3-5 main themes
- suggestedTags: array of relevant tags
- insight: one encouraging insight or reflection

Return ONLY valid JSON, no other text.`
        },
        {
          role: 'user',
          content
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    const analysis = JSON.parse(response.choices[0].message.content);

    // Update entry with AI analysis
    await Entry.findByIdAndUpdate(entryId, {
      aiAnalysis: analysis
    });

    return analysis;
  } catch (error) {
    console.error('AI analysis error:', error.message);
    return null;
  }
};

/**
 * Generate daily gratitude prompt
 */
const generatePrompt = async (category = null) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      // Fallback prompts
      const fallbackPrompts = [
        'What made you smile today?',
        'Who are you grateful for and why?',
        'What's a small thing that brought you joy?',
        'What challenge helped you grow?',
        'What comfort are you thankful for today?'
      ];
      return fallbackPrompts[Math.floor(Math.random() * fallbackPrompts.length)];
    }

    const categoryPrompt = category ? ` related to ${category}` : '';

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: `Generate a thoughtful, introspective gratitude journal prompt${categoryPrompt}. Make it specific and meaningful. Return only the prompt text, nothing else.`
        },
        {
          role: 'user',
          content: 'Generate a gratitude prompt'
        }
      ],
      temperature: 0.9,
      max_tokens: 100
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error('Prompt generation error:', error.message);
    return 'What are you grateful for today?';
  }
};

/**
 * Generate monthly insights
 */
const generateMonthlyInsights = async (entries) => {
  try {
    if (!process.env.OPENAI_API_KEY || entries.length === 0) {
      return 'Keep up your gratitude practice!';
    }

    const entriesText = entries
      .map(e => e.content)
      .slice(0, 30) // Limit to 30 entries
      .join('\n---\n');

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: `You are a gratitude coach analyzing a month of journal entries. Provide encouraging insights about patterns, growth, and themes you notice. Keep it positive and motivating. 2-3 paragraphs.`
        },
        {
          role: 'user',
          content: entriesText
        }
      ],
      temperature: 0.7,
      max_tokens: 400
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Monthly insights error:', error.message);
    return 'Keep up your amazing gratitude practice!';
  }
};

/**
 * AI Gratitude Coach - conversational
 */
const askCoach = async (question, userHistory = []) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return "I'm here to help with your gratitude practice! What would you like to know?";
    }

    const messages = [
      {
        role: 'system',
        content: `You are a warm, encouraging gratitude coach. Help users deepen their gratitude practice with thoughtful questions and insights. Be supportive and positive.`
      },
      ...userHistory,
      {
        role: 'user',
        content: question
      }
    ];

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages,
      temperature: 0.8,
      max_tokens: 300
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('AI coach error:', error.message);
    return "I'm having trouble connecting right now, but remember: gratitude is a practice that grows with time. Keep going!";
  }
};

module.exports = {
  analyzeWithAI,
  generatePrompt,
  generateMonthlyInsights,
  askCoach
};
