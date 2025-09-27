import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Currency = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CAD' | 'AUD' | 'CHF' | 'CNY' | 'INR' | 'BRL';

export interface CurrencyInfo {
  code: Currency;
  name: string;
  symbol: string;
}

export const CURRENCIES: CurrencyInfo[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
];

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatAmount: (amount: number) => string;
  convertAmount: (amount: number, fromCurrency: Currency, toCurrency: Currency) => number;
  getCurrencySymbol: (currency: Currency) => string;
  getCurrencyInfo: (currency: Currency) => CurrencyInfo;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

// Exchange rates (simplified - in a real app, these would be fetched from an API)
const exchangeRates: Record<Currency, number> = {
  USD: 1.0,
  EUR: 0.85,
  GBP: 0.73,
  JPY: 110.0,
  CAD: 1.25,
  AUD: 1.35,
  CHF: 0.92,
  CNY: 6.45,
  INR: 74.0,
  BRL: 5.2,
};

const currencySymbols: Record<Currency, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  CAD: 'C$',
  AUD: 'A$',
  CHF: 'CHF',
  CNY: '¥',
  INR: '₹',
  BRL: 'R$',
};

interface CurrencyProviderProps {
  children: ReactNode;
}

export const CurrencyProvider: React.FC<CurrencyProviderProps> = ({ children }) => {
  const [currency, setCurrencyState] = useState<Currency>('USD');

  useEffect(() => {
    loadCurrency();
  }, []);

  const loadCurrency = async () => {
    try {
      const savedCurrency = await AsyncStorage.getItem('currency');
      if (savedCurrency && Object.keys(exchangeRates).includes(savedCurrency)) {
        setCurrencyState(savedCurrency as Currency);
      }
    } catch (error) {
      console.error('Failed to load currency:', error);
    }
  };

  const setCurrency = async (newCurrency: Currency) => {
    try {
      setCurrencyState(newCurrency);
      await AsyncStorage.setItem('currency', newCurrency);
    } catch (error) {
      console.error('Failed to save currency:', error);
    }
  };

  const formatAmount = (amount: number): string => {
    const symbol = currencySymbols[currency];
    const formattedAmount = amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return `${symbol}${formattedAmount}`;
  };

  const convertAmount = (amount: number, fromCurrency: Currency, toCurrency: Currency): number => {
    if (fromCurrency === toCurrency) return amount;
    
    // Convert to USD first, then to target currency
    const usdAmount = amount / exchangeRates[fromCurrency];
    return usdAmount * exchangeRates[toCurrency];
  };

  const getCurrencySymbol = (currency: Currency): string => {
    return currencySymbols[currency];
  };

  const getCurrencyInfo = (currency: Currency): CurrencyInfo => {
    return CURRENCIES.find(c => c.code === currency) || CURRENCIES[0];
  };

  const value: CurrencyContextType = {
    currency,
    setCurrency,
    formatAmount,
    convertAmount,
    getCurrencySymbol,
    getCurrencyInfo,
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};