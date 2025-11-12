/**
 * Entries Redux Slice
 * Manages all gratitude journal entries
 * © 2024 Gratitude Journal. All Rights Reserved.
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Entry, MoodType, EntryType } from '../../types';
import * as EntriesService from '../../services/entriesService';
import * as AIService from '../../services/aiService';

interface EntriesState {
  entries: Entry[];
  currentEntry: Entry | null;
  loading: boolean;
  error: string | null;
  filters: {
    mood?: MoodType;
    type?: EntryType;
    dateRange?: { start: Date; end: Date };
    tags?: string[];
    searchQuery?: string;
  };
  streak: number;
  longestStreak: number;
}

const initialState: EntriesState = {
  entries: [],
  currentEntry: null,
  loading: false,
  error: null,
  filters: {},
  streak: 0,
  longestStreak: 0,
};

// Async Thunks

export const fetchEntries = createAsyncThunk(
  'entries/fetchEntries',
  async (userId: string) => {
    const entries = await EntriesService.fetchEntries(userId);
    return entries;
  }
);

export const createEntry = createAsyncThunk(
  'entries/createEntry',
  async (entry: Omit<Entry, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newEntry = await EntriesService.createEntry(entry);

    // Analyze sentiment in background
    AIService.analyzeSentiment(newEntry.content).then(score => {
      EntriesService.updateEntry(newEntry.id, { sentimentScore: score });
    });

    return newEntry;
  }
);

export const updateEntry = createAsyncThunk(
  'entries/updateEntry',
  async ({ id, updates }: { id: string; updates: Partial<Entry> }) => {
    const updatedEntry = await EntriesService.updateEntry(id, updates);
    return updatedEntry;
  }
);

export const deleteEntry = createAsyncThunk(
  'entries/deleteEntry',
  async (id: string) => {
    await EntriesService.deleteEntry(id);
    return id;
  }
);

export const generateAIInsights = createAsyncThunk(
  'entries/generateAIInsights',
  async (entries: Entry[]) => {
    const insights = await AIService.generateInsights(entries);
    return insights;
  }
);

// Slice

const entriesSlice = createSlice({
  name: 'entries',
  initialState,
  reducers: {
    setCurrentEntry: (state, action: PayloadAction<Entry | null>) => {
      state.currentEntry = action.payload;
    },
    setFilters: (state, action: PayloadAction<Partial<EntriesState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    calculateStreak: (state) => {
      const sorted = [...state.entries].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      let streak = 0;
      let currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);

      for (const entry of sorted) {
        const entryDate = new Date(entry.date);
        entryDate.setHours(0, 0, 0, 0);

        const diffDays = Math.floor(
          (currentDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (diffDays === streak || (streak === 0 && diffDays === 0)) {
          streak++;
          currentDate = entryDate;
        } else {
          break;
        }
      }

      state.streak = streak;

      // Calculate longest streak
      let longest = 0;
      let current = 0;
      let lastDate: Date | null = null;

      for (const entry of sorted) {
        const entryDate = new Date(entry.date);
        entryDate.setHours(0, 0, 0, 0);

        if (!lastDate) {
          current = 1;
        } else {
          const diffDays = Math.floor(
            (lastDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24)
          );

          if (diffDays === 1) {
            current++;
          } else {
            longest = Math.max(longest, current);
            current = 1;
          }
        }

        lastDate = entryDate;
      }

      state.longestStreak = Math.max(longest, current);
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch entries
      .addCase(fetchEntries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEntries.fulfilled, (state, action) => {
        state.loading = false;
        state.entries = action.payload;
      })
      .addCase(fetchEntries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch entries';
      })
      // Create entry
      .addCase(createEntry.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createEntry.fulfilled, (state, action) => {
        state.loading = false;
        state.entries.unshift(action.payload);
      })
      .addCase(createEntry.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create entry';
      })
      // Update entry
      .addCase(updateEntry.fulfilled, (state, action) => {
        const index = state.entries.findIndex(e => e.id === action.payload.id);
        if (index !== -1) {
          state.entries[index] = action.payload;
        }
      })
      // Delete entry
      .addCase(deleteEntry.fulfilled, (state, action) => {
        state.entries = state.entries.filter(e => e.id !== action.payload);
      });
  },
});

export const { setCurrentEntry, setFilters, clearFilters, calculateStreak } = entriesSlice.actions;

export default entriesSlice.reducer;

// Selectors

export const selectAllEntries = (state: { entries: EntriesState }) => state.entries.entries;

export const selectFilteredEntries = (state: { entries: EntriesState }) => {
  const { entries, filters } = state.entries;

  return entries.filter(entry => {
    if (filters.mood && entry.mood !== filters.mood) return false;
    if (filters.type && entry.type !== filters.type) return false;
    if (filters.tags && !filters.tags.some(tag => entry.tags.includes(tag))) return false;
    if (filters.searchQuery && !entry.content.toLowerCase().includes(filters.searchQuery.toLowerCase())) return false;
    if (filters.dateRange) {
      const entryDate = new Date(entry.date);
      if (entryDate < filters.dateRange.start || entryDate > filters.dateRange.end) return false;
    }
    return true;
  });
};

export const selectEntriesByMood = (state: { entries: EntriesState }) => {
  const { entries } = state.entries;
  const moodCounts: Record<MoodType, number> = {} as any;

  entries.forEach(entry => {
    moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
  });

  return moodCounts;
};

export const selectRecentEntries = (state: { entries: EntriesState }, count: number = 10) => {
  return state.entries.entries
    .slice()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, count);
};
