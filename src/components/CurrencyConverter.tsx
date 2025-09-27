import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import { getExchangeRateApiUrl } from '../config/api';

interface Currency {
  code: string;
  name: string;
  symbol: string;
  flag: string;
}

interface ExchangeRate {
  from: string;
  to: string;
  rate: number;
  lastUpdated: string;
}

interface CurrencyConverterProps {
  destination: string;
  onRefresh?: () => void;
}

const CURRENCIES: Currency[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
  { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', flag: '🇨🇦' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', flag: '🇨🇭' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', flag: '🇧🇷' },
  { code: 'MXN', name: 'Mexican Peso', symbol: '$', flag: '🇲🇽' },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩', flag: '🇰🇷' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', flag: '🇸🇬' },
  { code: 'THB', name: 'Thai Baht', symbol: '฿', flag: '🇹🇭' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', flag: '🇦🇪' },
];

// Real exchange rates from ExchangeRate-API

export const CurrencyConverter: React.FC<CurrencyConverterProps> = ({ destination, onRefresh }) => {
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [amount, setAmount] = useState('100');
  const [convertedAmount, setConvertedAmount] = useState('0');
  const [exchangeRate, setExchangeRate] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCurrencyPicker, setShowCurrencyPicker] = useState<'from' | 'to' | null>(null);

  // Get destination currency based on location
  const getDestinationCurrency = (dest: string): string => {
    const currencyMap: { [key: string]: string } = {
      'germany': 'EUR',
      'france': 'EUR',
      'spain': 'EUR',
      'italy': 'EUR',
      'netherlands': 'EUR',
      'austria': 'EUR',
      'united kingdom': 'GBP',
      'london': 'GBP',
      'japan': 'JPY',
      'tokyo': 'JPY',
      'kyoto': 'JPY',
      'canada': 'CAD',
      'toronto': 'CAD',
      'australia': 'AUD',
      'sydney': 'AUD',
      'switzerland': 'CHF',
      'china': 'CNY',
      'beijing': 'CNY',
      'india': 'INR',
      'brazil': 'BRL',
      'rio de janeiro': 'BRL',
      'mexico': 'MXN',
      'mexico city': 'MXN',
      'south korea': 'KRW',
      'seoul': 'KRW',
      'singapore': 'SGD',
      'thailand': 'THB',
      'bangkok': 'THB',
      'united arab emirates': 'AED',
      'dubai': 'AED',
    };
    
    const normalizedDest = dest.toLowerCase();
    return currencyMap[normalizedDest] || 'EUR';
  };

  const fetchExchangeRate = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch exchange rates from the API
      const response = await fetch(`${getExchangeRateApiUrl()}/${fromCurrency}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch exchange rates');
      }
      
      const data = await response.json();
      
      // Get the rate for the target currency
      const rate = data.rates[toCurrency];
      
      if (!rate) {
        throw new Error(`Exchange rate not available for ${toCurrency}`);
      }
      
      setExchangeRate(rate);
      calculateConversion(amount, rate);
    } catch (err) {
      console.error('Currency API Error:', err);
      setError('Failed to fetch exchange rates. Please check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  const calculateConversion = (inputAmount: string, rate: number) => {
    const numAmount = parseFloat(inputAmount) || 0;
    const converted = (numAmount * rate).toFixed(2);
    setConvertedAmount(converted);
  };

  useEffect(() => {
    if (destination) {
      const destCurrency = getDestinationCurrency(destination);
      setToCurrency(destCurrency);
    }
  }, [destination]);

  useEffect(() => {
    if (fromCurrency && toCurrency) {
      fetchExchangeRate();
    }
  }, [fromCurrency, toCurrency]);

  useEffect(() => {
    if (exchangeRate > 0) {
      calculateConversion(amount, exchangeRate);
    }
  }, [amount, exchangeRate]);

  const handleAmountChange = (text: string) => {
    // Only allow numbers and decimal point
    const cleanText = text.replace(/[^0-9.]/g, '');
    setAmount(cleanText);
  };

  const swapCurrencies = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
  };

  const selectCurrency = (currency: Currency, type: 'from' | 'to') => {
    if (type === 'from') {
      setFromCurrency(currency.code);
    } else {
      setToCurrency(currency.code);
    }
    setShowCurrencyPicker(null);
  };

  const formatCurrency = (amount: string, currencyCode: string) => {
    const currency = CURRENCIES.find(c => c.code === currencyCode);
    const symbol = currency?.symbol || currencyCode;
    return `${symbol}${amount}`;
  };

  if (!destination) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Ionicons name="cash" size={24} color={colors.text.secondary} />
          <Text style={styles.title}>Currency Converter</Text>
        </View>
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>Select a destination to see currency conversion</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="cash" size={24} color={colors.primary.main} />
        <Text style={styles.title}>Currency Converter</Text>
        <TouchableOpacity onPress={fetchExchangeRate} style={styles.refreshButton}>
          <Ionicons name="refresh" size={20} color={colors.primary.main} />
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.primary.main} />
          <Text style={styles.loadingText}>Updating rates...</Text>
        </View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="warning" size={16} color={colors.status.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Currency Selection */}
      <View style={styles.currencySelection}>
        <View style={styles.currencyRow}>
          <Text style={styles.currencyLabel}>From</Text>
          <TouchableOpacity 
            style={styles.currencyButton}
            onPress={() => setShowCurrencyPicker('from')}
          >
            <Text style={styles.currencyFlag}>
              {CURRENCIES.find(c => c.code === fromCurrency)?.flag}
            </Text>
            <Text style={styles.currencyCode}>{fromCurrency}</Text>
            <Ionicons name="chevron-down" size={16} color={colors.text.secondary} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.swapButton} onPress={swapCurrencies}>
          <Ionicons name="swap-horizontal" size={24} color={colors.primary.main} />
        </TouchableOpacity>

        <View style={styles.currencyRow}>
          <Text style={styles.currencyLabel}>To</Text>
          <TouchableOpacity 
            style={styles.currencyButton}
            onPress={() => setShowCurrencyPicker('to')}
          >
            <Text style={styles.currencyFlag}>
              {CURRENCIES.find(c => c.code === toCurrency)?.flag}
            </Text>
            <Text style={styles.currencyCode}>{toCurrency}</Text>
            <Ionicons name="chevron-down" size={16} color={colors.text.secondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Amount Input */}
      <View style={styles.amountContainer}>
        <Text style={styles.amountLabel}>Amount</Text>
        <View style={styles.amountInputContainer}>
          <Text style={styles.currencySymbol}>
            {CURRENCIES.find(c => c.code === fromCurrency)?.symbol}
          </Text>
          <TextInput
            style={styles.amountInput}
            value={amount}
            onChangeText={handleAmountChange}
            placeholder="0.00"
            keyboardType="numeric"
            placeholderTextColor={colors.text.tertiary}
          />
        </View>
      </View>

      {/* Conversion Result */}
      <View style={styles.resultContainer}>
        <Text style={styles.resultLabel}>Converted Amount</Text>
        <Text style={styles.resultAmount}>
          {formatCurrency(convertedAmount, toCurrency)}
        </Text>
        <Text style={styles.exchangeRate}>
          1 {fromCurrency} = {exchangeRate.toFixed(4)} {toCurrency}
        </Text>
      </View>

      {/* Currency Picker Modal */}
      {showCurrencyPicker && (
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerContainer}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>
                Select {showCurrencyPicker === 'from' ? 'From' : 'To'} Currency
              </Text>
              <TouchableOpacity onPress={() => setShowCurrencyPicker(null)}>
                <Ionicons name="close" size={24} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.currencyList}>
              {CURRENCIES.map((currency) => (
                <TouchableOpacity
                  key={currency.code}
                  style={[
                    styles.currencyItem,
                    (showCurrencyPicker === 'from' ? fromCurrency : toCurrency) === currency.code && styles.selectedCurrency
                  ]}
                  onPress={() => selectCurrency(currency, showCurrencyPicker)}
                >
                  <Text style={styles.currencyItemFlag}>{currency.flag}</Text>
                  <View style={styles.currencyItemInfo}>
                    <Text style={styles.currencyItemCode}>{currency.code}</Text>
                    <Text style={styles.currencyItemName}>{currency.name}</Text>
                  </View>
                  {(showCurrencyPicker === 'from' ? fromCurrency : toCurrency) === currency.code && (
                    <Ionicons name="checkmark" size={20} color={colors.primary.main} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography?.fontSize?.lg || 18,
      fontFamily: typography?.fontFamily?.semibold || 'System',
    color: colors.text.primary,
    marginLeft: spacing.sm,
    flex: 1,
  },
  refreshButton: {
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface.secondary,
  },
  placeholder: {
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
  },
  placeholderText: {
    fontSize: typography?.fontSize?.base || 16,
      fontFamily: typography?.fontFamily?.regular || 'System',
    color: colors.text.secondary,
    textAlign: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  loadingText: {
    fontSize: typography?.fontSize?.sm || 14,
      fontFamily: typography?.fontFamily?.regular || 'System',
    color: colors.text.secondary,
    marginLeft: spacing.sm,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.status.error + '20',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  errorText: {
    fontSize: typography?.fontSize?.sm || 14,
      fontFamily: typography?.fontFamily?.regular || 'System',
    color: colors.status.error,
    marginLeft: spacing.sm,
    flex: 1,
  },
  currencySelection: {
    marginBottom: spacing.lg,
  },
  currencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  currencyLabel: {
    fontSize: typography?.fontSize?.base || 16,
      fontFamily: typography?.fontFamily?.medium || 'System',
    color: colors.text.primary,
    flex: 1,
  },
  currencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface.secondary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    minWidth: 120,
  },
  currencyFlag: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  currencyCode: {
    fontSize: typography?.fontSize?.base || 16,
      fontFamily: typography?.fontFamily?.semibold || 'System',
    color: colors.text.primary,
    flex: 1,
  },
  swapButton: {
    alignSelf: 'center',
    backgroundColor: colors.surface.secondary,
    padding: spacing.sm,
    borderRadius: borderRadius.full,
    marginVertical: spacing.sm,
  },
  amountContainer: {
    marginBottom: spacing.lg,
  },
  amountLabel: {
    fontSize: typography?.fontSize?.base || 16,
      fontFamily: typography?.fontFamily?.medium || 'System',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface.secondary,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
  },
  currencySymbol: {
    fontSize: typography?.fontSize?.lg || 18,
      fontFamily: typography?.fontFamily?.semibold || 'System',
    color: colors.text.primary,
    marginRight: spacing.sm,
  },
  amountInput: {
    flex: 1,
    fontSize: typography?.fontSize?.lg || 18,
      fontFamily: typography?.fontFamily?.regular || 'System',
    color: colors.text.primary,
    paddingVertical: spacing.md,
  },
  resultContainer: {
    alignItems: 'center',
    backgroundColor: colors.primary.main + '10',
    padding: spacing.lg,
    borderRadius: borderRadius.md,
  },
  resultLabel: {
    fontSize: typography?.fontSize?.sm || 14,
      fontFamily: typography?.fontFamily?.medium || 'System',
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  resultAmount: {
    fontSize: typography?.fontSize?.['3xl'] || 28,
      fontFamily: typography?.fontFamily?.bold || 'System',
    color: colors.primary.main,
    marginBottom: spacing.sm,
  },
  exchangeRate: {
    fontSize: typography?.fontSize?.sm || 14,
      fontFamily: typography?.fontFamily?.regular || 'System',
    color: colors.text.secondary,
  },
  pickerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  pickerContainer: {
    backgroundColor: colors.surface.primary,
    borderRadius: borderRadius.lg,
    margin: spacing.lg,
    maxHeight: '70%',
    width: '90%',
    ...shadows.xl,
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  pickerTitle: {
    fontSize: typography?.fontSize?.lg || 18,
      fontFamily: typography?.fontFamily?.semibold || 'System',
    color: colors.text.primary,
  },
  currencyList: {
    maxHeight: 300,
  },
  currencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  selectedCurrency: {
    backgroundColor: colors.primary.main + '10',
  },
  currencyItemFlag: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  currencyItemInfo: {
    flex: 1,
  },
  currencyItemCode: {
    fontSize: typography?.fontSize?.base || 16,
      fontFamily: typography?.fontFamily?.semibold || 'System',
    color: colors.text.primary,
  },
  currencyItemName: {
    fontSize: typography?.fontSize?.sm || 14,
      fontFamily: typography?.fontFamily?.regular || 'System',
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
});
