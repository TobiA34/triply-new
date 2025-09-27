import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { LocalizationProvider } from './src/contexts/LocalizationContext';
import { CurrencyProvider } from './src/contexts/CurrencyContext';
import { CompactModeProvider } from './src/contexts/CompactModeContext';
import { AccessibilityProvider } from './src/contexts/AccessibilityContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { databaseService } from './src/services/database';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function App() {
  const [isDatabaseReady, setIsDatabaseReady] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        await databaseService.init();
        setIsDatabaseReady(true);
      } catch (error) {
        console.error('Failed to initialize database:', error);
        setInitError(error instanceof Error ? error.message : 'Unknown error');
      }
    };

    initializeDatabase();
  }, []);

  if (!isDatabaseReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 16, fontSize: 16, color: '#333' }}>
          {initError ? `Error: ${initError}` : 'Initializing database...'}
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <LocalizationProvider>
          <CurrencyProvider>
            <CompactModeProvider>
              <AccessibilityProvider>
                <RootNavigator />
              </AccessibilityProvider>
            </CompactModeProvider>
          </CurrencyProvider>
        </LocalizationProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
