import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';

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
}) => {
  // Library slider handles visuals; we just display label/value

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}{unit}</Text>
      </View>
      <View style={styles.sliderContainer}>
        <Slider
          style={styles.nativeSlider}
          minimumValue={min}
          maximumValue={max}
          step={step}
          value={value}
          minimumTrackTintColor="#4285F4"
          maximumTrackTintColor="#E5E7EB"
          thumbTintColor="#4285F4"
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
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    padding: 16,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  value: {
    fontSize: 14,
    color: '#4285F4',
    fontWeight: '500',
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
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
  },
});