import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColors } from '../hooks/useThemeColors';
import { useAccessibility } from '../hooks/useAccessibility';
import { designSystem, professionalSpacing, professionalShadows, professionalBorderRadius } from '../theme/designSystem';
import { Trip } from '../services/database';

interface AnalyticsDashboardProps {
  visible: boolean;
  trips: Trip[];
  onClose: () => void;
}

const { width } = Dimensions.get('window');

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
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
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: professionalSpacing[4],
    },
    statCard: {
      flex: 1,
      minWidth: (width - professionalSpacing[6] * 3) / 2,
      backgroundColor: colors.surface.primary,
      borderRadius: professionalBorderRadius.lg,
      padding: professionalSpacing[4],
      ...professionalShadows.sm,
    },
    statValue: {
      ...designSystem.textStyles.h2,
      color: colors.primary.main,
      marginBottom: professionalSpacing[1],
    },
    statLabel: {
      ...designSystem.textStyles.caption,
      color: colors.text.secondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
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

  const totalTrips = trips.length;
  const totalBudget = trips.reduce((sum, trip) => sum + trip.budget, 0);
  const averageBudget = totalTrips > 0 ? totalBudget / totalTrips : 0;
  const upcomingTrips = trips.filter(trip => new Date(trip.checkIn) > new Date()).length;
  const completedTrips = trips.filter(trip => new Date(trip.checkOut) < new Date()).length;

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
            <Text style={styles.headerTitle} {...getTextProps('Trip Analytics', 'header')}>
              Trip Analytics
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              {...getButtonProps('Close analytics dashboard')}
            >
          <Ionicons name="close" size={24} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {totalTrips === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons
                  name="analytics-outline"
                  size={64}
                  color={colors.text.tertiary}
                  style={styles.emptyIcon}
                />
                <Text style={styles.emptyTitle} {...getTextProps('No Data Yet', 'header')}>
                  No Data Yet
                </Text>
                <Text style={styles.emptyDescription} {...getTextProps('Create your first trip to see analytics and insights', 'text')}>
                  Create your first trip to see analytics and insights
                </Text>
              </View>
            ) : (
              <>
                <View style={styles.section}>
                  <Text style={styles.sectionTitle} {...getTextProps('Overview', 'header')}>
            Overview
          </Text>
                  <View style={styles.statsGrid}>
                    <View style={styles.statCard}>
                      <Text style={styles.statValue} {...getTextProps(`Total Trips: ${totalTrips}`, 'text')}>
                        {totalTrips}
                      </Text>
                      <Text style={styles.statLabel} {...getTextProps('Total Trips', 'text')}>
                        Total Trips
                      </Text>
                    </View>
                    <View style={styles.statCard}>
                      <Text style={styles.statValue} {...getTextProps(`Upcoming Trips: ${upcomingTrips}`, 'text')}>
                        {upcomingTrips}
                      </Text>
                      <Text style={styles.statLabel} {...getTextProps('Upcoming', 'text')}>
                        Upcoming
                      </Text>
                    </View>
                    <View style={styles.statCard}>
                      <Text style={styles.statValue} {...getTextProps(`Completed Trips: ${completedTrips}`, 'text')}>
                        {completedTrips}
                      </Text>
                      <Text style={styles.statLabel} {...getTextProps('Completed', 'text')}>
                        Completed
                      </Text>
                    </View>
                    <View style={styles.statCard}>
                      <Text style={styles.statValue} {...getTextProps(`Average Budget: $${averageBudget.toFixed(0)}`, 'text')}>
                        ${averageBudget.toFixed(0)}
                      </Text>
                      <Text style={styles.statLabel} {...getTextProps('Avg Budget', 'text')}>
                        Avg Budget
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.section}>
            <Text style={styles.sectionTitle} {...getTextProps('Budget Analysis', 'header')}>
              Budget Analysis
            </Text>
                  <View style={styles.statsGrid}>
                    <View style={styles.statCard}>
                      <Text style={styles.statValue} {...getTextProps(`Total Budget: $${totalBudget.toFixed(0)}`, 'text')}>
                        ${totalBudget.toFixed(0)}
                      </Text>
                      <Text style={styles.statLabel} {...getTextProps('Total Budget', 'text')}>
                        Total Budget
                      </Text>
                    </View>
                    <View style={styles.statCard}>
                      <Text style={styles.statValue} {...getTextProps(`Highest Budget: $${Math.max(...trips.map(t => t.budget)).toFixed(0)}`, 'text')}>
                        ${Math.max(...trips.map(t => t.budget)).toFixed(0)}
          </Text>
                      <Text style={styles.statLabel} {...getTextProps('Highest Budget', 'text')}>
                        Highest Budget
          </Text>
                    </View>
                  </View>
                </View>
              </>
            )}
          </ScrollView>
      </View>
    </View>
    </Modal>
  );
};