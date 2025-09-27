import { useAccessibilityContext } from '../contexts/AccessibilityContext';
import { useThemeColors } from './useThemeColors';
import { 
  getAccessibilityFontSize, 
  getHighContrastColors, 
  getColorBlindColors 
} from '../utils/accessibility';

export const useAccessibility = () => {
  const { settings, updateSetting } = useAccessibilityContext();
  const colors = useThemeColors();

  // Apply accessibility modifications to colors
  const getAccessibleColors = () => {
    let accessibleColors = colors;

    if (settings.highContrast) {
      accessibleColors = getHighContrastColors(accessibleColors);
    }

    if (settings.colorBlindMode !== 'none') {
      accessibleColors = getColorBlindColors(accessibleColors, settings.colorBlindMode);
    }

    return accessibleColors;
  };

  // Get font size based on accessibility settings
  const getAccessibleFontSize = (baseSize: number) => {
    return getAccessibilityFontSize(settings.fontSize, baseSize);
  };

  // Get accessibility props for common components
  const getButtonProps = (label: string, hint?: string, disabled?: boolean) => ({
    accessible: true,
    accessibilityLabel: label,
    accessibilityHint: hint,
    accessibilityRole: 'button' as const,
    accessibilityState: { disabled: disabled || false },
  });

  const getImageProps = (label: string, hint?: string) => ({
    accessible: true,
    accessibilityLabel: label,
    accessibilityHint: hint,
    accessibilityRole: 'image' as const,
  });

  const getTextProps = (label?: string, role: 'header' | 'text' | 'summary' | 'button' = 'text') => ({
    accessible: true,
    accessibilityLabel: label || '',
    accessibilityRole: role,
  });

  const getInputProps = (label: string, hint?: string, required?: boolean) => ({
    accessible: true,
    accessibilityLabel: label,
    accessibilityHint: hint,
    accessibilityRole: 'text' as const,
    accessibilityRequired: required,
  });

  const getSwitchProps = (label: string, hint?: string, value?: boolean) => ({
    accessible: true,
    accessibilityLabel: label,
    accessibilityHint: hint,
    accessibilityRole: 'switch' as const,
    accessibilityState: { checked: value || false },
  });

  // Get styles with accessibility modifications
  const getAccessibleStyles = (baseStyles: any) => {
    const accessibleColors = getAccessibleColors();
    
    return {
      ...baseStyles,
      // Apply bold text if enabled
      fontWeight: settings.boldText ? 'bold' : baseStyles.fontWeight || 'normal',
      // Apply large text if enabled
      fontSize: settings.largeText 
        ? getAccessibleFontSize(baseStyles.fontSize || 16)
        : baseStyles.fontSize,
    };
  };

  return {
    settings,
    updateSetting,
    getAccessibleColors,
    getAccessibleFontSize,
    getButtonProps,
    getImageProps,
    getTextProps,
    getInputProps,
    getSwitchProps,
    getAccessibleStyles,
  };
};
