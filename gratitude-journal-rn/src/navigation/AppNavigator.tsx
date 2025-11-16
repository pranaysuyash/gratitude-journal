/**
 * App Navigator
 * Main navigation structure for the app
 * © 2024 Gratitude Journal. All Rights Reserved.
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import { useColorScheme } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Screens
import OnboardingScreen from '../screens/OnboardingScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import HomeScreen from '../screens/HomeScreen';
import NewEntryScreen from '../screens/journal/NewEntryScreen';
import JournalListScreen from '../screens/journal/JournalListScreen';
import EntryDetailScreen from '../screens/journal/EntryDetailScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import SettingsScreen from '../screens/profile/SettingsScreen';
import GoalsScreen from '../screens/goals/GoalsScreen';
import GoalDetailScreen from '../screens/goals/GoalDetailScreen';
import BadgesScreen from '../screens/gamification/BadgesScreen';
import LeaderboardScreen from '../screens/gamification/LeaderboardScreen';
import AnalyticsScreen from '../screens/analytics/AnalyticsScreen';
import InsightsScreen from '../screens/analytics/InsightsScreen';
import SocialFeedScreen from '../screens/social/SocialFeedScreen';
import FriendsScreen from '../screens/social/FriendsScreen';
import ChallengesScreen from '../screens/community/ChallengesScreen';
import FamilyJournalScreen from '../screens/community/FamilyJournalScreen';
import PremiumScreen from '../screens/premium/PremiumScreen';
import AICoachScreen from '../screens/ai/AICoachScreen';
import ExportScreen from '../screens/export/ExportScreen';
import NFTGalleryScreen from '../screens/nft/NFTGalleryScreen';
import RemindersScreen from '../screens/reminders/RemindersScreen';

export type RootStackParamList = {
  Onboarding: undefined;
  Auth: undefined;
  Main: undefined;
  NewEntry: { editEntry?: any };
  EntryDetail: { entryId: string };
  GoalDetail: { goalId: string };
  Premium: undefined;
  AICoach: undefined;
  Export: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Journal: undefined;
  Goals: undefined;
  Social: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();
const Drawer = createDrawerNavigator();

// Auth Stack Navigator
function AuthNavigator() {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
      <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </AuthStack.Navigator>
  );
}

// Bottom Tab Navigator
function MainTabNavigator() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Journal':
              iconName = focused ? 'book' : 'book-outline';
              break;
            case 'Goals':
              iconName = focused ? 'target' : 'target-variant';
              break;
            case 'Social':
              iconName = focused ? 'account-group' : 'account-group-outline';
              break;
            case 'Profile':
              iconName = focused ? 'account' : 'account-outline';
              break;
            default:
              iconName = 'help';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: isDark ? '#888' : '#666',
        tabBarStyle: {
          backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
          borderTopColor: isDark ? '#333' : '#E0E0E0',
          paddingBottom: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen
        name="Journal"
        component={JournalListScreen}
        options={{ tabBarLabel: 'Journal' }}
      />
      <Tab.Screen
        name="Goals"
        component={GoalsScreen}
        options={{ tabBarLabel: 'Goals' }}
      />
      <Tab.Screen
        name="Social"
        component={SocialFeedScreen}
        options={{ tabBarLabel: 'Social' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
}

// Drawer Navigator (Side Menu)
function DrawerNavigator() {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: true,
        drawerActiveTintColor: '#4CAF50',
        drawerInactiveTintColor: '#666',
        drawerLabelStyle: {
          fontSize: 16,
          fontWeight: '600',
        },
      }}
    >
      <Drawer.Screen
        name="MainTabs"
        component={MainTabNavigator}
        options={{
          title: 'Gratitude Journal',
          drawerLabel: 'Home',
          drawerIcon: ({ color, size }) => (
            <Icon name="home" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Badges"
        component={BadgesScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Icon name="trophy" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Leaderboard"
        component={LeaderboardScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Icon name="chart-line" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Analytics"
        component={AnalyticsScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Icon name="chart-bar" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Insights"
        component={InsightsScreen}
        options={{
          title: 'AI Insights',
          drawerIcon: ({ color, size }) => (
            <Icon name="lightbulb" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Friends"
        component={FriendsScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Icon name="account-multiple" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Challenges"
        component={ChallengesScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Icon name="trophy-variant" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="FamilyJournal"
        component={FamilyJournalScreen}
        options={{
          title: 'Family Journal',
          drawerIcon: ({ color, size }) => (
            <Icon name="home-heart" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="NFTGallery"
        component={NFTGalleryScreen}
        options={{
          title: 'NFT Gallery',
          drawerIcon: ({ color, size }) => (
            <Icon name="image-multiple" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Reminders"
        component={RemindersScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Icon name="bell" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Icon name="cog" size={size} color={color} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
}

// Root Stack Navigator
function RootNavigator() {
  const [isFirstLaunch, setIsFirstLaunch] = React.useState<boolean | null>(null);
  const [isAuthenticated, setIsAuthenticated] = React.useState<boolean>(false);

  React.useEffect(() => {
    checkFirstLaunch();
    checkAuthStatus();
  }, []);

  const checkFirstLaunch = async () => {
    try {
      const hasLaunched = await AsyncStorage.getItem('hasLaunched');
      setIsFirstLaunch(hasLaunched === null);
    } catch (error) {
      console.error('Error checking first launch:', error);
      setIsFirstLaunch(false);
    }
  };

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      setIsAuthenticated(!!token);
    } catch (error) {
      console.error('Error checking auth status:', error);
      setIsAuthenticated(false);
    }
  };

  if (isFirstLaunch === null) {
    return null; // Or a loading screen
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}
    >
      {isFirstLaunch && (
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      )}
      {!isAuthenticated ? (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : (
        <>
          <Stack.Screen name="Main" component={DrawerNavigator} />
          <Stack.Screen
            name="NewEntry"
            component={NewEntryScreen}
            options={{
              presentation: 'modal',
              headerShown: true,
              title: 'New Entry',
            }}
          />
          <Stack.Screen
            name="EntryDetail"
            component={EntryDetailScreen}
            options={{
              headerShown: true,
              title: 'Entry',
            }}
          />
          <Stack.Screen
            name="GoalDetail"
            component={GoalDetailScreen}
            options={{
              headerShown: true,
              title: 'Goal',
            }}
          />
          <Stack.Screen
            name="Premium"
            component={PremiumScreen}
            options={{
              presentation: 'modal',
              headerShown: true,
              title: 'Premium',
            }}
          />
          <Stack.Screen
            name="AICoach"
            component={AICoachScreen}
            options={{
              headerShown: true,
              title: 'AI Coach',
            }}
          />
          <Stack.Screen
            name="Export"
            component={ExportScreen}
            options={{
              headerShown: true,
              title: 'Export',
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}

// Main App Navigator
export default function AppNavigator() {
  const colorScheme = useColorScheme();

  const theme = {
    dark: colorScheme === 'dark',
    colors: {
      primary: '#4CAF50',
      background: colorScheme === 'dark' ? '#121212' : '#F5F5F5',
      card: colorScheme === 'dark' ? '#1E1E1E' : '#FFFFFF',
      text: colorScheme === 'dark' ? '#FFFFFF' : '#000000',
      border: colorScheme === 'dark' ? '#333333' : '#E0E0E0',
      notification: '#FF5722',
    },
  };

  return (
    <NavigationContainer theme={theme}>
      <RootNavigator />
    </NavigationContainer>
  );
}
