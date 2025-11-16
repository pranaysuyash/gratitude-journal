/**
 * User Slice
 * User profile and stats state management
 * © 2024 Gratitude Journal. All Rights Reserved.
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import ApiService, { User } from '../../services/ApiService';

interface UserState {
  currentUser: User | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  currentUser: null,
  loading: false,
  error: null,
};

// Async thunks
export const fetchCurrentUser = createAsyncThunk('user/fetchCurrent', async (_, { rejectWithValue }) => {
  try {
    const response = await ApiService.getCurrentUser();
    if (response.success && response.data) {
      return response.data;
    }
    return rejectWithValue(response.error || 'Failed to fetch user');
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch user');
  }
});

export const updateUserProfile = createAsyncThunk(
  'user/updateProfile',
  async (updates: Partial<User>, { rejectWithValue }) => {
    try {
      const response = await ApiService.updateProfile(updates);
      if (response.success && response.data) {
        return response.data;
      }
      return rejectWithValue(response.error || 'Failed to update profile');
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update profile');
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.currentUser = action.payload;
    },
    updateUserStats: (state, action: PayloadAction<Partial<User['stats']>>) => {
      if (state.currentUser) {
        state.currentUser.stats = { ...state.currentUser.stats, ...action.payload };
      }
    },
    clearUser: (state) => {
      state.currentUser = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch current user
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
        state.error = null;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update profile
    builder
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
        state.error = null;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setUser, updateUserStats, clearUser } = userSlice.actions;
export default userSlice.reducer;
