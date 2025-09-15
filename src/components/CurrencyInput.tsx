import React from 'react';
import { TextInput, View, Text, StyleSheet } from 'react-native';

interface CurrencyInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  error?: string;
  style?: any;
}

export const CurrencyInput: React.FC<CurrencyInputProps> = ({
  value,
  onChangeText,
  onBlur,
  placeholder = "0.00",
  error,
  style,
}) => {
  const handleTextChange = (text: string) => {
    // Remove any non-numeric characters except decimal point
    let cleanText = text.replace(/[^0-9.]/g, '');
    
    // Ensure only one decimal point
    const decimalParts = cleanText.split('.');
    if (decimalParts.length > 2) {
      cleanText = decimalParts[0] + '.' + decimalParts.slice(1).join('');
    }
    
    // Limit to 2 decimal places
    if (decimalParts.length === 2 && decimalParts[1].length > 2) {
      cleanText = decimalParts[0] + '.' + decimalParts[1].substring(0, 2);
    }
    
    // If user deletes everything, allow empty string
    if (text === '') {
      cleanText = '';
    }
    
    // If user types a whole number and then moves away, add .00
    // But only if they haven't typed a decimal point
    if (cleanText && !cleanText.includes('.') && cleanText.length > 0) {
      // Don't auto-add .00 while typing, let user type naturally
    }
    
    onChangeText(cleanText);
  };

  const handleBlur = () => {
    // Auto-add .00 when user finishes typing a whole number
    if (value && !value.includes('.') && value.length > 0) {
      onChangeText(value + '.00');
    }
    onBlur?.();
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <Text style={styles.currencySymbol}>£</Text>
        <TextInput
          style={[styles.input, error && styles.inputError, style]}
          value={value}
          onChangeText={handleTextChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          keyboardType="numeric"
          placeholderTextColor="#9CA3AF"
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    padding: 0,
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
  },
});
