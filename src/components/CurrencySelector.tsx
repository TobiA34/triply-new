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
import { useCurrency, CURRENCIES, Currency, CurrencyInfo } from '../contexts/CurrencyContext';
import { useThemeColors } from '../hooks/useThemeColors';

interface CurrencySelectorProps {
  visible: boolean;
  onClose: () => void;
}

export const CurrencySelector: React.FC<CurrencySelectorProps> = ({ visible, onClose }) => {
  const { currency, setCurrency, getCurrencyInfo } = useCurrency();
  const colors = useThemeColors();
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyInfo>(getCurrencyInfo(currency));

  const handleSave = () => {
    setCurrency(selectedCurrency.code);
    onClose();
  };

  const handleCancel = () => {
    setSelectedCurrency(getCurrencyInfo(currency));
    onClose();
  };

  const styles = createStyles(colors);

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

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.paper,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    backgroundColor: colors.surface.primary,
  },
  cancelButton: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
  },
  saveButton: {
    fontSize: 16,
    color: colors.primary.main,
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
    backgroundColor: colors.surface.primary,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  selectedCurrency: {
    borderColor: colors.primary.main,
    backgroundColor: colors.primary.light + '20',
  },
  currencyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text.primary,
    marginRight: 12,
    minWidth: 40,
  },
  currencyDetails: {
    flex: 1,
  },
  currencyCode: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 2,
  },
  currencyName: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  checkmark: {
    fontSize: 20,
    color: colors.primary.main,
    fontWeight: '600',
  },
});
