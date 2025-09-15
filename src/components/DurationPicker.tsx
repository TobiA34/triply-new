import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';

interface DurationPickerProps {
  value: string;
  onChange: (duration: string) => void;
  error?: string;
}

export const DurationPicker: React.FC<DurationPickerProps> = ({ value, onChange, error }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(value || '1 hour');

  React.useEffect(() => {
    if (value) {
      setSelectedDuration(value);
    }
  }, [value]);

  const durationOptions = [
    '15 minutes',
    '30 minutes',
    '45 minutes',
    '1 hour',
    '1.5 hours',
    '2 hours',
    '2.5 hours',
    '3 hours',
    '4 hours',
    '5 hours',
    '6 hours',
    '8 hours',
    'Full day',
    'Multiple days',
  ];

  const handleConfirm = () => {
    onChange(selectedDuration);
    setIsVisible(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.input, error && styles.inputError]}
        onPress={() => setIsVisible(true)}
      >
        <Text style={[styles.inputText, !value && styles.placeholder]}>
          {value || 'Select duration'}
        </Text>
        <Text style={styles.arrow}>▼</Text>
      </TouchableOpacity>
      
      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal visible={isVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.header}>
              <TouchableOpacity onPress={() => setIsVisible(false)}>
                <Text style={styles.cancelButton}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.title}>Select Duration</Text>
              <TouchableOpacity onPress={handleConfirm}>
                <Text style={styles.confirmButton}>Done</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.optionsContainer}>
              {durationOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.optionItem,
                    selectedDuration === option && styles.selectedOption
                  ]}
                  onPress={() => setSelectedDuration(option)}
                >
                  <Text style={[
                    styles.optionText,
                    selectedDuration === option && styles.selectedOptionText
                  ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  inputError: {
    borderColor: '#EF4444',
  },
  inputText: {
    fontSize: 16,
    color: '#111827',
  },
  placeholder: {
    color: '#9CA3AF',
  },
  arrow: {
    fontSize: 12,
    color: '#6B7280',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34, // Safe area
    maxHeight: '70%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
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
  confirmButton: {
    fontSize: 16,
    color: '#4285F4',
    fontWeight: '600',
  },
  optionsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  optionItem: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginVertical: 2,
  },
  selectedOption: {
    backgroundColor: '#4285F4',
  },
  optionText: {
    fontSize: 16,
    color: '#374151',
  },
  selectedOptionText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
