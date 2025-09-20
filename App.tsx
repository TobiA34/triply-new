import React from 'react';
import { RootNavigator } from './src/navigation/RootNavigator';
import { CurrencyProvider } from './src/contexts/CurrencyContext';

export default function App() {
  return (
    <CurrencyProvider>
      <RootNavigator />
    </CurrencyProvider>
  );
}