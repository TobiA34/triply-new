import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { typography } from '../theme';
import { useThemeColors } from '../hooks/useThemeColors';

interface ItemCardProps {
  title: string;
  description: string;
  onPress?: () => void;
}

export const ItemCard: React.FC<ItemCardProps> = ({ title, description, onPress }) => {
  const colors = useThemeColors();
  const styles = createStyles(colors);
  
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
    </TouchableOpacity>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    backgroundColor: colors.background.paper,
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: typography.fontSize.lg,
      fontFamily: typography?.fontFamily?.medium || 'System',
    color: colors.text.primary,
    marginBottom: 4,
  },
  description: {
    fontSize: typography.fontSize.base,
      fontFamily: typography?.fontFamily?.regular || 'System',
    color: colors.text.secondary,
  },
});
