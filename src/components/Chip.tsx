import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../theme';

interface ChipProps {
  label: string;
  onPress?: () => void;
  selected?: boolean;
  variant?: 'default' | 'outline' | 'subtle';
  size?: 'sm' | 'md' | 'lg';
}

export const Chip: React.FC<ChipProps> = ({ 
  label, 
  onPress, 
  selected = false, 
  variant = 'default',
  size = 'md' 
}) => {
  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          paddingHorizontal: spacing.sm,
          paddingVertical: spacing.xs,
          fontSize: typography.fontSize.xs,
        };
      case 'lg':
        return {
          paddingHorizontal: spacing.xl,
          paddingVertical: spacing.md,
          fontSize: typography.fontSize.base,
        };
      default:
        return {
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.sm,
          fontSize: typography.fontSize.sm,
        };
    }
  };

  const sizeStyles = getSizeStyles();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        styles[variant],
        selected && styles.selected,
        { paddingHorizontal: sizeStyles.paddingHorizontal, paddingVertical: sizeStyles.paddingVertical }
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[
        styles.label,
        { fontSize: sizeStyles.fontSize },
        selected && styles.selectedLabel
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.full,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  default: {
    backgroundColor: colors.surface.secondary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border.medium,
  },
  subtle: {
    backgroundColor: colors.surface.tertiary,
  },
  selected: {
    backgroundColor: colors.primary.main,
  },
  label: {
      fontFamily: typography?.fontFamily?.medium || 'System',
    color: colors.text.primary,
    lineHeight: typography.lineHeight.sm,
  },
  selectedLabel: {
    color: colors.primary.contrastText,
  },
});
