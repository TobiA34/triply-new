import { useTheme } from '../contexts/ThemeContext';
import { lightColors, darkColors } from '../theme/colors';

// Create a guaranteed safe colors object with proxy to catch all undefined access
const createSafeColors = (baseColors: typeof lightColors) => {
  const safeColors = {
    ...baseColors,
    primary: {
      main: baseColors.primary?.main || '#3B82F6',
      light: baseColors.primary?.light || '#60A5FA',
      dark: baseColors.primary?.dark || '#1E40AF',
      contrastText: baseColors.primary?.contrastText || '#FFFFFF',
    },
    secondary: {
      main: baseColors.secondary?.main || '#10B981',
      light: baseColors.secondary?.light || '#34D399',
      dark: baseColors.secondary?.dark || '#059669',
      contrastText: baseColors.secondary?.contrastText || '#FFFFFF',
    },
    accent: {
      main: baseColors.accent?.main || '#8B5CF6',
      light: baseColors.accent?.light || '#A78BFA',
      dark: baseColors.accent?.dark || '#7C3AED',
      contrastText: baseColors.accent?.contrastText || '#FFFFFF',
    },
    status: {
      success: baseColors.status?.success || '#10B981',
      warning: baseColors.status?.warning || '#F59E0B',
      error: baseColors.status?.error || '#EF4444',
      info: baseColors.status?.info || '#3B82F6',
    },
    error: {
      main: baseColors.error?.main || '#EF4444',
      light: baseColors.error?.light || '#FCA5A5',
      dark: baseColors.error?.dark || '#DC2626',
      contrastText: baseColors.error?.contrastText || '#FFFFFF',
    },
    warning: {
      main: baseColors.warning?.main || '#F59E0B',
      light: baseColors.warning?.light || '#FCD34D',
      dark: baseColors.warning?.dark || '#D97706',
      contrastText: baseColors.warning?.contrastText || '#FFFFFF',
    },
    success: {
      main: baseColors.success?.main || '#10B981',
      light: baseColors.success?.light || '#6EE7B7',
      dark: baseColors.success?.dark || '#059669',
      contrastText: baseColors.success?.contrastText || '#FFFFFF',
    },
    background: {
      default: baseColors.background?.default || '#FFFFFF',
      paper: baseColors.background?.paper || '#F8FAFC',
      secondary: baseColors.background?.secondary || '#F1F5F9',
      elevated: baseColors.background?.elevated || '#FFFFFF',
      dark: baseColors.background?.dark || '#0F172A',
    },
    surface: {
      primary: baseColors.surface?.primary || '#FFFFFF',
      secondary: baseColors.surface?.secondary || '#F8FAFC',
      tertiary: baseColors.surface?.tertiary || '#F1F5F9',
      elevated: baseColors.surface?.elevated || '#FFFFFF',
    },
    text: {
      primary: baseColors.text?.primary || '#0F172A',
      secondary: baseColors.text?.secondary || '#64748B',
      tertiary: baseColors.text?.tertiary || '#94A3B8',
      disabled: baseColors.text?.disabled || '#CBD5E1',
      inverse: baseColors.text?.inverse || '#FFFFFF',
    },
    border: {
      light: baseColors.border?.light || '#E2E8F0',
      medium: baseColors.border?.medium || '#CBD5E1',
      dark: baseColors.border?.dark || '#94A3B8',
      default: baseColors.border?.light || '#E2E8F0',
    },
    grey: baseColors.grey || {
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
  };

  // Create a proxy to catch any undefined access and provide fallbacks
  return new Proxy(safeColors, {
    get(target: any, prop: string | symbol) {
      const value = target[prop];
      if (value === undefined) {
        console.warn(`Undefined color access: ${String(prop)}, using fallback`);
        return '#3B82F6'; // Default blue fallback
      }
      if (typeof value === 'object' && value !== null) {
        return new Proxy(value, {
          get(nestedTarget: any, nestedProp: string | symbol) {
            const nestedValue = nestedTarget[nestedProp];
            if (nestedValue === undefined) {
              console.warn(`Undefined nested color access: ${String(prop)}.${String(nestedProp)}, using fallback`);
              return '#3B82F6'; // Default blue fallback
            }
            return nestedValue;
          }
        });
      }
      return value;
    }
  });
};

export const useThemeColors = () => {
  try {
    const themeContext = useTheme();
    const { isDark } = themeContext || { isDark: false };
    
    console.log('useThemeColors: isDark =', isDark);
    
    const baseColors = isDark ? darkColors : lightColors;
    const safeColors = createSafeColors(baseColors as any);
    
    console.log('useThemeColors: background color =', safeColors.background.default);
    
    return safeColors;
  } catch (error) {
    console.error('Error in useThemeColors:', error);
    return createSafeColors(lightColors as any);
  }
};
