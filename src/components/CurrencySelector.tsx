import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useCurrency, CURRENCIES, Currency } from '../contexts/CurrencyContext';

interface CurrencySelectorProps {
  visible: boolean;
  onClose: () => void;
}

export const CurrencySelector: React.FC<CurrencySelectorProps> = ({ visible, onClose }) => {
  const { currency, setCurrency } = useCurrency();
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(currency);

  const handleSave = () => {
    setCurrency(selectedCurrency);
    onClose();
  };

  const handleCancel = () => {
    setSelectedCurrency(currency);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleCancel}>
            <Text style={styles.cancelButton}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Select Currency</Text>
          <TouchableOpacity onPress={handleSave}>
            <Text style={styles.saveButton}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {Object.values(CURRENCIES).map((curr) => (
            <TouchableOpacity
              key={curr.code}
              style={[
                styles.currencyItem,
                selectedCurrency.code === curr.code && styles.selectedCurrency
              ]}
              onPress={() => setSelectedCurrency(curr)}
            >
              <View style={styles.currencyInfo}>
                <Text style={styles.currencySymbol}>{curr.symbol}</Text>
                <View style={styles.currencyDetails}>
                  <Text style={styles.currencyCode}>{curr.code}</Text>
                  <Text style={styles.currencyName}>{curr.name}</Text>
                </View>
              </View>
              {selectedCurrency.code === curr.code && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  cancelButton: {
    fontSize: 16,
    color: '#6B7280',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  saveButton: {
    fontSize: 16,
    color: '#4285F4',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  currencyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedCurrency: {
    borderColor: '#4285F4',
    backgroundColor: '#F0F7FF',
  },
  currencyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: '600',
    color: '#111827',
    marginRight: 12,
    minWidth: 40,
  },
  currencyDetails: {
    flex: 1,
  },
  currencyCode: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  currencyName: {
    fontSize: 14,
    color: '#6B7280',
  },
  checkmark: {
    fontSize: 20,
    color: '#4285F4',
    fontWeight: '600',
  },
});
