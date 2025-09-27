import { AccessibilitySettings } from '../contexts/AccessibilityContext';

export const getAccessibilityFontSize = (fontSize: string, baseSize: number): number => {
  switch (fontSize) {
    case 'small':
      return baseSize * 0.875;
    case 'normal':
      return baseSize;
    case 'large':
      return baseSize * 1.125;
    case 'extra-large':
      return baseSize * 1.25;
    case 'huge':
      return baseSize * 1.5;
    default:
      return baseSize;
  }
};

export const getHighContrastColors = (colors: any) => {
  return {
    ...colors,
    text: {
      ...colors.text,
      primary: '#FFFFFF',
      secondary: '#E0E0E0',
      tertiary: '#B0B0B0',
    },
    background: {
      ...colors.background,
      default: '#000000',
      paper: '#1A1A1A',
      secondary: '#2A2A2A',
    },
    border: {
      ...colors.border,
      light: '#666666',
      medium: '#888888',
      dark: '#AAAAAA',
    },
  };
};

export const getColorBlindColors = (colors: any, mode: string) => {
  // Simplified color blind adjustments
  // In a real app, this would have more sophisticated color mapping
  switch (mode) {
    case 'protanopia':
      // Red-blind adjustments
      return {
        ...colors,
        primary: {
          ...colors.primary,
          main: '#4A90E2', // Blue instead of red
        },
        error: {
          ...colors.error,
          main: '#E24A4A', // Keep red for errors
        },
      };
    case 'deuteranopia':
      // Green-blind adjustments
      return {
        ...colors,
        secondary: {
          ...colors.secondary,
          main: '#4A90E2', // Blue instead of green
        },
        success: {
          ...colors.success,
          main: '#4AE24A', // Keep green for success
        },
      };
    case 'tritanopia':
      // Blue-blind adjustments
      return {
        ...colors,
        primary: {
          ...colors.primary,
          main: '#E24A4A', // Red instead of blue
        },
        info: {
          ...colors.info,
          main: '#4AE24A', // Green instead of blue
        },
      };
    default:
      return colors;
  }
};