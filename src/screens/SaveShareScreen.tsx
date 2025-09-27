import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { typography } from '../theme';
import { useThemeColors } from '../hooks/useThemeColors';

export const SaveShareScreen = () => {
  const colors = useThemeColors();
  const styles = createStyles(colors);
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Save & Share</Text>
      </View>
    </SafeAreaView>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
      fontFamily: typography?.fontFamily?.bold || 'System',
    color: colors.text.primary,
    marginBottom: 16,
  },
});
