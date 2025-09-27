import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColors } from '../hooks/useThemeColors';
import { useAccessibility } from '../hooks/useAccessibility';
import { designSystem, professionalSpacing, professionalShadows, professionalBorderRadius } from '../theme/designSystem';

interface EnhancedHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  rightAction?: {
    icon: string;
    onPress: () => void;
    label: string;
  };
  gradient?: boolean;
  elevation?: number;
}

export const EnhancedHeader: React.FC<EnhancedHeaderProps> = ({
  title,
  subtitle,
  showBackButton = false,
  onBackPress,
  rightAction,
  gradient = true,
  elevation = 0,
}) => {
  const colors = useThemeColors();
  const { getButtonProps, getTextProps } = useAccessibility();
  const styles = createStyles(colors, elevation);

  const HeaderContent = () => (
    <View style={styles.headerContent}>
      <StatusBar
        barStyle={gradient ? 'light-content' : 'dark-content'}
        backgroundColor={gradient ? colors.primary.dark : colors.surface.primary}
      />
      
      <View style={styles.headerTop}>
        {showBackButton && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBackPress}
            {...getButtonProps('Go back', 'Double tap to go back')}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={gradient ? colors.surface.primary : colors.text.primary}
            />
          </TouchableOpacity>
        )}
        
        <View style={styles.titleContainer}>
          <Text
            style={[
              styles.title,
              { color: gradient ? colors.surface.primary : colors.text.primary }
            ]}
            {...getTextProps(title, 'header')}
          >
            {title}
          </Text>
          {subtitle && (
            <Text
              style={[
                styles.subtitle,
                { color: gradient ? colors.surface.primary : colors.text.secondary }
              ]}
              {...getTextProps(subtitle)}
            >
              {subtitle}
            </Text>
          )}
        </View>
        
        {rightAction && (
          <TouchableOpacity
            style={styles.rightAction}
            onPress={rightAction.onPress}
            {...getButtonProps(rightAction.label, `Double tap to ${rightAction.label.toLowerCase()}`)}
          >
            <Ionicons
              name={rightAction.icon as any}
              size={24}
              color={gradient ? colors.surface.primary : colors.text.primary}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  if (gradient) {
    return (
      <LinearGradient
        colors={[colors.primary.dark, colors.primary.dark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <HeaderContent />
      </LinearGradient>
    );
  }

  return (
    <View style={styles.header}>
      <HeaderContent />
    </View>
  );
};

const createStyles = (colors: any, elevation: number) => StyleSheet.create({
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : (StatusBar.currentHeight || 0) + 6,
    paddingBottom: professionalSpacing[4],
    paddingHorizontal: designSystem.layout.containerPadding,
    ...(professionalShadows as any)[elevation > 0 ? 'md' : 'none'],
  },
  headerContent: {
    flex: 1,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
  },
  backButton: {
    padding: professionalSpacing[2],
    marginRight: professionalSpacing[2],
    borderRadius: professionalBorderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    ...designSystem.textStyles.h2,
    marginBottom: professionalSpacing[1],
  },
  subtitle: {
    ...designSystem.textStyles.bodySmall,
    opacity: 0.9,
  },
  rightAction: {
    padding: professionalSpacing[2],
    marginLeft: professionalSpacing[2],
    borderRadius: professionalBorderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
});
