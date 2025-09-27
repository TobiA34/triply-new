import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isDark: boolean;
  isLoaded: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('light'); // Start with light theme as default
  const [isLoaded, setIsLoaded] = useState(false); // Start as not loaded

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
        setTheme(savedTheme as Theme);
      } else {
        // If no saved theme, default to light
        setTheme('light');
      }
    } catch (error) {
      console.error('Failed to load theme:', error);
      // Keep the default theme on error
      setTheme('light');
    } finally {
      setIsLoaded(true);
    }
  };

  const toggleTheme = async () => {
    try {
      const newTheme = theme === 'light' ? 'dark' : 'light';
      console.log('ThemeContext: Toggling theme from', theme, 'to', newTheme);
      setTheme(newTheme);
      await AsyncStorage.setItem('theme', newTheme);
      console.log('ThemeContext: Theme saved to AsyncStorage');
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  };

  const value: ThemeContextType = {
    theme,
    toggleTheme,
    isDark: theme === 'dark',
    isLoaded,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  try {
    const context = useContext(ThemeContext);
    if (context === undefined) {
      console.error('useTheme must be used within a ThemeProvider');
      // Return a default context to prevent crashes
      return {
        theme: 'dark',
        toggleTheme: () => {},
        isDark: true,
        isLoaded: true, // Assume loaded for fallback
      };
    }
    return context;
  } catch (error) {
    console.error('Error in useTheme:', error);
    // Return a default context to prevent crashes
    return {
      theme: 'dark',
      toggleTheme: () => {},
      isDark: true,
      isLoaded: true,
    };
  }
};
