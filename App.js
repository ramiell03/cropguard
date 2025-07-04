import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';

import HomeScreen from './screens/HomeScreen';
import UploadScreen from './screens/UploadScreen';
import ReportsScreen from './screens/ReportsScreen';
import HistoryScreen from './screens/HistoryScreen';
import SettingsScreen from './screens/SettingsScreen';
import ResultScreen from './screens/ResultScreen';
import PrivacyPolicyScreen from './screens/PrivacyPolicyScreen';
import { ThemeProvider } from './theme/ThemeContext';
import TermsOfServiceScreen from './screens/TermsOfServiceScreen';
import 'react-native-gesture-handler';


const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          switch (route.name) {
            case 'Home':
              return <MaterialIcons name="home" size={size} color={color} />;
            case 'Upload':
              return <FontAwesome5 name="upload" size={size} color={color} />;
            case 'Reports':
              return <FontAwesome5 name="file-alt" size={size} color={color} />;
            case 'History':
              return <MaterialIcons name="history" size={size} color={color} />;
            case 'Settings':
              return <MaterialIcons name="settings" size={size} color={color} />;
            default:
              return null;
          }
        },
        tabBarActiveTintColor: '#F2C94C',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Upload" component={UploadScreen} />
      <Tab.Screen name="Reports" component={ReportsScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen name="Result" component={ResultScreen} />
          <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
          <Stack.Screen name="TermsOfService" component={TermsOfServiceScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  );
}
