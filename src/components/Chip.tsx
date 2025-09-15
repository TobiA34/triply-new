import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors, typography } from '../theme';

interface ChipProps {
  label: string;
  onPress?: () => void;
  selected?: boolean;
}

export const Chip: React.FC<ChipProps> = ({ label, onPress, selected = false }) => {
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
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.background.paper,
    marginRight: 8,
  },
  selected: {
    backgroundColor: colors.primary.main,
  },
  label: {
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    fontFamily: typography.fontFamily.medium,
  },
  selectedLabel: {
    color: colors.primary.contrastText,
  },
});
