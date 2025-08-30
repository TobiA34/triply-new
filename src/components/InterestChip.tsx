import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface InterestChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

export const InterestChip: React.FC<InterestChipProps> = ({
  label,
  selected,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={[styles.container, selected && styles.selected]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.label, selected && styles.selectedLabel]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 8,
    marginBottom: 8,
  },
  selected: {
    backgroundColor: '#4285F4',
    borderColor: '#4285F4',
  },
  label: {
    fontSize: 16,
    color: '#333',
  },
  selectedLabel: {
    color: '#FFF',
  },
});
