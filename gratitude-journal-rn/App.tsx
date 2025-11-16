/**
 * Gratitude Journal - React Native App
 * Cross-platform: iOS, Android, Web
 * © 2024 Gratitude Journal. All Rights Reserved.
 */

import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';
import * as SplashScreen from 'expo-splash-screen';

import { store } from './src/store/store';
import AppNavigator from './src/navigation/AppNavigator';
import AnalyticsService from './src/services/AnalyticsService';
import FeatureFlagsService from './src/services/FeatureFlagsService';

// Keep splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appIsReady, setAppIsReady] = React.useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Initialize services
        await AnalyticsService.initialize();
        await FeatureFlagsService.initialize();

        console.log('✅ Services initialized successfully');
      } catch (e) {
        console.warn('⚠️  Service initialization error:', e);
      } finally {
        setAppIsReady(true);
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  if (!appIsReady) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <SafeAreaProvider>
          <PaperProvider>
            <AppNavigator />
            <StatusBar style="auto" />
          </PaperProvider>
        </SafeAreaProvider>
      </Provider>
    </GestureHandlerRootView>
  );
}
