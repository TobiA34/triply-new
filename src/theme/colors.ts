// Light theme colors
export const lightColors = {
  primary: {
    main: '#3B82F6',
    light: '#60A5FA',
    dark: '#1E40AF',
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#10B981',
    light: '#34D399',
    dark: '#059669',
    contrastText: '#FFFFFF',
  },
  accent: {
    main: '#8B5CF6',
    light: '#A78BFA',
    dark: '#7C3AED',
    contrastText: '#FFFFFF',
  },
  background: {
    default: '#FFFFFF',
    paper: '#F8FAFC',
    secondary: '#F1F5F9',
    elevated: '#FFFFFF',
    dark: '#0F172A',
  },
  error: {
    main: '#EF4444',
    light: '#FCA5A5',
    dark: '#DC2626',
    contrastText: '#FFFFFF',
  },
  warning: {
    main: '#F59E0B',
    light: '#FCD34D',
    dark: '#D97706',
    contrastText: '#FFFFFF',
  },
  success: {
    main: '#10B981',
    light: '#6EE7B7',
    dark: '#059669',
    contrastText: '#FFFFFF',
  },
  surface: {
    primary: '#FFFFFF',
    secondary: '#F8FAFC',
    tertiary: '#F1F5F9',
    elevated: '#FFFFFF',
  },
  text: {
    primary: '#0F172A',
    secondary: '#64748B',
    tertiary: '#94A3B8',
    disabled: '#CBD5E1',
    inverse: '#FFFFFF',
  },
  border: {
    light: '#E2E8F0',
    medium: '#CBD5E1',
    dark: '#94A3B8',
  },
  status: {
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },
  grey: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
  },
} as const;

// Dark theme colors
export const darkColors = {
  primary: {
    main: '#60A5FA',
    light: '#93C5FD',
    dark: '#3B82F6',
    contrastText: '#0F172A',
  },
  secondary: {
    main: '#34D399',
    light: '#6EE7B7',
    dark: '#10B981',
    contrastText: '#0F172A',
  },
  accent: {
    main: '#A78BFA',
    light: '#C4B5FD',
    dark: '#8B5CF6',
    contrastText: '#0F172A',
  },
  background: {
    default: '#0F172A',
    paper: '#1E293B',
    secondary: '#334155',
    elevated: '#334155',
    dark: '#0F172A',
  },
  error: {
    main: '#FCA5A5',
    light: '#FECACA',
    dark: '#EF4444',
    contrastText: '#0F172A',
  },
  warning: {
    main: '#FCD34D',
    light: '#FDE68A',
    dark: '#F59E0B',
    contrastText: '#0F172A',
  },
  success: {
    main: '#6EE7B7',
    light: '#A7F3D0',
    dark: '#10B981',
    contrastText: '#0F172A',
  },
  surface: {
    primary: '#1E293B',
    secondary: '#334155',
    tertiary: '#475569',
    elevated: '#334155',
  },
  text: {
    primary: '#F8FAFC',
    secondary: '#CBD5E1',
    tertiary: '#94A3B8',
    disabled: '#64748B',
    inverse: '#0F172A',
  },
  border: {
    light: '#475569',
    medium: '#64748B',
    dark: '#94A3B8',
  },
  status: {
    success: '#34D399',
    warning: '#FCD34D',
    error: '#FCA5A5',
    info: '#93C5FD',
  },
  grey: {
    50: '#0F172A',
    100: '#1E293B',
    200: '#334155',
    300: '#475569',
    400: '#64748B',
    500: '#94A3B8',
    600: '#CBD5E1',
    700: '#E2E8F0',
    800: '#F1F5F9',
    900: '#F8FAFC',
  },
} as const;

// Default export for backward compatibility
export const colors = lightColors;