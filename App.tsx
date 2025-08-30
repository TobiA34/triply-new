import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SetupScreen } from './src/screens/SetupScreen';

export default function App() {
  return (
    <SafeAreaProvider>
      <SetupScreen />
    </SafeAreaProvider>
  );
}