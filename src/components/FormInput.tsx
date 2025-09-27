import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../theme';

interface FormInputProps {
  label?: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
  error?: string;
  icon?: React.ReactNode;
  multiline?: boolean;
  numberOfLines?: number;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  onBlur,
  error,
  icon,
  multiline = false,
  numberOfLines = 1,
  keyboardType = 'default',
}) => {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputContainer, error && styles.inputError]}>
        <TextInput
          style={[styles.input, multiline && styles.multilineInput]}
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          onBlur={onBlur}
          placeholderTextColor={colors.text.tertiary}
          multiline={multiline}
          numberOfLines={numberOfLines}
          textAlignVertical={multiline ? 'top' : 'center'}
          keyboardType={keyboardType}
        />
        {icon && <View style={styles.icon}>{icon}</View>}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
    width: '100%',
  },
  label: {
    fontSize: typography.fontSize.sm,
      fontFamily: typography?.fontFamily?.medium || 'System',
    color: colors.text.primary,
    marginBottom: spacing.sm,
    lineHeight: typography.lineHeight.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface.primary,
    width: '100%',
    minHeight: 48,
  },
  input: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: typography.fontSize.base,
      fontFamily: typography?.fontFamily?.regular || 'System',
    color: colors.text.primary,
    lineHeight: typography.lineHeight.base,
  },
  multilineInput: {
    paddingTop: spacing.md,
    minHeight: 80,
  },
  icon: {
    paddingRight: spacing.lg,
    paddingTop: 0,
  },
  inputError: {
    borderColor: colors.status.error,
    borderWidth: 2,
  },
  errorText: {
    color: colors.status.error,
    fontSize: typography.fontSize.xs,
      fontFamily: typography?.fontFamily?.medium || 'System',
    marginTop: spacing.xs,
    lineHeight: typography.lineHeight.xs,
  },
});