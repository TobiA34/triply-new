import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import { databaseService, Trip, Activity } from '../services/database';
import { CurrencyInput } from '../components/CurrencyInput';
import { DatePicker } from '../components/DatePicker';
import { DurationPicker } from '../components/DurationPicker';
import { validateForm, validateField, commonRules, ValidationErrors } from '../utils/formValidation';
import { formatTime } from '../utils/dateFormatting';
import { computeLeaveBy, estimateTravel, estimateWithAutoMode, pickAutoMode, TravelMode, TravelSettings } from '../services/travelTime';
import { loadTravelSettings, saveTravelSettings, loadTravelSettingsForTrip, saveTravelSettingsForTrip } from '../services/travelSettings';
import { scheduleLeaveByNotification, cancelAllScheduledNotifications } from '../services/notifications';
import * as ImagePicker from 'expo-image-picker';
import { extractAmountFromImage } from '../services/ocr';
import { loadCurrencySettings, saveCurrencySettings, getCurrencySymbol } from '../services/currency';

interface ActivityManagementScreenProps {
  trip: Trip;
  onClose: () => void;
  initialDay?: number;
}

export const ActivityManagementScreen = ({ trip, onClose, initialDay }: ActivityManagementScreenProps) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [defaultMode, setDefaultMode] = useState<'walk' | 'drive' | 'transit' | 'auto'>('auto');
  
  // Helper function to convert auto mode to actual travel mode
  const getTravelMode = (mode: 'walk' | 'drive' | 'transit' | 'auto'): 'walk' | 'drive' | 'transit' => {
    return mode === 'auto' ? 'walk' : mode;
  };
  const [travelSettings, setTravelSettings] = useState<TravelSettings>({ walkingSpeedKmh: 4.5, defaultBufferMin: 5 });
  const [useTripSettings, setUseTripSettings] = useState(false);
  const [nudge, setNudge] = useState<{ text: string; severity: 'info' | 'warn' | 'alert' } | null>(null);
  const [isPollVisible, setIsPollVisible] = useState(false);
  const [pollOptions, setPollOptions] = useState<string[]>(['Museum', 'Food tour', 'Boat ride']);
  const [votes, setVotes] = useState<Record<string, number>>({ Museum: 0, 'Food tour': 0, 'Boat ride': 0 });
  const [pollDay, setPollDay] = useState<number>(1);
  const [pollTime, setPollTime] = useState<string>('12:00');
  const [isDayPickerOpen, setIsDayPickerOpen] = useState(false);
  const [currencySymbol, setCurrencySymbol] = useState<string>('£');

  // Form state for adding/editing activities
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    duration: '',
    cost: '',
    description: '',
    location: '',
    time: '',
    day: 1,
    receiptUri: '' as string | undefined,
    bookingStatus: 'placeholder' as ('placeholder' | 'booked' | 'canceled'),
    bookingReminderTime: '' as string,
  });
  const [formErrors, setFormErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const activityTypes = useMemo(() => [
    'Adventure', 'Culture', 'Food', 'Nature', 'Nightlife', 
    'Shopping', 'Relaxation', 'History', 'Art', 'Sports', 'General'
  ], []);

  const validationRules = useMemo(() => ({
    name: { ...commonRules.name },
    type: { ...commonRules.required },
    duration: { required: true, minLength: 1 },
    cost: { ...commonRules.cost },
    description: { ...commonRules.description },
    location: { required: true, minLength: 2 },
    time: { ...commonRules.required },
    day: { ...commonRules.day },
  }), []);

  useEffect(() => {
    (async () => {
      try { await databaseService.init(); } catch {}
      loadActivities();
    })();
    // load persisted travel settings
    (async () => {
      const tripS = await loadTravelSettingsForTrip(trip.id);
      if (tripS) {
        setUseTripSettings(true);
        setDefaultMode(tripS.mode);
        setTravelSettings(tripS.settings);
      } else {
        const s = await loadTravelSettings();
        setDefaultMode(s.mode);
        setTravelSettings(s.settings);
      }
      // currency
      try {
        const cs = await loadCurrencySettings();
        setCurrencySymbol(getCurrencySymbol(cs.currency));
      } catch {}
    })();
  }, [trip.id]);

  // Helper: schedule notifications for all upcoming hops today
  const scheduleAllNotifications = useCallback(async () => {
    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const inSameDay = (iso: string) => {
        const d = new Date(iso);
        return d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth() && d.getDate() === today.getDate();
      };

      const todayActivities = activities
        .filter(a => a.day === Math.min(...activities.map(x => x.day)))
        .sort((a,b) => (a.time || '').localeCompare(b.time || ''));

      await cancelAllScheduledNotifications();

      for (let i = 0; i < todayActivities.length - 1; i++) {
        const cur = todayActivities[i];
        const next = todayActivities[i + 1];
        if (!next.time) continue;

        const toTodayISO = (timeStr: string) => {
          const [h, m] = (timeStr || '00:00').split(':').map(n => parseInt(n || '0',10));
          const d = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h || 0, m || 0, 0, 0);
          return d.toISOString();
        };

        const est = (defaultMode === 'auto') ? estimateWithAutoMode(
          { name: cur.location || cur.name },
          { name: next.location || next.name },
          travelSettings
        ) : estimateTravel(
          { name: cur.location || cur.name },
          { name: next.location || next.name },
          getTravelMode(defaultMode),
          travelSettings
        );

        const leave = computeLeaveBy(
          toTodayISO(cur.time || '00:00'),
          toTodayISO(next.time),
          { name: cur.location || cur.name },
          { name: next.location || next.name },
          est.mode,
          now.toISOString(),
          travelSettings
        );

        const leaveDate = new Date(leave.leaveByISO);
        if (leaveDate > now && inSameDay(leave.leaveByISO)) {
          // main leave-by alert
          await scheduleLeaveByNotification('Time to leave', `Depart to make ${next.name}`, leaveDate);
          // optional 5-minute heads up
          const fiveMin = new Date(leaveDate.getTime() - 5 * 60000);
          if (fiveMin > now) {
            await scheduleLeaveByNotification('Heads up', `Leave in 5 min for ${next.name}`, fiveMin);
          }
        }
      }
    } catch {}
  }, [activities, defaultMode, travelSettings]);

  // Periodic nudge checker (every 30 seconds)
  useEffect(() => {
    const compute = () => {
      try {
        const now = new Date();
        const todayActivities = activities
          .filter(a => a.day === Math.min(...activities.map(x => x.day))) // keep simple: first day with activities
          .sort((a,b) => (a.time || '').localeCompare(b.time || ''));
        for (let i = 0; i < todayActivities.length - 1; i++) {
          const cur = todayActivities[i];
          const next = todayActivities[i + 1];
          if (!next.time) continue;
          const toTodayISO = (timeStr: string) => {
            const [h, m] = (timeStr || '00:00').split(':').map(n => parseInt(n || '0',10));
            const d = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h || 0, m || 0, 0, 0);
            return d.toISOString();
          };
          const est = (defaultMode === 'auto') ? estimateWithAutoMode(
            { name: cur.location || cur.name },
            { name: next.location || next.name },
            travelSettings
          ) : estimateTravel(
            { name: cur.location || cur.name },
            { name: next.location || next.name },
            getTravelMode(defaultMode),
            travelSettings
          );
          const leave = computeLeaveBy(
            toTodayISO(cur.time || '00:00'),
            toTodayISO(next.time),
            { name: cur.location || cur.name },
            { name: next.location || next.name },
            est.mode,
            now.toISOString(),
            travelSettings
          );
          const minsToLeave = Math.round((new Date(leave.leaveByISO).getTime() - now.getTime()) / 60000);
          if (leave.status === 'late' || (leave.status === 'at_risk' && minsToLeave <= 5)) {
            setNudge({
              text: `${leave.status === 'late' ? 'You are late' : 'Time to leave'}: depart now to make ${formatTime(toTodayISO(next.time))}`,
              severity: leave.status === 'late' ? 'alert' : 'warn',
            });
            // schedule immediate notification if within 5 minutes
            if (minsToLeave <= 5) {
              scheduleLeaveByNotification('Time to leave', `Depart now to make ${next.name}`, new Date());
            }
            return;
          }
        }
        setNudge(null);
      } catch {}
    };

    const interval = setInterval(compute, 30000);
    compute(); // run once immediately
    return () => clearInterval(interval);
  }, [activities, defaultMode, travelSettings]);

  const loadActivities = useCallback(async () => {
    try {
      const activities = await databaseService.getActivitiesForTrip(trip.id);
      setActivities(activities);
    } catch (error) {
      console.error('Error loading activities:', error);
      Alert.alert('Error', 'Failed to load activities. Please try again.');
    }
  }, [trip.id]);

  const handleAddActivity = useCallback(() => {
    setFormData({
      name: '',
      type: '',
      duration: '',
      cost: '',
      description: '',
      location: '',
      time: '',
      day: 1,
      receiptUri: undefined,
      bookingStatus: 'placeholder',
      bookingReminderTime: '',
    });
    setFormErrors({});
    setTouched({});
    setIsAddModalVisible(true);
  }, []);

  const handleEditActivity = (activity: Activity) => {
    setFormData({
      name: activity.name,
      type: activity.type,
      duration: activity.duration,
      cost: activity.cost,
      description: activity.description,
      location: activity.location,
      time: activity.time,
      day: activity.day,
      receiptUri: (activity as any).receiptUri || undefined,
      bookingStatus: ((activity as any).bookingStatus || 'placeholder') as any,
      bookingReminderTime: (() => {
        const iso = (activity as any).bookingReminderISO as string | undefined;
        if (!iso) return '';
        const d = new Date(iso);
        const hh = String(d.getHours()).padStart(2,'0');
        const mm = String(d.getMinutes()).padStart(2,'0');
        return `${hh}:${mm}`;
      })(),
    });
    setEditingActivity(activity);
    setIsEditModalVisible(true);
  };

  const handleDeleteActivity = (activityId: string) => {
    Alert.alert(
      'Delete Activity',
      'Are you sure you want to delete this activity?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await databaseService.deleteActivity(activityId);
              setActivities(prev => prev.filter(activity => activity.id !== activityId));
            } catch (error) {
              console.error('Error deleting activity:', error);
              Alert.alert('Error', 'Failed to delete activity. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleSaveActivity = async () => {
    if (!formData.name.trim() || !formData.type.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      if (editingActivity) {
        // Update existing activity
        await databaseService.updateActivity(editingActivity.id, {
          name: formData.name,
          type: formData.type,
          duration: formData.duration,
          cost: formData.cost,
          description: formData.description,
          location: formData.location,
          time: formData.time,
          day: formData.day,
          receiptUri: formData.receiptUri || null,
          bookingStatus: formData.bookingStatus || null,
          bookingReminderISO: (() => {
            if (!formData.bookingReminderTime) return null;
            const now = new Date();
            const [h, m] = formData.bookingReminderTime.split(':').map(n=>parseInt(n||'0',10));
            const d = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h||0, m||0, 0, 0);
            return d.toISOString();
          })(),
        });
        
        setActivities(prev => 
          prev.map(activity => 
            activity.id === editingActivity.id 
              ? { ...activity, ...formData, bookingReminderISO: formData.bookingReminderTime ? (()=>{ const now = new Date(); const [h,m]=formData.bookingReminderTime.split(':').map(n=>parseInt(n||'0',10)); const d=new Date(now.getFullYear(), now.getMonth(), now.getDate(), h||0, m||0, 0,0); return d.toISOString(); })() : undefined }
              : activity
          )
        );
        setIsEditModalVisible(false);
        setEditingActivity(null);

        // Schedule booking reminder notification if set
        if (formData.bookingReminderTime) {
          const now = new Date();
          const [h, m] = formData.bookingReminderTime.split(':').map(n => parseInt(n || '0', 10));
          const reminderDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h || 0, m || 0, 0, 0);
          if (reminderDate > new Date()) {
            try { await scheduleLeaveByNotification('Booking reminder', `Confirm ${formData.name}`, reminderDate); } catch {}
          }
        }
      } else {
        // Create new activity
        const activityId = await databaseService.saveActivity({
          tripId: trip.id,
          name: formData.name,
          type: formData.type,
          duration: formData.duration,
          cost: formData.cost,
          description: formData.description,
          location: formData.location,
          time: formData.time,
          day: formData.day,
          receiptUri: formData.receiptUri || null,
          bookingStatus: formData.bookingStatus || null,
          bookingReminderISO: (() => {
            if (!formData.bookingReminderTime) return null;
            const now = new Date();
            const [h, m] = formData.bookingReminderTime.split(':').map(n=>parseInt(n||'0',10));
            const d = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h||0, m||0, 0, 0);
            return d.toISOString();
          })(),
        });
        
        const newActivity: Activity = {
          id: activityId,
          tripId: trip.id,
          name: formData.name,
          type: formData.type,
          duration: formData.duration,
          cost: formData.cost,
          description: formData.description,
          location: formData.location,
          time: formData.time,
          day: formData.day,
          receiptUri: formData.receiptUri || undefined,
          bookingStatus: formData.bookingStatus || undefined,
          bookingReminderISO: formData.bookingReminderTime ? (()=>{ const now = new Date(); const [h,m]=formData.bookingReminderTime.split(':').map(n=>parseInt(n||'0',10)); const d=new Date(now.getFullYear(), now.getMonth(), now.getDate(), h||0, m||0, 0,0); return d.toISOString(); })() : undefined,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as any;
        
        setActivities(prev => [...prev, newActivity]);
        setIsAddModalVisible(false);

        // Schedule booking reminder notification if set
        if (formData.bookingReminderTime) {
          const now = new Date();
          const [h, m] = formData.bookingReminderTime.split(':').map(n => parseInt(n || '0', 10));
          const reminderDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h || 0, m || 0, 0, 0);
          if (reminderDate > new Date()) {
            try { await scheduleLeaveByNotification('Booking reminder', `Confirm ${formData.name}`, reminderDate); } catch {}
          }
        }
      }

      setFormData({
        name: '',
        type: '',
        duration: '',
        cost: '',
        description: '',
        location: '',
        time: '',
        day: 1,
        receiptUri: undefined,
        bookingStatus: 'placeholder',
        bookingReminderTime: '',
      });
    } catch (error) {
      console.error('Error saving activity:', error);
      Alert.alert('Error', 'Failed to save activity. Please try again.');
    }
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    // Validate the field
    const validationRules = {
      name: commonRules.required,
      type: commonRules.required,
      duration: commonRules.required,
      cost: commonRules.required,
      description: commonRules.required,
      location: commonRules.required,
      time: commonRules.required,
      day: commonRules.required,
    };

    const rule = validationRules[field as keyof typeof validationRules];
    const error = rule ? validateField(formData[field as keyof typeof formData], rule) : undefined;
    setFormErrors(prev => ({ ...prev, [field]: error || '' }));
  };

  const groupActivitiesByDay = (activities: Activity[]) => {
    return activities.reduce((groups, activity) => {
      const day = activity.day;
      if (!groups[day]) {
        groups[day] = [];
      }
      groups[day].push(activity);
      return groups;
    }, {} as Record<number, Activity[]>);
  };

  const groupedActivities = useMemo(() => groupActivitiesByDay(activities), [activities]);
  const visibleDays = useMemo(() => {
    const days = Object.keys(groupedActivities).map(d => parseInt(d));
    if (!initialDay || !days.includes(initialDay)) return days;
    return [initialDay];
  }, [groupedActivities, initialDay]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onClose}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.title} numberOfLines={1}>Activities</Text>
            <Text style={styles.subtitle} numberOfLines={1}>{trip.destination}</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.actionButton} onPress={() => setIsPollVisible(true)}>
              <Text style={styles.actionButtonText}>🗳️</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={scheduleAllNotifications}>
              <Text style={styles.actionButtonText}>🔔</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={() => setIsSettingsVisible(true)}>
              <Text style={styles.actionButtonText}>⚙︎</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.addButton} onPress={handleAddActivity}>
              <Text style={styles.addButtonText}>+ Add</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {nudge && (
          <View style={[styles.banner, nudge.severity === 'alert' ? styles.bannerAlert : nudge.severity === 'warn' ? styles.bannerWarn : styles.bannerInfo]}>
            <Text style={styles.bannerText}>{nudge.text}</Text>
          </View>
        )}
        {(() => {
          if (!initialDay) return null;
          const cap = (trip as any).dailySpendCap as number | undefined;
          if (typeof cap !== 'number' || cap == null) return null;
          const dayActs = activities.filter(a => a.day === initialDay);
          const total = dayActs.reduce((acc, a) => acc + (parseFloat(a.cost || '0') || 0), 0);
          const over = total > cap;
          return (
            <View style={[styles.banner, over ? styles.bannerAlert : styles.bannerInfo]}>
              <Text style={styles.bannerText}>Day {initialDay} spend: {total.toFixed(2)} / {cap.toFixed(2)}</Text>
            </View>
          );
        })()}
        {Object.keys(groupedActivities).length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Text style={styles.emptyIcon}>🎯</Text>
            </View>
            <Text style={styles.emptyTitle}>No activities yet</Text>
            <Text style={styles.emptySubtitle}>Tap the + Add button to create your first activity</Text>
          </View>
        ) : (
          Object.entries(groupedActivities)
            .filter(([day]) => !initialDay || parseInt(day) === initialDay)
            .sort(([a], [b]) => parseInt(a) - parseInt(b))
            .map(([day, dayActivities]) => (
              <View key={day} style={styles.daySection}>
                <Text style={styles.dayTitle}>Day {day}</Text>
                {(() => {
                  const total = (dayActivities as Activity[]).reduce((acc, a) => acc + (parseFloat(a.cost || '0') || 0), 0);
                  const cap = (trip as any).dailySpendCap as number | undefined;
                  if (typeof cap !== 'number' || cap == null) return null;
                  const over = total > cap;
                  return (
                    <Text style={[styles.daySpend, over ? styles.overCap : styles.underCap]}>Spend {total.toFixed(2)} / {cap.toFixed(2)}</Text>
                  );
                })()}
                {dayActivities.map((activity, idx) => {
                  const next = dayActivities[idx + 1];

                  // Helper: build a Date ISO for today with HH:MM from activity.time
                  const toTodayISO = (timeStr: string) => {
                    const now = new Date();
                    const [h, m] = (timeStr || '00:00').split(':').map((n) => parseInt(n || '0', 10));
                    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h || 0, m || 0, 0, 0);
                    return d.toISOString();
                  };

                  // Compute travel/leave-by only if there is a next activity with a start time
                  let leaveByInfo: {
                    text: string;
                    status: 'on_time' | 'at_risk' | 'late';
                  } | null = null;

                  if (next && next.time) {
                    const mode: TravelMode = getTravelMode(defaultMode);
                    const est = (defaultMode === 'auto') ? estimateWithAutoMode(
                      { name: activity.location || activity.name },
                      { name: next.location || next.name },
                      travelSettings
                    ) : estimateTravel(
                      { name: activity.location || activity.name },
                      { name: next.location || next.name },
                      mode,
                      travelSettings
                    );
                    const leave = computeLeaveBy(
                      toTodayISO(activity.time || '00:00'),
                      toTodayISO(next.time),
                      { name: activity.location || activity.name },
                      { name: next.location || next.name },
                      getTravelMode(defaultMode),
                      undefined,
                      travelSettings
                    );
                    const leaveByFormatted = formatTime(new Date(leave.leaveByISO).toISOString());
                    leaveByInfo = {
                      text: `Leave by ${leaveByFormatted} • ${est.durationMin} min + ${est.bufferMin} min buffer • ${est.distanceKm} km` ,
                      status: leave.status,
                    };
                  }

                  return (
                  <View key={activity.id} style={styles.activityCard}>
                    <View style={styles.activityHeader}>
                      <View style={styles.activityTitleContainer}>
                        <Text style={styles.activityName}>{activity.name}</Text>
                        <View style={styles.activityTypeBadge}>
                          <Text style={styles.activityTypeText}>{activity.type}</Text>
                        </View>
                      </View>
                      <View style={styles.activityActions}>
                        <TouchableOpacity
                          style={styles.editButton}
                          onPress={() => handleEditActivity(activity)}
                        >
                          <Text style={styles.editButtonText}>Edit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.deleteButton}
                          onPress={() => handleDeleteActivity(activity.id)}
                        >
                          <Text style={styles.deleteButtonText}>Delete</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                    
                    {activity.description && (
                      <Text style={styles.activityDescription}>{activity.description}</Text>
                    )}
                    
                    <View style={styles.activityDetails}>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailIcon}>📍</Text>
                        <Text style={styles.activityDetail}>{activity.location}</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailIcon}>⏱️</Text>
                        <Text style={styles.activityDetail}>{activity.duration}</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailIcon}>💰</Text>
                        <Text style={styles.activityDetail}>{currencySymbol}{activity.cost}</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailIcon}>🕐</Text>
                        <Text style={styles.activityDetail}>{formatTime(activity.time)}</Text>
                      </View>
                      {(activity as any).bookingStatus && (
                        <View style={styles.detailRow}>
                          <Text style={styles.detailIcon}>📑</Text>
                          <Text style={styles.activityDetail}>{(activity as any).bookingStatus}</Text>
                        </View>
                      )}
                      {(activity as any).receiptUri && (
                        <View style={styles.detailRow}>
                          <Text style={styles.detailIcon}>🧾</Text>
                          <Text style={styles.activityDetail}>Receipt attached</Text>
                        </View>
                      )}
                    </View>
                    
                    {leaveByInfo && (
                      <View style={[
                        styles.nudgeRow, 
                        leaveByInfo.status === 'on_time' ? styles.nudgeOntime :
                        leaveByInfo.status === 'at_risk' ? styles.nudgeAtrisk :
                        styles.nudgeLate
                      ]}>
                        <Text style={styles.nudgeText}>
                          {leaveByInfo.text}
                        </Text>
                      </View>
                    )}
                  </View>
                )})}
              </View>
            ))
        )}
      </ScrollView>

      {/* Add Activity Modal */}
      <Modal
        visible={isAddModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setIsAddModalVisible(false)}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add Activity</Text>
            <TouchableOpacity onPress={handleSaveActivity}>
              <Text style={styles.saveButton}>Save</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Activity Name *</Text>
              <TextInput
                style={styles.textInput}
                value={formData.name}
                onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                placeholder="Enter activity name"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Type *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeSelector}>
                {activityTypes.map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeChip,
                      formData.type === type && styles.selectedTypeChip
                    ]}
                    onPress={() => setFormData(prev => ({ ...prev, type }))}
                  >
                    <Text style={[
                      styles.typeChipText,
                      formData.type === type && styles.selectedTypeChipText
                    ]}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={formData.description}
                onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                placeholder="Enter activity description"
                multiline={true}
                numberOfLines={3}
              />
            </View>
            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>Duration</Text>
                <DurationPicker
                  value={formData.duration}
                  onChange={(duration) => setFormData(prev => ({ ...prev, duration }))}
                  error={touched.duration ? formErrors.duration : undefined}
                />
              </View>
              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>Cost</Text>
                <CurrencyInput
                  value={formData.cost}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, cost: text }))}
                  onBlur={() => handleBlur('cost')}
                  placeholder="0.00"
                  error={touched.cost ? formErrors.cost : undefined}
                />
              </View>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Booking Status</Text>
              <View style={[styles.row, { flexWrap: 'nowrap' }]}>
                {(['placeholder','booked','canceled'] as const).map((st) => {
                  const selected = formData.bookingStatus === st;
                  return (
                    <TouchableOpacity
                      key={st}
                      activeOpacity={0.8}
                      style={[styles.typeChip, selected ? styles.selectedTypeChip : null]}
                      onPress={() => {
                        if (!selected) setFormData(prev => ({ ...prev, bookingStatus: st }));
                      }}
                    >
                      <Text style={[styles.typeChipText, selected ? styles.selectedTypeChipText : null]} numberOfLines={1}>
                        {st}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Booking Reminder</Text>
              <DatePicker
                value={formData.bookingReminderTime}
                onChange={(time) => setFormData(prev => ({ ...prev, bookingReminderTime: time }))}
                mode="time"
                placeholder="e.g. 09:00"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Receipt</Text>
              <View style={styles.row}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={async () => {
                    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 });
                    if (!res.canceled && res.assets && res.assets[0]) {
                      const uri = res.assets[0].uri;
                      setFormData(prev => ({ ...prev, receiptUri: uri }));
                      const amt = await extractAmountFromImage(uri);
                      const asNumber = parseFloat(formData.cost || '');
                      const costValid = Number.isFinite(asNumber) && asNumber > 0;
                      if (amt != null && !costValid) {
                        setFormData(prev => ({ ...prev, cost: String(amt.toFixed(2)) }));
                      }
                    }
                  }}
                >
                  <Text style={styles.editButtonText}>{formData.receiptUri ? 'Change Receipt' : 'Upload Receipt'}</Text>
                </TouchableOpacity>
                {formData.receiptUri ? (
                  <Text style={[styles.activityDetail, { alignSelf: 'center' }]}>Attached</Text>
                ) : null}
              </View>
            </View>
            {/* Removed duplicate Booking Status/Reminder/Receipt to declutter */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Location</Text>
              <TextInput
                style={styles.textInput}
                value={formData.location}
                onChangeText={(text) => setFormData(prev => ({ ...prev, location: text }))}
                placeholder="Enter location"
              />
            </View>
            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>Time</Text>
                <DatePicker
                  value={formData.time}
                  onChange={(time) => setFormData(prev => ({ ...prev, time }))}
                  mode="time"
                  error={touched.time ? formErrors.time : undefined}
                />
              </View>
              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>Day</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.day.toString()}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, day: parseInt(text) || 1 }))}
                  placeholder="Day number"
                  keyboardType="numeric"
                />
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Edit Activity Modal */}
      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setIsEditModalVisible(false)}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Edit Activity</Text>
            <TouchableOpacity onPress={handleSaveActivity}>
              <Text style={styles.saveButton}>Save</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Activity Name *</Text>
              <TextInput
                style={styles.textInput}
                value={formData.name}
                onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                placeholder="Enter activity name"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Type *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeSelector}>
                {activityTypes.map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeChip,
                      formData.type === type && styles.selectedTypeChip
                    ]}
                    onPress={() => setFormData(prev => ({ ...prev, type }))}
                  >
                    <Text style={[
                      styles.typeChipText,
                      formData.type === type && styles.selectedTypeChipText
                    ]}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={formData.description}
                onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                placeholder="Enter activity description"
                multiline={true}
                numberOfLines={3}
              />
            </View>
            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>Duration</Text>
                <DurationPicker
                  value={formData.duration}
                  onChange={(duration) => setFormData(prev => ({ ...prev, duration }))}
                  error={touched.duration ? formErrors.duration : undefined}
                />
              </View>
              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>Cost</Text>
                <CurrencyInput
                  value={formData.cost}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, cost: text }))}
                  onBlur={() => handleBlur('cost')}
                  placeholder="0.00"
                  error={touched.cost ? formErrors.cost : undefined}
                />
              </View>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Location</Text>
              <TextInput
                style={styles.textInput}
                value={formData.location}
                onChangeText={(text) => setFormData(prev => ({ ...prev, location: text }))}
                placeholder="Enter location"
              />
            </View>
            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>Time</Text>
                <DatePicker
                  value={formData.time}
                  onChange={(time) => setFormData(prev => ({ ...prev, time }))}
                  mode="time"
                  error={touched.time ? formErrors.time : undefined}
                />
              </View>
              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>Day</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.day.toString()}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, day: parseInt(text) || 1 }))}
                  placeholder="Day number"
                  keyboardType="numeric"
                />
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Travel Settings Modal */}
      <Modal
        visible={isSettingsVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={async () => { 
              if (useTripSettings) {
                await saveTravelSettingsForTrip(trip.id, { mode: getTravelMode(defaultMode), settings: travelSettings });
              } else {
                await saveTravelSettings({ mode: getTravelMode(defaultMode), settings: travelSettings });
              }
              setIsSettingsVisible(false);
            }}>
              <Text style={styles.cancelButton}>Close</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Travel Settings</Text>
            <View style={{ width: 48 }} />
          </View>
          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Default Mode</Text>
              <View style={styles.row}>
                {(['auto','walk','drive','transit'] as (TravelMode|'auto')[]).map((mode) => (
                  <TouchableOpacity
                    key={mode}
                    style={[styles.typeChip, defaultMode === mode && styles.selectedTypeChip]}
                    onPress={() => setDefaultMode(mode)}
                  >
                    <Text style={[styles.typeChipText, defaultMode === mode && styles.selectedTypeChipText]}>
                      {mode}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Currency</Text>
              <View style={styles.row}>
                {(['GBP','USD','EUR'] as const).map((code) => (
                  <TouchableOpacity
                    key={code}
                    style={[styles.typeChip, getCurrencySymbol(code) === currencySymbol && styles.selectedTypeChip]}
                    onPress={async () => {
                      try {
                        await saveCurrencySettings({ currency: code });
                        setCurrencySymbol(getCurrencySymbol(code));
                      } catch {}
                    }}
                  >
                    <Text style={[styles.typeChipText, getCurrencySymbol(code) === currencySymbol && styles.selectedTypeChipText]}>
                      {getCurrencySymbol(code)} {code}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <TouchableOpacity onPress={() => setUseTripSettings(v => !v)}>
                <Text style={styles.inputLabel}>{useTripSettings ? '✓ Using trip-specific settings' : 'Use trip-specific settings'}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>Walking Speed (km/h)</Text>
                <TextInput
                  style={styles.textInput}
                  keyboardType="numeric"
                  value={String(travelSettings.walkingSpeedKmh)}
                  onChangeText={(t) => setTravelSettings((s) => ({ ...s, walkingSpeedKmh: Math.max(2, Math.min(7, parseFloat(t) || 0)) }))}
                  placeholder="4.5"
                />
              </View>
              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>Default Buffer (min)</Text>
                <TextInput
                  style={styles.textInput}
                  keyboardType="numeric"
                  value={String(travelSettings.defaultBufferMin)}
                  onChangeText={(t) => setTravelSettings((s) => ({ ...s, defaultBufferMin: Math.max(0, Math.min(30, parseInt(t || '0'))) }))}
                  placeholder="5"
                />
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Group Poll Modal */}
      <Modal
        visible={isPollVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setIsPollVisible(false)}>
              <Text style={styles.cancelButton}>Close</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Group Poll</Text>
            <TouchableOpacity
              onPress={() => {
                // determine winner and merge into itinerary on current day
                const winner = Object.entries(votes).sort((a,b) => b[1]-a[1])[0]?.[0];
                const validTime = /^([0-1]\d|2[0-3]):([0-5]\d)$/.test(pollTime);
                const validDay = Number.isFinite(pollDay) && pollDay >= 1;
                if (!winner || !validTime || !validDay) { setIsPollVisible(false); return; }
                const newActivity = {
                  tripId: trip.id,
                  name: winner,
                  type: 'General',
                  duration: '1 hour',
                  cost: '0',
                  description: `Added from poll: ${winner}`,
                  location: winner,
                  time: pollTime,
                  day: pollDay,
                } as any;
                // Save poll to DB
                databaseService.savePoll({ tripId: trip.id, day: pollDay, time: pollTime, options: JSON.stringify(pollOptions), votes: JSON.stringify(votes) } as any).catch(()=>{});
                databaseService.saveActivity(newActivity).then((id) => {
                  setActivities(prev => [...prev, { ...newActivity, id, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as any]);
                  setIsPollVisible(false);
                });
              }}
            >
              <Text style={styles.saveButton}>Merge</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>Day</Text>
                <TouchableOpacity
                  style={[styles.textInput, { justifyContent: 'center' }]}
                  onPress={() => setIsDayPickerOpen(true)}
                  activeOpacity={0.8}
                >
                  <Text style={{ fontSize: 16 }}>{String(pollDay)}</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>Time</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="HH:MM"
                  value={pollTime}
                  onChangeText={setPollTime}
                />
              </View>
            </View>
            {pollOptions.map((opt) => (
              <View key={opt} style={styles.pollRow}>
                <Text style={styles.pollOption}>{opt}</Text>
                <View style={styles.row}>
                  <TouchableOpacity
                    style={styles.voteButton}
                    onPress={() => setVotes(prev => ({ ...prev, [opt]: (prev[opt] || 0) + 1 }))}
                  >
                    <Text style={styles.voteText}>+1</Text>
                  </TouchableOpacity>
                  <Text style={styles.voteCount}>{votes[opt] || 0}</Text>
                </View>
              </View>
            ))}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Add Option</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Activity option"
                maxLength={60}
                returnKeyType="done"
                onSubmitEditing={(e) => {
                  const val = e.nativeEvent.text?.trim();
                  if (!val || val.length < 2) return;
                  if (!pollOptions.includes(val)) {
                    setPollOptions(prev => [...prev, val]);
                    setVotes(prev => ({ ...prev, [val]: 0 }));
                  }
                }}
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Day dropdown picker */}
      <Modal visible={isDayPickerOpen} transparent animationType="fade" onRequestClose={() => setIsDayPickerOpen(false)}>
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerCard}>
            <Text style={styles.pickerTitle}>Select Day</Text>
            <ScrollView style={{ maxHeight: 300 }}>
              {Array.from({ length: 30 }, (_, i) => i + 1).map((d) => (
                <TouchableOpacity key={d} style={styles.pickerItem} onPress={() => { setPollDay(d); setIsDayPickerOpen(false); }}>
                  <Text style={styles.pickerItemText}>Day {d}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.pickerCancel} onPress={() => setIsDayPickerOpen(false)}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.paper,
  },
  safeArea: {
    backgroundColor: colors.surface.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    ...shadows.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    paddingBottom: spacing.md,
  },
  backButton: { 
    paddingHorizontal: spacing.sm, 
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  backButtonText: { 
    fontSize: typography?.fontSize?.xl || 20, 
    color: colors.text.primary,
      fontFamily: typography?.fontFamily?.bold || 'System',
  },
  headerCenter: { 
    flex: 1, 
    paddingHorizontal: spacing.md,
    alignItems: 'center',
  },
  title: {
    fontSize: typography?.fontSize?.lg || 18,
      fontFamily: typography?.fontFamily?.semibold || 'System',
    color: colors.text.primary,
    lineHeight: typography?.lineHeight?.lg || 28,
  },
  subtitle: {
    fontSize: typography?.fontSize?.sm || 14,
      fontFamily: typography?.fontFamily?.regular || 'System',
    color: colors.text.secondary,
    lineHeight: typography?.lineHeight?.sm || 20,
    marginTop: spacing.xs,
  },
  headerActions: { 
    flexDirection: 'row', 
    alignItems: 'center',
    gap: spacing.sm,
  },
  actionButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  actionButtonText: {
    fontSize: typography?.fontSize?.lg || 18,
    color: colors.text.secondary,
  },
  addButton: {
    backgroundColor: colors.primary.main,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  addButtonText: {
    color: colors.primary.contrastText,
    fontSize: typography?.fontSize?.sm || 14,
      fontFamily: typography?.fontFamily?.semibold || 'System',
    lineHeight: typography?.lineHeight?.sm || 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  banner: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
  },
  bannerText: {
    color: colors.text.primary,
    fontSize: typography?.fontSize?.sm || 14,
      fontFamily: typography?.fontFamily?.semibold || 'System',
    lineHeight: typography?.lineHeight?.sm || 20,
  },
  bannerInfo: {
    backgroundColor: colors.status.info + '20',
    borderLeftWidth: 4,
    borderLeftColor: colors.status.info,
  },
  bannerWarn: {
    backgroundColor: colors.status.warning + '20',
    borderLeftWidth: 4,
    borderLeftColor: colors.status.warning,
  },
  bannerAlert: {
    backgroundColor: colors.status.error + '20',
    borderLeftWidth: 4,
    borderLeftColor: colors.status.error,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['6xl'],
    paddingTop: spacing['6xl'],
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  emptyIcon: {
    fontSize: 40,
  },
  emptyTitle: {
    fontSize: typography?.fontSize?.xl || 20,
      fontFamily: typography?.fontFamily?.semibold || 'System',
    color: colors.text.primary,
    marginBottom: spacing.sm,
    lineHeight: typography?.lineHeight?.xl || 28,
  },
  emptySubtitle: {
    fontSize: typography?.fontSize?.base || 16,
      fontFamily: typography?.fontFamily?.regular || 'System',
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: typography?.lineHeight?.base || 24,
    maxWidth: 280,
  },
  daySection: {
    marginBottom: spacing['3xl'],
  },
  dayTitle: {
    fontSize: typography?.fontSize?.lg || 18,
      fontFamily: typography?.fontFamily?.semibold || 'System',
    color: colors.text.primary,
    marginBottom: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary.main,
    lineHeight: typography?.lineHeight?.lg || 28,
  },
  activityCard: {
    backgroundColor: colors.surface.primary,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    ...shadows.md,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  activityTitleContainer: {
    flex: 1,
    marginRight: spacing.md,
  },
  activityName: {
    fontSize: typography?.fontSize?.base || 16,
      fontFamily: typography?.fontFamily?.semibold || 'System',
    color: colors.text.primary,
    lineHeight: typography?.lineHeight?.base || 24,
    marginBottom: spacing.xs,
  },
  activityTypeBadge: {
    backgroundColor: colors.primary.main + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  activityTypeText: {
    fontSize: typography?.fontSize?.xs || 12,
      fontFamily: typography?.fontFamily?.medium || 'System',
    color: colors.primary.main,
    textTransform: 'uppercase',
    letterSpacing: typography?.letterSpacing?.wide || 0.5,
  },
  activityActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  editButton: {
    backgroundColor: colors.surface.secondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  editButtonText: {
    fontSize: typography?.fontSize?.xs || 12,
      fontFamily: typography?.fontFamily?.medium || 'System',
    color: colors.primary.main,
    lineHeight: typography?.lineHeight?.xs || 16,
  },
  deleteButton: {
    backgroundColor: colors.status.error + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  deleteButtonText: {
    fontSize: typography?.fontSize?.xs || 12,
      fontFamily: typography?.fontFamily?.medium || 'System',
    color: colors.status.error,
    lineHeight: typography?.lineHeight?.xs || 16,
  },
  activityDescription: {
    fontSize: typography?.fontSize?.sm || 14,
      fontFamily: typography?.fontFamily?.regular || 'System',
    color: colors.text.secondary,
    marginBottom: spacing.md,
    lineHeight: typography?.lineHeight?.sm || 20,
  },
  activityDetails: {
    gap: spacing.xs,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  detailIcon: {
    fontSize: typography?.fontSize?.sm || 14,
    width: 20,
  },
  activityDetail: {
    fontSize: typography?.fontSize?.sm || 14,
      fontFamily: typography?.fontFamily?.regular || 'System',
    color: colors.text.secondary,
    lineHeight: typography?.lineHeight?.sm || 20,
    flex: 1,
  },
  nudgeRow: {
    marginTop: spacing.sm,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
  },
  nudgeOntime: {
    backgroundColor: colors.status.success + '20',
  },
  nudgeAtrisk: {
    backgroundColor: colors.status.warning + '20',
  },
  nudgeLate: {
    backgroundColor: colors.status.error + '20',
  },
  nudgeText: {
    fontSize: typography?.fontSize?.xs || 12,
      fontFamily: typography?.fontFamily?.medium || 'System',
    lineHeight: typography?.lineHeight?.xs || 16,
  },
  daySpend: {
    fontSize: typography?.fontSize?.sm || 14,
      fontFamily: typography?.fontFamily?.medium || 'System',
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  overCap: {
    color: colors.status.error,
  },
  underCap: {
    color: colors.status.success,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  cancelButton: {
    fontSize: 16,
    color: '#6B7280',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  saveButton: {
    fontSize: 16,
    color: '#4285F4',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  typeSelector: {
    marginBottom: 8,
  },
  typeChip: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
  },
  selectedTypeChip: {
    backgroundColor: '#4285F4',
  },
  typeChipText: {
    fontSize: 14,
    color: '#6B7280',
  },
  selectedTypeChipText: {
    color: '#FFFFFF',
  },
  pollRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  pollOption: {
    fontSize: 16,
    color: '#111827',
  },
  voteButton: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 8,
  },
  voteText: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '600',
  },
  voteCount: {
    fontSize: 14,
    color: '#6B7280',
    minWidth: 20,
    textAlign: 'center',
  },
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    padding: 24,
  },
  pickerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  pickerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  pickerItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  pickerItemText: {
    fontSize: 16,
    color: '#111827',
  },
  pickerCancel: {
    marginTop: 8,
    alignSelf: 'center',
  },
});
