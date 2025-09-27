import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface CompactModeContextType {
  isCompactMode: boolean;
  toggleCompactMode: () => void;
  setCompactMode: (enabled: boolean) => void;
}

const CompactModeContext = createContext<CompactModeContextType | undefined>(undefined);

interface CompactModeProviderProps {
  children: ReactNode;
}

export const CompactModeProvider: React.FC<CompactModeProviderProps> = ({ children }) => {
  const [isCompactMode, setIsCompactMode] = useState(false);

  useEffect(() => {
    loadCompactMode();
  }, []);

  const loadCompactMode = async () => {
    try {
      const savedMode = await AsyncStorage.getItem('compactMode');
      if (savedMode !== null) {
        setIsCompactMode(JSON.parse(savedMode));
      }
    } catch (error) {
      console.error('Failed to load compact mode:', error);
    }
  };

  const toggleCompactMode = async () => {
    try {
      const newMode = !isCompactMode;
      setIsCompactMode(newMode);
      await AsyncStorage.setItem('compactMode', JSON.stringify(newMode));
    } catch (error) {
      console.error('Failed to save compact mode:', error);
    }
  };

  const setCompactMode = async (enabled: boolean) => {
    try {
      setIsCompactMode(enabled);
      await AsyncStorage.setItem('compactMode', JSON.stringify(enabled));
    } catch (error) {
      console.error('Failed to save compact mode:', error);
    }
  };

  const value: CompactModeContextType = {
    isCompactMode,
    toggleCompactMode,
    setCompactMode,
  };

  return (
    <CompactModeContext.Provider value={value}>
      {children}
    </CompactModeContext.Provider>
  );
};

export const useCompactMode = (): CompactModeContextType => {
  const context = useContext(CompactModeContext);
  if (context === undefined) {
    throw new Error('useCompactMode must be used within a CompactModeProvider');
  }
  return context;
};