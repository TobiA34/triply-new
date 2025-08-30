import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  GestureResponderEvent,
  LayoutChangeEvent,
} from 'react-native';

interface SliderProps {
  icon: string;
  label: string;
  value: number;
  onValueChange: (value: number) => void;
  valueLabel: string;
}

export const Slider: React.FC<SliderProps> = ({
  icon,
  label,
  value,
  onValueChange,
  valueLabel,
}) => {
  const [sliderWidth, setSliderWidth] = useState(0);
  const sliderRef = useRef<View>(null);

  const handleLayout = (event: LayoutChangeEvent) => {
    setSliderWidth(event.nativeEvent.layout.width);
  };

  const calculateValue = (pageX: number) => {
    sliderRef.current?.measure((x, y, width, height, pageXOffset, pageYOffset) => {
      const relativeX = pageX - pageXOffset;
      const percentage = Math.max(0, Math.min(100, (relativeX / width) * 100));
      onValueChange(Math.round(percentage));
    });
  };

  const handleTouch = (event: GestureResponderEvent) => {
    calculateValue(event.nativeEvent.pageX);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.labelContainer}>
          <Text style={styles.icon}>{icon}</Text>
          <Text style={styles.label}>{label}</Text>
        </View>
        <Text style={styles.value}>{valueLabel}</Text>
      </View>
      <TouchableWithoutFeedback onPress={handleTouch}>
        <View 
          ref={sliderRef}
          style={styles.sliderContainer}
          onLayout={handleLayout}
        >
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${value}%` }]} />
            <View style={[styles.thumb, { left: `${value}%` }]} />
          </View>
        </View>
      </TouchableWithoutFeedback>
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