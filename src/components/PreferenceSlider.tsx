import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';

interface PreferenceSliderProps {
  label: string;
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  onBlur?: () => void;
  error?: string;
  description?: string;
}

export const PreferenceSlider: React.FC<PreferenceSliderProps> = ({
  label,
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  unit = '',
  onBlur,
  error,
  description,
}) => {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.labelContainer}>
          <Text style={styles.label}>{label}</Text>
          {description && <Text style={styles.description}>{description}</Text>}
        </View>
        <View style={styles.valueContainer}>
          <Text style={styles.value}>{value}{unit}</Text>
          <View style={styles.percentageBar}>
            <View style={[styles.percentageFill, { width: `${percentage}%` }]} />
          </View>
        </View>
      </View>
      <View style={styles.sliderContainer}>
        <Slider
          style={styles.nativeSlider}
          minimumValue={min}
          maximumValue={max}
          step={step}
          value={value}
          minimumTrackTintColor={colors.primary.main}
          maximumTrackTintColor={colors.border.light}
          thumbTintColor={colors.primary.main}
          onValueChange={(v) => onValueChange(v)}
          onSlidingComplete={() => onBlur && onBlur()}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    width: '100%',
    ...shadows.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  labelContainer: {
    flex: 1,
    marginRight: spacing.md,
  },
  label: {
    fontSize: typography?.fontSize?.base || 16,
      fontFamily: typography?.fontFamily?.semibold || 'System',
    color: colors.text.primary,
    lineHeight: typography?.lineHeight?.base || 24,
  },
  description: {
    fontSize: typography?.fontSize?.sm || 14,
      fontFamily: typography?.fontFamily?.regular || 'System',
    color: colors.text.secondary,
    lineHeight: typography?.lineHeight?.sm || 20,
    marginTop: spacing.xs,
  },
  valueContainer: {
    alignItems: 'flex-end',
  },
  value: {
    fontSize: typography?.fontSize?.lg || 18,
      fontFamily: typography?.fontFamily?.bold || 'System',
    color: colors.primary.main,
    lineHeight: typography?.lineHeight?.lg || 28,
  },
  percentageBar: {
    width: 60,
    height: 4,
    backgroundColor: colors.border.light,
    borderRadius: borderRadius.sm,
    marginTop: spacing.xs,
    overflow: 'hidden',
  },
  percentageFill: {
    height: '100%',
    backgroundColor: colors.primary.main,
    borderRadius: borderRadius.sm,
  },
  sliderContainer: {
    height: 40,
    justifyContent: 'center',
  },
  nativeSlider: {
    width: '100%',
    height: 40,
  },
  errorText: {
    color: colors.status.error,
    fontSize: typography?.fontSize?.xs || 12,
      fontFamily: typography?.fontFamily?.medium || 'System',
    marginTop: spacing.sm,
    lineHeight: typography?.lineHeight?.xs || 16,
  },
});