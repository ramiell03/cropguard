import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define the light and dark theme color schemes
const lightTheme = {
  background: '#FFF9E5',
  text: '#333333',
  secondaryText: '#666666',
  card: '#FFFFFF',
  primary: '#F2C94C',
  primaryLight: '#F8E4A6',
  primaryDark: '#E6B800',
  success: '#4CAF50',
  warning: '#FFC107',
  danger: '#F44336',
  info: '#2196F3',
  buttonText: '#333333',
  buttonTextAlt: '#FFFFFF',
  shadow: '#000000',
  border: '#E0E0E0',
  confidenceLow: '#4CAF50',
  confidenceMedium: '#FFC107',
  confidenceHigh: '#FF9800',
  confidenceCritical: '#F44336',
};

const darkTheme = {
  background: '#121212',
  text: '#EEEEEE',
  secondaryText: '#AAAAAA',
  card: '#1E1E1E',
  primary: '#F2C94C',
  primaryLight: '#F8E4A6',
  primaryDark: '#E6B800',
  success: '#388E3C',
  warning: '#FFA000',
  danger: '#D32F2F',
  info: '#1976D2',
  buttonText: '#121212',
  buttonTextAlt: '#FFFFFF',
  shadow: '#000000',
  border: '#424242',
  confidenceLow: '#388E3C',
  confidenceMedium: '#FFA000',
  confidenceHigh: '#F57C00',
  confidenceCritical: '#D32F2F',
};

// Create the theme context
export const ThemeContext = createContext();

// ThemeProvider to wrap the app
export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);
  const [theme, setTheme] = useState(lightTheme);

  // Load theme preference on mount
  useEffect(() => {
    const loadTheme = async () => {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme === 'dark') {
        setTheme(darkTheme);
        setIsDark(true);
      } else {
        setTheme(lightTheme);
        setIsDark(false);
      }
    };
    loadTheme();
  }, []);

  // Toggle between light and dark themes
  const toggleTheme = async () => {
    if (isDark) {
      setTheme(lightTheme);
      setIsDark(false);
      await AsyncStorage.setItem('theme', 'light');
    } else {
      setTheme(darkTheme);
      setIsDark(true);
      await AsyncStorage.setItem('theme', 'dark');
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook for easier usage
export const useTheme = () => useContext(ThemeContext);
