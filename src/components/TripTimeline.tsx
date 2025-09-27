import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../hooks/useThemeColors';
import { useAccessibility } from '../hooks/useAccessibility';
import { designSystem, professionalSpacing, professionalShadows, professionalBorderRadius } from '../theme/designSystem';

interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  time: string;
  type: 'flight' | 'hotel' | 'activity' | 'meal' | 'transport';
  completed: boolean;
}

interface TripTimelineProps {
  visible: boolean;
  tripId: string;
  events: TimelineEvent[];
  onEventUpdate: (eventId: string, updates: Partial<TimelineEvent>) => void;
  onEventAdd: (event: Omit<TimelineEvent, 'id'>) => void;
  onEventDelete: (eventId: string) => void;
  onClose: () => void;
}

export const TripTimeline: React.FC<TripTimelineProps> = ({
  visible,
  tripId,
  events,
  onEventUpdate,
  onEventAdd,
  onEventDelete,
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
    timelineContainer: {
      paddingLeft: professionalSpacing[4],
    },
    timelineItem: {
      flexDirection: 'row',
      marginBottom: professionalSpacing[6],
    },
    timelineLine: {
      width: 2,
      backgroundColor: colors.border.light,
      marginRight: professionalSpacing[4],
      position: 'relative',
    },
    timelineDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: colors.primary.main,
      position: 'absolute',
      top: 6,
      left: -5,
    },
    timelineContent: {
      flex: 1,
      backgroundColor: colors.surface.primary,
      borderRadius: professionalBorderRadius.lg,
      padding: professionalSpacing[4],
      ...professionalShadows.sm,
    },
    eventHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: professionalSpacing[2],
    },
    eventIcon: {
      marginRight: professionalSpacing[3],
    },
    eventTitle: {
      ...designSystem.textStyles.h4,
      color: colors.text.primary,
      flex: 1,
    },
    eventTime: {
      ...designSystem.textStyles.caption,
      color: colors.text.secondary,
    },
    eventDescription: {
      ...designSystem.textStyles.body,
      color: colors.text.secondary,
      marginBottom: professionalSpacing[3],
    },
    eventActions: {
      flexDirection: 'row',
      gap: professionalSpacing[2],
    },
    actionButton: {
      paddingVertical: professionalSpacing[1],
      paddingHorizontal: professionalSpacing[3],
      borderRadius: professionalBorderRadius.sm,
      backgroundColor: colors.surface.secondary,
    },
    actionButtonText: {
      ...designSystem.textStyles.caption,
      color: colors.text.primary,
    },
    completedButton: {
      backgroundColor: colors.success.main,
    },
    completedButtonText: {
      color: colors.success.contrastText,
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
    addButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary.main,
      borderRadius: professionalBorderRadius.lg,
      padding: professionalSpacing[4],
      marginTop: professionalSpacing[4],
    },
    addButtonText: {
      ...designSystem.textStyles.button,
      color: colors.primary.contrastText,
      marginLeft: professionalSpacing[2],
    },
  });

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'flight': return 'airplane';
      case 'hotel': return 'bed';
      case 'activity': return 'walk';
      case 'meal': return 'restaurant';
      case 'transport': return 'car';
      default: return 'time';
    }
  };

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
            <Text style={styles.headerTitle} {...getTextProps('Trip Timeline', 'header')}>
              Trip Timeline
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              {...getButtonProps('Close timeline')}
            >
              <Ionicons name="close" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {events.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons
                  name="time-outline"
                  size={64}
                  color={colors.text.tertiary}
                  style={styles.emptyIcon}
                />
                <Text style={styles.emptyTitle} {...getTextProps('No Events Yet', 'header')}>
                  No Events Yet
                </Text>
                <Text style={styles.emptyDescription} {...getTextProps('Add events to create your trip timeline', 'text')}>
                  Add events to create your trip timeline
                </Text>
              </View>
            ) : (
              <View style={styles.timelineContainer}>
                {events.map((event, index) => (
                  <View key={event.id} style={styles.timelineItem}>
                    <View style={styles.timelineLine}>
                      <View style={styles.timelineDot} />
                    </View>
                    <View style={styles.timelineContent}>
                      <View style={styles.eventHeader}>
                        <Ionicons
                          name={getEventIcon(event.type) as any}
                          size={20}
                          color={colors.primary.main}
                          style={styles.eventIcon}
                        />
                        <Text style={styles.eventTitle} {...getTextProps(event.title, 'header')}>
                          {event.title}
                        </Text>
                        <Text style={styles.eventTime} {...getTextProps(event.time, 'text')}>
                          {event.time}
                        </Text>
                      </View>
                      <Text style={styles.eventDescription} {...getTextProps(event.description, 'text')}>
                        {event.description}
                      </Text>
                      <View style={styles.eventActions}>
                        <TouchableOpacity
                          style={[
                            styles.actionButton,
                            event.completed && styles.completedButton,
                          ]}
                          onPress={() => onEventUpdate(event.id, { completed: !event.completed })}
                          {...getButtonProps(
                            event.completed ? 'Mark as incomplete' : 'Mark as complete'
                          )}
                        >
                          <Text
                            style={[
                              styles.actionButtonText,
                              event.completed && styles.completedButtonText,
                            ]}
                            {...getTextProps('Edit event', 'button')}
                          >
                            {event.completed ? 'Completed' : 'Mark Complete'}
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={() => onEventDelete(event.id)}
                          {...getButtonProps('Delete event')}
                        >
                          <Text style={styles.actionButtonText} {...getTextProps('Delete', 'button')}>
                            Delete
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}

            <TouchableOpacity
              style={styles.addButton}
              onPress={() => onEventAdd({
                title: 'New Event',
                description: 'Event description',
                time: '12:00 PM',
                type: 'activity',
                completed: false,
              })}
              {...getButtonProps('Add new event')}
            >
              <Ionicons name="add" size={20} color={colors.primary.contrastText} />
              <Text style={styles.addButtonText} {...getTextProps('Add Event', 'button')}>
                Add Event
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};