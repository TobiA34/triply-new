import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColors } from '../hooks/useThemeColors';
import { useAccessibility } from '../hooks/useAccessibility';
import { designSystem, professionalSpacing, professionalShadows, professionalBorderRadius } from '../theme/designSystem';

interface EnhancedButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'tertiary' | 'outline' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  gradient?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export const EnhancedButton: React.FC<EnhancedButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  gradient = false,
  style,
  textStyle,
  accessibilityLabel,
  accessibilityHint,
}) => {
  const colors = useThemeColors();
  const { getButtonProps } = useAccessibility();
  const styles = createStyles(colors, variant, size, disabled, fullWidth);

  const getButtonColors = () => {
    if (disabled) {
      return {
        background: colors.grey[300],
        text: colors.grey[500],
        border: colors.grey[300],
      };
    }

    switch (variant) {
      case 'primary':
        return {
          background: colors.primary.main,
          text: colors.surface.primary,
          border: colors.primary.main,
        };
      case 'secondary':
        return {
          background: colors.secondary.main,
          text: colors.surface.primary,
          border: colors.secondary.main,
        };
      case 'tertiary':
        return {
          background: colors.status.success,
          text: colors.surface.primary,
          border: colors.status.success,
        };
      case 'outline':
        return {
          background: 'transparent',
          text: colors.primary.main,
          border: colors.primary.main,
        };
      case 'ghost':
        return {
          background: 'transparent',
          text: colors.primary.main,
          border: 'transparent',
        };
      case 'danger':
        return {
          background: colors.status.error,
          text: colors.surface.primary,
          border: colors.status.error,
        };
      default:
        return {
          background: colors.primary.main,
          text: colors.surface.primary,
          border: colors.primary.main,
        };
    }
  };

  const buttonColors = getButtonColors();
  const buttonStyle = [
    styles.button,
    {
      backgroundColor: buttonColors.background,
      borderColor: buttonColors.border,
    },
    style,
  ];

  const textStyleCombined = [
    styles.text,
    {
      color: buttonColors.text,
    },
    textStyle,
  ];

  const renderContent = () => (
    <View style={styles.content}>
      {loading && (
        <ActivityIndicator
          size="small"
          color={buttonColors.text}
          style={styles.loader}
        />
      )}
      
      {!loading && icon && iconPosition === 'left' && (
        <Ionicons
          name={icon as any}
          size={designSystem.componentSizes.iconSize.sm}
          color={buttonColors.text}
          style={styles.iconLeft}
        />
      )}
      
      <Text style={textStyleCombined}>
        {title}
      </Text>
      
      {!loading && icon && iconPosition === 'right' && (
        <Ionicons
          name={icon as any}
          size={designSystem.componentSizes.iconSize.sm}
          color={buttonColors.text}
          style={styles.iconRight}
        />
      )}
    </View>
  );

  const buttonProps = getButtonProps(
    accessibilityLabel || title,
    accessibilityHint || `Double tap to ${title.toLowerCase()}`
  );

  if (gradient && variant === 'primary' && !disabled) {
    return (
      <TouchableOpacity
        style={[styles.button, style]}
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.8}
        {...buttonProps}
      >
        <LinearGradient
          colors={[colors.primary.main, colors.primary.dark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          {renderContent()}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...buttonProps}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const createStyles = (colors: any, variant: string, size: string, disabled: boolean, fullWidth: boolean) => StyleSheet.create({
  button: {
    borderRadius: professionalBorderRadius.lg,
    borderWidth: variant === 'outline' ? 2 : 0,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    width: fullWidth ? '100%' : 'auto',
    ...professionalShadows.sm,
  },
  gradient: {
    borderRadius: professionalBorderRadius.lg,
    paddingVertical: designSystem.componentSizes.buttonHeight[size as keyof typeof designSystem.componentSizes.buttonHeight] / 2 - 8,
    paddingHorizontal: professionalSpacing[4],
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    ...designSystem.textStyles.button,
    fontWeight: designSystem.textStyles.button.fontWeight,
  },
  loader: {
    marginRight: professionalSpacing[2],
  },
  iconLeft: {
    marginRight: professionalSpacing[2],
  },
  iconRight: {
    marginLeft: professionalSpacing[2],
  },
});
