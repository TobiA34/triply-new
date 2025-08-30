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
  icon: string;
  label: string;
  value: number;
  onValueChange: (value: number) => void;
  valueLabel: string;
}

export const PreferenceSlider: React.FC<PreferenceSliderProps> = ({
  icon,
  label,
  value,
  onValueChange,
  valueLabel,
}) => {
  const [sliderLayout, setSliderLayout] = React.useState<LayoutRectangle | null>(null);
  const panValue = useRef(new Animated.Value(0)).current;
  const lastOffset = useRef(0);

  React.useEffect(() => {
    if (sliderLayout) {
      const newPosition = (value / 100) * sliderLayout.width;
      panValue.setValue(newPosition);
      lastOffset.current = newPosition;
    }
  }, [value, sliderLayout]);

  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        panValue.setOffset(lastOffset.current);
      },
      onPanResponderMove: (_, gestureState) => {
        if (sliderLayout) {
          const newValue = lastOffset.current + gestureState.dx;
          const boundedValue = Math.min(
            Math.max(0, newValue),
            sliderLayout.width
          );
          panValue.setValue(boundedValue - lastOffset.current);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (sliderLayout) {
          const newValue = lastOffset.current + gestureState.dx;
          const boundedValue = Math.min(
            Math.max(0, newValue),
            sliderLayout.width
          );
          lastOffset.current = boundedValue;
          const percentage = (boundedValue / sliderLayout.width) * 100;
          onValueChange(Math.round(percentage));
        }
      },
    })
  ).current;

  const handleLayout = (event: LayoutChangeEvent) => {
    const layout = event.nativeEvent.layout;
    setSliderLayout(layout);
    const initialPosition = (value / 100) * layout.width;
    panValue.setValue(initialPosition);
    lastOffset.current = initialPosition;
  };

  const animatedStyle = {
    transform: [{ translateX: panValue }],
  };

  const trackWidth = value + '%';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.labelContainer}>
          <Text style={styles.icon}>{icon}</Text>
          <Text style={styles.label}>{label}</Text>
        </View>
        <Text style={styles.value}>{valueLabel}</Text>
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
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  icon: {
    fontSize: 20,
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
});