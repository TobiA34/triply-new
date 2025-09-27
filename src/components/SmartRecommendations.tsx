import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColors } from '../hooks/useThemeColors';
import { useAccessibility } from '../hooks/useAccessibility';
import { designSystem, professionalSpacing, professionalShadows, professionalBorderRadius } from '../theme/designSystem';
import { Trip } from '../services/database';

interface SmartRecommendationsProps {
  visible: boolean;
  trips: Trip[];
  onClose: () => void;
}

const { width } = Dimensions.get('window');

export const SmartRecommendations: React.FC<SmartRecommendationsProps> = ({
  visible,
  trips,
  onClose,
}) => {
  const colors = useThemeColors();
  const { getButtonProps, getTextProps } = useAccessibility();

  const styles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: colors.background.default,
      borderTopLeftRadius: professionalBorderRadius.xl,
      borderTopRightRadius: professionalBorderRadius.xl,
      maxHeight: '90%',
      paddingTop: professionalSpacing[6],
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: professionalSpacing[6],
      paddingBottom: professionalSpacing[4],
      borderBottomWidth: 1,
      borderBottomColor: colors.border.light,
    },
    headerTitle: {
      ...designSystem.textStyles.h3,
      color: colors.text.primary,
    },
    closeButton: {
      padding: professionalSpacing[2],
      borderRadius: professionalBorderRadius.full,
      backgroundColor: colors.surface.secondary,
    },
    content: {
      padding: professionalSpacing[6],
    },
    section: {
      marginBottom: professionalSpacing[8],
    },
    sectionTitle: {
      ...designSystem.textStyles.h4,
      color: colors.text.primary,
      marginBottom: professionalSpacing[4],
    },
    recommendationCard: {
      backgroundColor: colors.surface.primary,
      borderRadius: professionalBorderRadius.lg,
      padding: professionalSpacing[4],
      marginBottom: professionalSpacing[4],
      ...professionalShadows.sm,
    },
    recommendationHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: professionalSpacing[3],
    },
    recommendationIcon: {
      marginRight: professionalSpacing[3],
    },
    recommendationTitle: {
      ...designSystem.textStyles.h4,
      color: colors.text.primary,
      flex: 1,
    },
    recommendationDescription: {
      ...designSystem.textStyles.body,
      color: colors.text.secondary,
      lineHeight: designSystem.textStyles.body.lineHeight,
      marginBottom: professionalSpacing[3],
    },
    recommendationAction: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: professionalSpacing[2],
      paddingHorizontal: professionalSpacing[3],
      backgroundColor: colors.primary.main,
      borderRadius: professionalBorderRadius.md,
      alignSelf: 'flex-start',
    },
    recommendationActionText: {
      ...designSystem.textStyles.buttonSmall,
      color: colors.primary.contrastText,
      marginRight: professionalSpacing[2],
    },
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: professionalSpacing[12],
    },
    emptyIcon: {
      marginBottom: professionalSpacing[4],
    },
    emptyTitle: {
      ...designSystem.textStyles.h4,
      color: colors.text.primary,
      marginBottom: professionalSpacing[2],
      textAlign: 'center',
    },
    emptyDescription: {
      ...designSystem.textStyles.body,
      color: colors.text.secondary,
      textAlign: 'center',
      lineHeight: designSystem.textStyles.body.lineHeight,
    },
  });

  const recommendations = [
    {
      id: '1',
      icon: 'trending-up',
      title: 'Budget Optimization',
      description: 'Based on your spending patterns, consider setting a daily budget cap of $150 for your next trip.',
      action: 'Set Budget Cap',
    },
    {
      id: '2',
      icon: 'calendar',
      title: 'Peak Season Alert',
      description: 'Your preferred destinations are 30% more expensive in summer. Consider traveling in spring or fall.',
      action: 'View Alternatives',
    },
    {
      id: '3',
      icon: 'location',
      title: 'New Destinations',
      description: 'Based on your interests, you might enjoy exploring Kyoto, Japan or Santorini, Greece.',
      action: 'Explore Destinations',
    },
    {
      id: '4',
      icon: 'people',
      title: 'Group Travel',
      description: 'Consider group travel for your next adventure. You could save up to 40% on accommodations.',
      action: 'Find Groups',
    },
  ];

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
        <View style={styles.header}>
            <Text style={styles.headerTitle} {...getTextProps('Smart Recommendations', 'header')}>
              Smart Recommendations
              </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              {...getButtonProps('Close recommendations')}
            >
              <Ionicons name="close" size={24} color={colors.text.primary} />
            </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {trips.length === 0 ? (
            <View style={styles.emptyState}>
                  <Ionicons 
                  name="bulb-outline"
                  size={64}
                  color={colors.text.tertiary}
                  style={styles.emptyIcon}
                />
                <Text style={styles.emptyTitle} {...getTextProps('No Recommendations Yet', 'header')}>
                  No Recommendations Yet
                </Text>
                <Text style={styles.emptyDescription} {...getTextProps('Create your first trip to get personalized recommendations', 'text')}>
                  Create your first trip to get personalized recommendations
                </Text>
              </View>
            ) : (
              <View style={styles.section}>
                <Text style={styles.sectionTitle} {...getTextProps('Personalized for You', 'header')}>
                  Personalized for You
                </Text>
                {recommendations.map((recommendation) => (
                  <View key={recommendation.id} style={styles.recommendationCard}>
                    <View style={styles.recommendationHeader}>
                      <Ionicons
                        name={recommendation.icon as any}
                        size={24}
                        color={colors.primary.main}
                        style={styles.recommendationIcon}
                      />
                      <Text style={styles.recommendationTitle} {...getTextProps(recommendation.title, 'header')}>
                        {recommendation.title}
                    </Text>
                  </View>
                    <Text style={styles.recommendationDescription} {...getTextProps(recommendation.description, 'text')}>
                      {recommendation.description}
                    </Text>
                    <TouchableOpacity
                      style={styles.recommendationAction}
                      {...getButtonProps(recommendation.action)}
                    >
                      <Text style={styles.recommendationActionText} {...getTextProps(recommendation.action, 'button')}>
                        {recommendation.action}
                      </Text>
                      <Ionicons
                        name="arrow-forward"
                        size={16}
                        color={colors.primary.contrastText}
                      />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
        )}
      </ScrollView>
        </View>
    </View>
  </Modal>
  );
};