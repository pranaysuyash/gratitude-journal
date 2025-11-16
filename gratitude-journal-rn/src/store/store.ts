/**
 * Redux Store Configuration
 * © 2024 Gratitude Journal. All Rights Reserved.
 */

import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import entriesReducer from './slices/entriesSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    entries: entriesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['auth/login/fulfilled', 'user/updateUser/fulfilled'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
