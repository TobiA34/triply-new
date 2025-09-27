import { Platform, Dimensions } from 'react-native';
import { typography, spacing, borderRadius, shadows } from './index';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Professional Design System
export const designSystem = {
  // Layout
  layout: {
    screenWidth,
    screenHeight,
    containerPadding: spacing.lg,
    cardPadding: spacing.md,
    sectionSpacing: spacing.xl,
    itemSpacing: spacing.md,
  },

  // Typography Scale
  textStyles: {
    // Headers
    h1: {
      fontSize: typography.fontSize['4xl'],
      lineHeight: typography.lineHeight['4xl'],
      fontWeight: typography.fontWeight.bold,
      letterSpacing: typography.letterSpacing.tight,
    },
    h2: {
      fontSize: typography.fontSize['3xl'],
      lineHeight: typography.lineHeight['3xl'],
      fontWeight: typography.fontWeight.bold,
      letterSpacing: typography.letterSpacing.tight,
    },
    h3: {
      fontSize: typography.fontSize['2xl'],
      lineHeight: typography.lineHeight['2xl'],
      fontWeight: typography.fontWeight.semibold,
      letterSpacing: typography.letterSpacing.normal,
    },
    h4: {
      fontSize: typography.fontSize.xl,
      lineHeight: typography.lineHeight.xl,
      fontWeight: typography.fontWeight.semibold,
      letterSpacing: typography.letterSpacing.normal,
    },
    
    // Body Text
    bodyLarge: {
      fontSize: typography.fontSize.lg,
      lineHeight: typography.lineHeight.lg,
      fontWeight: typography.fontWeight.normal,
      letterSpacing: typography.letterSpacing.normal,
    },
    body: {
      fontSize: typography.fontSize.base,
      lineHeight: typography.lineHeight.base,
      fontWeight: typography.fontWeight.normal,
      letterSpacing: typography.letterSpacing.normal,
    },
    bodySmall: {
      fontSize: typography.fontSize.sm,
      lineHeight: typography.lineHeight.sm,
      fontWeight: typography.fontWeight.normal,
      letterSpacing: typography.letterSpacing.normal,
    },
    
    // Labels and Captions
    label: {
      fontSize: typography.fontSize.sm,
      lineHeight: typography.lineHeight.sm,
      fontWeight: typography.fontWeight.medium,
      letterSpacing: typography.letterSpacing.wide,
    },
    caption: {
      fontSize: typography.fontSize.xs,
      lineHeight: typography.lineHeight.xs,
      fontWeight: typography.fontWeight.normal,
      letterSpacing: typography.letterSpacing.wide,
    },
    
    // Buttons
    buttonLarge: {
      fontSize: typography.fontSize.lg,
      lineHeight: typography.lineHeight.lg,
      fontWeight: typography.fontWeight.semibold,
      letterSpacing: typography.letterSpacing.wide,
    },
    button: {
      fontSize: typography.fontSize.base,
      lineHeight: typography.lineHeight.base,
      fontWeight: typography.fontWeight.medium,
      letterSpacing: typography.letterSpacing.wide,
    },
    buttonSmall: {
      fontSize: typography.fontSize.sm,
      lineHeight: typography.lineHeight.sm,
      fontWeight: typography.fontWeight.medium,
      letterSpacing: typography.letterSpacing.wide,
    },
  },

  // Component Sizes
  componentSizes: {
    // Buttons
    buttonHeight: {
      large: 56,
      medium: 48,
      small: 40,
      tiny: 32,
    },
    
    // Inputs
    inputHeight: {
      large: 56,
      medium: 48,
      small: 40,
    },
    
    // Cards
    cardMinHeight: 120,
    cardPadding: spacing.lg,
    
    // Icons
    iconSize: {
      xs: 16,
      sm: 20,
      md: 24,
      lg: 32,
      xl: 40,
    },
    
    // Avatars
    avatarSize: {
      xs: 24,
      sm: 32,
      md: 40,
      lg: 48,
      xl: 64,
    },
  },

  // Animation Durations
  animations: {
    fast: 150,
    normal: 250,
    slow: 350,
    slower: 500,
  },

  // Easing Functions
  easing: {
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },

  // Z-Index Scale
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
    toast: 1080,
  },

  // Breakpoints
  breakpoints: {
    xs: 0,
    sm: 576,
    md: 768,
    lg: 992,
    xl: 1200,
  },

  // Grid System
  grid: {
    columns: 12,
    gutter: spacing.md,
    margin: spacing.lg,
  },
} as const;

// Professional Color Palette
export const professionalColors = {
  // Primary Colors
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9', // Main
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
  },
  
  // Secondary Colors
  secondary: {
    50: '#fdf4ff',
    100: '#fae8ff',
    200: '#f5d0fe',
    300: '#f0abfc',
    400: '#e879f9',
    500: '#d946ef', // Main
    600: '#c026d3',
    700: '#a21caf',
    800: '#86198f',
    900: '#701a75',
  },
  
  // Neutral Colors
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },
  
  // Status Colors
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e', // Main
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b', // Main
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444', // Main
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
  
  // Info Colors
  info: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6', // Main
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
} as const;

// Professional Shadows
export const professionalShadows = {
  xs: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 12,
  },
  inner: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 0,
  },
} as const;

// Professional Border Radius
export const professionalBorderRadius = {
  none: 0,
  xs: 2,
  sm: 4,
  md: 6,
  lg: 8,
  xl: 12,
  '2xl': 16,
  '3xl': 24,
  full: 9999,
} as const;

// Professional Spacing
export const professionalSpacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
  24: 96,
  32: 128,
  40: 160,
  48: 192,
  56: 224,
  64: 256,
} as const;


