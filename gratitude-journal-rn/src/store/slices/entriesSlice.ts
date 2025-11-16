/**
 * Entries Slice
 * Journal entries state management
 * © 2024 Gratitude Journal. All Rights Reserved.
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import ApiService, { Entry } from '../../services/ApiService';

interface EntriesState {
  entries: Entry[];
  currentEntry: Entry | null;
  loading: boolean;
  error: string | null;
  totalPages: number;
  currentPage: number;
}

const initialState: EntriesState = {
  entries: [],
  currentEntry: null,
  loading: false,
  error: null,
  totalPages: 0,
  currentPage: 1,
};

// Async thunks
export const fetchEntries = createAsyncThunk(
  'entries/fetchAll',
  async (params?: { page?: number; limit?: number }, { rejectWithValue }) => {
    try {
      const response = await ApiService.getEntries(params);
      if (response.success && response.data) {
        return response.data;
      }
      return rejectWithValue(response.error || 'Failed to fetch entries');
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch entries');
    }
  }
);

export const fetchEntry = createAsyncThunk(
  'entries/fetchOne',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await ApiService.getEntry(id);
      if (response.success && response.data) {
        return response.data;
      }
      return rejectWithValue(response.error || 'Failed to fetch entry');
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch entry');
    }
  }
);

export const createEntry = createAsyncThunk(
  'entries/create',
  async (entryData: any, { rejectWithValue }) => {
    try {
      const response = await ApiService.createEntry(entryData);
      if (response.success && response.data) {
        return response.data;
      }
      return rejectWithValue(response.error || 'Failed to create entry');
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to create entry');
    }
  }
);

export const updateEntry = createAsyncThunk(
  'entries/update',
  async ({ id, updates }: { id: string; updates: Partial<Entry> }, { rejectWithValue }) => {
    try {
      const response = await ApiService.updateEntry(id, updates);
      if (response.success && response.data) {
        return response.data;
      }
      return rejectWithValue(response.error || 'Failed to update entry');
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update entry');
    }
  }
);

export const deleteEntry = createAsyncThunk(
  'entries/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await ApiService.deleteEntry(id);
      if (response.success) {
        return id;
      }
      return rejectWithValue(response.error || 'Failed to delete entry');
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to delete entry');
    }
  }
);

const entriesSlice = createSlice({
  name: 'entries',
  initialState,
  reducers: {
    setCurrentEntry: (state, action: PayloadAction<Entry | null>) => {
      state.currentEntry = action.payload;
    },
    clearEntries: (state) => {
      state.entries = [];
      state.currentEntry = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch entries
    builder
      .addCase(fetchEntries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEntries.fulfilled, (state, action) => {
        state.loading = false;
        state.entries = action.payload.entries;
        state.totalPages = action.payload.pages;
        state.error = null;
      })
      .addCase(fetchEntries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch single entry
    builder
      .addCase(fetchEntry.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEntry.fulfilled, (state, action) => {
        state.loading = false;
        state.currentEntry = action.payload;
        state.error = null;
      })
      .addCase(fetchEntry.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create entry
    builder
      .addCase(createEntry.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createEntry.fulfilled, (state, action) => {
        state.loading = false;
        state.entries.unshift(action.payload);
        state.error = null;
      })
      .addCase(createEntry.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update entry
    builder
      .addCase(updateEntry.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateEntry.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.entries.findIndex((e) => e._id === action.payload._id);
        if (index !== -1) {
          state.entries[index] = action.payload;
        }
        if (state.currentEntry?._id === action.payload._id) {
          state.currentEntry = action.payload;
        }
        state.error = null;
      })
      .addCase(updateEntry.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete entry
    builder
      .addCase(deleteEntry.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteEntry.fulfilled, (state, action) => {
        state.loading = false;
        state.entries = state.entries.filter((e) => e._id !== action.payload);
        if (state.currentEntry?._id === action.payload) {
          state.currentEntry = null;
        }
        state.error = null;
      })
      .addCase(deleteEntry.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setCurrentEntry, clearEntries } = entriesSlice.actions;
export default entriesSlice.reducer;
