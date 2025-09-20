import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useCurrency, CURRENCIES, Currency } from '../contexts/CurrencyContext';

export const SettingsScreen = () => {
  const { currency, setCurrency } = useCurrency();
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(currency);

  const handleSave = () => {
    setCurrency(selectedCurrency);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>⚙️ Settings</Text>
          <Text style={styles.subtitle}>Customize your app preferences</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Currency Settings</Text>
          <Text style={styles.sectionDescription}>
            Choose your preferred currency for displaying prices and budgets throughout the app.
          </Text>

          <View style={styles.currentCurrency}>
            <Text style={styles.currentCurrencyLabel}>Current Currency:</Text>
            <View style={styles.currentCurrencyDisplay}>
              <Text style={styles.currentCurrencySymbol}>{currency.symbol}</Text>
              <View style={styles.currentCurrencyInfo}>
                <Text style={styles.currentCurrencyCode}>{currency.code}</Text>
                <Text style={styles.currentCurrencyName}>{currency.name}</Text>
              </View>
            </View>
          </View>

          <View style={styles.currencyGrid}>
            {Object.values(CURRENCIES).map((curr) => (
              <TouchableOpacity
                key={curr.code}
                style={[
                  styles.currencyCard,
                  selectedCurrency.code === curr.code && styles.selectedCurrencyCard
                ]}
                onPress={() => setSelectedCurrency(curr)}
              >
                <Text style={styles.currencyCardSymbol}>{curr.symbol}</Text>
                <Text style={styles.currencyCardCode}>{curr.code}</Text>
                <Text style={styles.currencyCardName}>{curr.name}</Text>
                {selectedCurrency.code === curr.code && (
                  <View style={styles.checkmarkContainer}>
                    <Text style={styles.checkmark}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[
              styles.saveButton,
              selectedCurrency.code === currency.code && styles.saveButtonDisabled
            ]}
            onPress={handleSave}
            disabled={selectedCurrency.code === currency.code}
          >
            <Text style={[
              styles.saveButtonText,
              selectedCurrency.code === currency.code && styles.saveButtonTextDisabled
            ]}>
              {selectedCurrency.code === currency.code ? 'No Changes' : 'Save Currency'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.sectionDescription}>
            Triply - Your personal travel planning assistant
          </Text>
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 18,
    color: '#6B7280',
    textAlign: 'center',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
    marginBottom: 24,
  },
  currentCurrency: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  currentCurrencyLabel: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 12,
    fontWeight: '500',
  },
  currentCurrencyDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currentCurrencySymbol: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
    marginRight: 16,
  },
  currentCurrencyInfo: {
    flex: 1,
  },
  currentCurrencyCode: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  currentCurrencyName: {
    fontSize: 16,
    color: '#6B7280',
  },
  currencyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  currencyCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    width: '30%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    position: 'relative',
  },
  selectedCurrencyCard: {
    borderColor: '#4285F4',
    backgroundColor: '#F0F7FF',
  },
  currencyCardSymbol: {
    fontSize: 24,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  currencyCardCode: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  currencyCardName: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  checkmarkContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#4285F4',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#4285F4',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonTextDisabled: {
    color: '#9CA3AF',
  },
  versionText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 8,
  },
});
