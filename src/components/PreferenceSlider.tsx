import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  PanResponder,
  Animated,
  LayoutRectangle,
  LayoutChangeEvent,
} from 'react-native';

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
  const [sliderLayout, setSliderLayout] = React.useState<LayoutRectangle | null>(null);
  const panValue = useRef(new Animated.Value(0)).current;
  const lastOffset = useRef(0);

  React.useEffect(() => {
    if (sliderLayout) {
      const percentage = ((value - min) / (max - min)) * 100;
      const newPosition = (percentage / 100) * sliderLayout.width;
      panValue.setValue(newPosition);
      lastOffset.current = newPosition;
    }
  }, [value, sliderLayout, min, max]);

  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        panValue.setOffset(lastOffset.current);
      },
      onPanResponderMove: (_, gestureState) => {
        if (sliderLayout) {
          const moveValue = lastOffset.current + gestureState.dx;
          const boundedValue = Math.min(
            Math.max(0, moveValue),
            sliderLayout.width
          );
          panValue.setValue(boundedValue - lastOffset.current);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (sliderLayout) {
          const releaseValue = lastOffset.current + gestureState.dx;
          const boundedValue = Math.min(
            Math.max(0, releaseValue),
            sliderLayout.width
          );
          lastOffset.current = boundedValue;
          const percentage = (boundedValue / sliderLayout.width) * 100;
          const calculatedValue = min + (percentage / 100) * (max - min);
          const steppedValue = Math.round(calculatedValue / step) * step;
          onValueChange(Math.max(min, Math.min(max, steppedValue)));
          if (onBlur) onBlur();
        }
      },
    })
  ).current;

  const handleLayout = (event: LayoutChangeEvent) => {
    const layout = event.nativeEvent.layout;
    setSliderLayout(layout);
    const percentage = ((value - min) / (max - min)) * 100;
    const initialPosition = (percentage / 100) * layout.width;
    panValue.setValue(initialPosition);
    lastOffset.current = initialPosition;
  };

  const animatedStyle = {
    transform: [{ translateX: panValue }],
  };

  const percentage = ((value - min) / (max - min)) * 100;
  const trackWidth = `${percentage}%`;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}{unit}</Text>
      </View>
      <View 
        style={styles.sliderContainer}
        onLayout={handleLayout}
      >
        <View style={styles.track}>
          <View style={[styles.fill, { width: trackWidth }]} />
          <Animated.View
            style={[styles.thumb, animatedStyle]}
            {...panResponder.panHandlers}
          />
        </View>
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
    height: 20,
    justifyContent: 'center',
  },
  track: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    position: 'relative',
  },
  fill: {
    position: 'absolute',
    height: '100%',
    backgroundColor: '#4285F4',
    borderRadius: 2,
  },
  thumb: {
    position: 'absolute',
    width: 20,
    height: 20,
    backgroundColor: '#4285F4',
    borderRadius: 10,
    top: -8,
    marginLeft: -10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
  },
});