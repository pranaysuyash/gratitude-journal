/**
 * Redux Store Configuration
 * © 2024 Gratitude Journal. All Rights Reserved.
 */

import { configureStore, combineReducers } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Reducers
import authReducer from './slices/authSlice';
import entriesReducer from './slices/entriesSlice';
import themeReducer from './slices/themeSlice';
import settingsReducer from './slices/settingsSlice';
import statsReducer from './slices/statsSlice';
import goalsReducer from './slices/goalsSlice';
import badgesReducer from './slices/badgesSlice';
import collectionsReducer from './slices/collectionsSlice';
import remindersReducer from './slices/remindersSlice';
import syncReducer from './slices/syncSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  entries: entriesReducer,
  theme: themeReducer,
  settings: settingsReducer,
  stats: statsReducer,
  goals: goalsReducer,
  badges: badgesReducer,
  collections: collectionsReducer,
  reminders: remindersReducer,
  sync: syncReducer,
});

const persistConfig = {
  key: 'root',
  version: 1,
  storage: AsyncStorage,
  whitelist: ['auth', 'theme', 'settings'], // Only persist these reducers
  blacklist: ['sync'], // Don't persist sync state
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
