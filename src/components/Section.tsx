import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../theme';

interface SectionProps {
  title: string;
  children: React.ReactNode;
  subtitle?: string;
}

export const Section: React.FC<SectionProps> = ({ title, children, subtitle }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing['3xl'],
  },
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography?.fontSize?.lg || 18,
      fontFamily: typography?.fontFamily?.semibold || 'System',
    color: colors.text.primary,
    lineHeight: typography?.lineHeight?.lg || 28,
    letterSpacing: typography?.letterSpacing?.tight || -0.5,
  },
  subtitle: {
    fontSize: typography?.fontSize?.sm || 14,
      fontFamily: typography?.fontFamily?.regular || 'System',
    color: colors.text.secondary,
    lineHeight: typography?.lineHeight?.sm || 20,
    marginTop: spacing.xs,
  },
  content: {
    gap: spacing.md,
  },
});
