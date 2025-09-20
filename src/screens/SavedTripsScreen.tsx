import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { databaseService, Trip } from '../services/database';
import { getSpendByDayForTrip } from '../services/database';
import { Section } from '../components/Section';
import { Chip } from '../components/Chip';
import { FormInput } from '../components/FormInput';
import { DatePicker } from '../components/DatePicker';
import { GroupTypeSelector } from '../components/GroupTypeSelector';
import { PreferenceSlider } from '../components/PreferenceSlider';
import { ActivityManagementScreen } from './ActivityManagementScreen';
import { WeatherWidget } from '../components/WeatherWidget';
import { ExpenseTracker } from '../components/ExpenseTracker';
import { formatDate, formatDateRange, formatRelativeDate } from '../utils/dateFormatting';
import { formatCurrency } from '../services/currency';

interface FormErrors {
  [key: string]: string;
}

export const SavedTripsScreen = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [overCapCounts, setOverCapCounts] = useState<Record<string, number>>({});
  const [spendByTrip, setSpendByTrip] = useState<Record<string, { day: number; total: number }[]>>({});
  const [totalSpendByTrip, setTotalSpendByTrip] = useState<Record<string, number>>({});

  // Edit form state
  const [editDestination, setEditDestination] = useState('');
  const [editCheckIn, setEditCheckIn] = useState('');
  const [editCheckOut, setEditCheckOut] = useState('');
  const [editBudget, setEditBudget] = useState(50);
  const [editActivityLevel, setEditActivityLevel] = useState(50);
  const [editDailyCap, setEditDailyCap] = useState<number | undefined>(undefined);
  const [editSelectedGroupType, setEditSelectedGroupType] = useState('couple');
  const [editSelectedInterests, setEditSelectedInterests] = useState<string[]>([]);
  const [editErrors, setEditErrors] = useState<FormErrors>({});
  const [editTouched, setEditTouched] = useState<Record<string, boolean>>({});
  
  // Activity management state
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [isActivityModalVisible, setIsActivityModalVisible] = useState(false);
  const [pendingInitialDay, setPendingInitialDay] = useState<number | undefined>(undefined);
  
  // Weather and expense tracking state
  const [isWeatherModalVisible, setIsWeatherModalVisible] = useState(false);
  const [isExpenseModalVisible, setIsExpenseModalVisible] = useState(false);
  const [weatherTrip, setWeatherTrip] = useState<Trip | null>(null);
  const [expenseTrip, setExpenseTrip] = useState<Trip | null>(null);

  // Define interests array
  const interests = [
    { id: 'adventure', label: 'Adventure' },
    { id: 'culture', label: 'Culture' },
    { id: 'food', label: 'Food & Dining' },
    { id: 'nature', label: 'Nature' },
    { id: 'nightlife', label: 'Nightlife' },
    { id: 'shopping', label: 'Shopping' },
    { id: 'relaxation', label: 'Relaxation' },
    { id: 'history', label: 'History' },
    { id: 'art', label: 'Art & Museums' },
    { id: 'sports', label: 'Sports' },
  ];

  useEffect(() => {
    initializeDatabase();
  }, []);

  const initializeDatabase = async () => {
    try {
      await databaseService.init();
      await loadTrips();
    } catch (error) {
      console.error('Error initializing database:', error);
      Alert.alert('Error', 'Failed to initialize database');
    } finally {
      setLoading(false);
    }
  };

  const loadTrips = async () => {
    try {
      const savedTrips = await databaseService.getAllTrips();
      setTrips(savedTrips);
      // compute over-cap days per trip
      const entries = await Promise.all(savedTrips.map(async (t) => {
        const cap = (t as any).dailySpendCap as number | undefined;
        if (typeof cap !== 'number' || cap == null) return [t.id, 0] as const;
        try {
          const byDay = await getSpendByDayForTrip(t.id);
          const over = byDay.filter(d => d.total > cap).length;
          return [t.id, over] as const;
        } catch {
          return [t.id, 0] as const;
        }
      }));
      setOverCapCounts(Object.fromEntries(entries));

      // store per-day spend breakdown
      const spendEntries = await Promise.all(savedTrips.map(async (t) => {
        try {
          const byDay = await getSpendByDayForTrip(t.id);
          return [t.id, byDay] as const;
        } catch {
          return [t.id, []] as const;
        }
      }));
      setSpendByTrip(Object.fromEntries(spendEntries));
      setTotalSpendByTrip(Object.fromEntries(spendEntries.map(([id, days]) => [id, (days as any[]).reduce((acc, d) => acc + (d.total || 0), 0)])));
    } catch (error) {
      console.error('Error loading trips:', error);
      Alert.alert('Error', 'Failed to load saved trips');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTrips();
    setRefreshing(false);
  };

  const handleTripCardPress = (trip: Trip) => {
    setSelectedTrip(trip);
    setIsActivityModalVisible(true);
  };

  const handleCloseActivityModal = () => {
    setIsActivityModalVisible(false);
    setSelectedTrip(null);
    setPendingInitialDay(undefined);
  };

  const handleWeatherPress = (trip: Trip) => {
    setWeatherTrip(trip);
    setIsWeatherModalVisible(true);
  };

  const handleCloseWeatherModal = () => {
    setIsWeatherModalVisible(false);
    setWeatherTrip(null);
  };

  const handleExpensePress = (trip: Trip) => {
    setExpenseTrip(trip);
    setIsExpenseModalVisible(true);
  };

  const handleCloseExpenseModal = () => {
    setIsExpenseModalVisible(false);
    setExpenseTrip(null);
  };

  const handleDeleteTrip = (tripId: string, tripDestination: string) => {
    Alert.alert(
      'Delete Trip',
      `Are you sure you want to delete your trip to ${tripDestination}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await databaseService.deleteTrip(tripId);
              await loadTrips();
              Alert.alert('Success', 'Trip deleted successfully');
            } catch (error) {
              console.error('Error deleting trip:', error);
              Alert.alert('Error', 'Failed to delete trip');
            }
          },
        },
      ]
    );
  };

  const handleEditTrip = (trip: Trip) => {
    setEditingTrip(trip);
    setEditDestination(trip.destination);
    setEditCheckIn(trip.checkIn);
    setEditCheckOut(trip.checkOut);
    setEditBudget(trip.budget);
    setEditActivityLevel(trip.activityLevel);
    setEditSelectedGroupType(trip.groupType);
    setEditSelectedInterests(parseInterests(trip.interests));
    setEditDailyCap((trip as any).dailySpendCap ?? undefined);
    setEditErrors({});
    setEditTouched({});
    setIsEditModalVisible(true);
  };

  const parseInterests = (interestsString: string): string[] => {
    try {
      return JSON.parse(interestsString);
    } catch {
      return [];
    }
  };

  const validateEditField = (field: string, value: any): string | undefined => {
    switch (field) {
      case 'editDestination':
        if (!value || value.trim().length === 0) {
          return 'Destination is required';
        }
        if (value.trim().length < 2) {
          return 'Destination must be at least 2 characters';
        }
        break;
      case 'editCheckIn':
        if (!value || value.trim().length === 0) {
          return 'Check-in date is required';
        }
        break;
      case 'editCheckOut':
        if (!value || value.trim().length === 0) {
          return 'Check-out date is required';
        }
        if (value && editCheckIn && new Date(value) <= new Date(editCheckIn)) {
          return 'Check-out must be after check-in';
        }
        break;
      case 'editBudget':
        if (value < 10) {
          return 'Budget must be at least $10';
        }
        break;
      case 'editActivityLevel':
        if (value < 0 || value > 100) {
          return 'Activity level must be between 0 and 100';
        }
        break;
      case 'editSelectedInterests':
        if (!value || value.length === 0) {
          return 'Please select at least one interest';
        }
        break;
      case 'editDailyCap':
        if (value != null && value !== '' && (isNaN(value) || Number(value) < 0)) {
          return 'Daily cap must be a positive number';
        }
        break;
      default:
        return undefined;
    }
    return undefined;
  };

  const handleEditFieldBlur = (field: string) => {
    setEditTouched(prev => ({ ...prev, [field]: true }));
    
    let value: any;
    switch (field) {
      case 'editDestination':
        value = editDestination;
        break;
      case 'editCheckIn':
        value = editCheckIn;
        break;
      case 'editCheckOut':
        value = editCheckOut;
        break;
      case 'editBudget':
        value = editBudget;
        break;
      case 'editActivityLevel':
        value = editActivityLevel;
        break;
      case 'editSelectedInterests':
        value = editSelectedInterests;
        break;
      case 'editDailyCap':
        value = editDailyCap;
        break;
      default:
        return;
    }

    const error = validateEditField(field, value);
    setEditErrors(prev => ({
      ...prev,
      [field]: error || '',
    }));
  };

  const handleSaveEdit = async () => {
    if (!editingTrip) return;

    // Mark all fields as touched
    const allFields = ['editDestination', 'editCheckIn', 'editCheckOut', 'editBudget', 'editActivityLevel', 'editSelectedInterests', 'editDailyCap'];
    const newTouched = allFields.reduce((acc, field) => ({ ...acc, [field]: true }), {});
    setEditTouched(newTouched);

    // Validate all fields
    const newErrors: FormErrors = {};
    allFields.forEach(field => {
      let value: any;
      switch (field) {
        case 'editDestination':
          value = editDestination;
          break;
        case 'editCheckIn':
          value = editCheckIn;
          break;
        case 'editCheckOut':
          value = editCheckOut;
          break;
        case 'editBudget':
          value = editBudget;
          break;
        case 'editActivityLevel':
          value = editActivityLevel;
          break;
        case 'editSelectedInterests':
          value = editSelectedInterests;
          break;
        case 'editDailyCap':
          value = editDailyCap;
          break;
      }
      const error = validateEditField(field, value);
      if (error) {
        newErrors[field] = error;
      }
    });

    setEditErrors(newErrors);

    // If there are errors, don't proceed
    if (Object.keys(newErrors).length > 0) {
      Alert.alert('Validation Error', 'Please fix the errors before saving');
      return;
    }

    setIsLoading(true);

    try {
      const tripData = {
        destination: editDestination.trim(),
        checkIn: editCheckIn,
        checkOut: editCheckOut,
        budget: editBudget,
        activityLevel: editActivityLevel,
        groupType: editSelectedGroupType,
        interests: JSON.stringify(editSelectedInterests),
        dailySpendCap: (editDailyCap != null && !isNaN(editDailyCap)) ? Math.round(Number(editDailyCap)) : null,
      };

      await databaseService.updateTrip(editingTrip.id, tripData);
      await loadTrips();
      
      setIsEditModalVisible(false);
      setEditingTrip(null);
      Alert.alert('Success', 'Trip updated successfully!');
    } catch (error) {
      console.error('Error updating trip:', error);
      Alert.alert('Error', 'Failed to update trip. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditInterestToggle = (interestId: string) => {
    setEditSelectedInterests(prev => {
      const newInterests = prev.includes(interestId)
        ? prev.filter(id => id !== interestId)
        : [...prev, interestId];
      
      // Validate interests when changed
      if (editTouched.editSelectedInterests) {
        const error = validateEditField('editSelectedInterests', newInterests);
        setEditErrors(prev => ({
          ...prev,
          editSelectedInterests: error || '',
        }));
      }
      
      return newInterests;
    });
  };


  const getGroupTypeIcon = (groupType: string) => {
    switch (groupType) {
      case 'solo': return '🚶';
      case 'couple': return '👫';
      case 'group': return '👥';
      default: return '👥';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4285F4" />
          <Text style={styles.loadingText}>Loading your trips...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>🗺️ Saved Trips</Text>
          <Text style={styles.subtitle}>
            {trips.length} {trips.length === 1 ? 'trip' : 'trips'} saved
          </Text>
        </View>

        {trips.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>✈️</Text>
            <Text style={styles.emptyTitle}>No trips saved yet</Text>
            <Text style={styles.emptySubtitle}>
              Create your first trip to see it here
            </Text>
            <Text style={styles.emptySubtitle}>
              Switch to the Create tab to plan your first trip
            </Text>
          </View>
        ) : (
          <View style={styles.tripsContainer}>
            {trips.map((trip) => (
              <TouchableOpacity 
                key={trip.id} 
                style={styles.tripCard}
                onPress={() => handleTripCardPress(trip)}
                activeOpacity={0.7}
              >
                <View style={styles.tripHeader}>
                  <View style={styles.tripTitleContainer}>
                    <Text style={styles.tripTitle}>{trip.destination}</Text>
                    <Text style={styles.tripGroupType}>
                      {getGroupTypeIcon(trip.groupType)} {trip.groupType}
                    </Text>
                    {typeof (trip as any).dailySpendCap === 'number' && (trip as any).dailySpendCap != null && (
                      <Text style={styles.tripCap}>Cap: ${(trip as any).dailySpendCap}</Text>
                    )}
                  </View>
                   <View style={styles.tripActions}>
                     {overCapCounts[trip.id] > 0 && (
                       <View style={styles.overCapBadge}>
                         <Text style={styles.overCapBadgeText}>{overCapCounts[trip.id]} over-cap day{overCapCounts[trip.id] > 1 ? 's' : ''}</Text>
                       </View>
                     )}
                     <TouchableOpacity
                       style={styles.actionButton}
                       onPress={() => handleWeatherPress(trip)}
                     >
                       <Text style={styles.actionButtonText}>🌤️</Text>
                     </TouchableOpacity>
                     <TouchableOpacity
                       style={styles.actionButton}
                       onPress={() => handleExpensePress(trip)}
                     >
                       <Text style={styles.actionButtonText}>💳</Text>
                     </TouchableOpacity>
                     <TouchableOpacity
                       style={styles.actionButton}
                       onPress={() => handleEditTrip(trip)}
                     >
                       <Text style={styles.actionButtonText}>✏️</Text>
                     </TouchableOpacity>
                     <TouchableOpacity
                       style={styles.actionButton}
                       onPress={() => handleDeleteTrip(trip.id, trip.destination)}
                     >
                       <Text style={styles.actionButtonText}>🗑️</Text>
                     </TouchableOpacity>
                   </View>
                </View>
                
                 <View style={styles.tripDetails}>
                   <View style={styles.tripDetailRow}>
                     <Text style={styles.tripDetailLabel}>📅 Dates:</Text>
                     <Text style={styles.tripDetailValue}>
                       {formatDateRange(trip.checkIn, trip.checkOut)}
                     </Text>
                   </View>
                   <View style={styles.tripDetailRow}>
                     <Text style={styles.tripDetailLabel}>💰 Budget:</Text>
                     <Text style={styles.tripDetailValue}>{/* formatted async via IIFE */}
                       {(() => {
                         // best-effort synchronous render with symbol; will not await here
                         return `£${trip.budget}/day`;
                       })()}
                     </Text>
                   </View>
                   {typeof totalSpendByTrip[trip.id] === 'number' && (
                     <View style={styles.tripDetailRow}>
                       <Text style={styles.tripDetailLabel}>🧾 Total Spend:</Text>
                       <Text style={styles.tripDetailValue}>{Math.round(totalSpendByTrip[trip.id])}</Text>
                     </View>
                   )}
                   <View style={styles.tripDetailRow}>
                     <Text style={styles.tripDetailLabel}>⚡ Activity:</Text>
                     <Text style={styles.tripDetailValue}>{trip.activityLevel}%</Text>
                   </View>
                   
                   {/* Weather Widget */}
                   <View style={styles.weatherContainer}>
                     <WeatherWidget 
                       location={trip.destination} 
                       compact={true}
                       onPress={() => handleWeatherPress(trip)}
                     />
                   </View>
                  {(spendByTrip[trip.id] && (spendByTrip[trip.id] as any).length > 0) && (
                    <View style={{ marginTop: 6 }}>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {(spendByTrip[trip.id] || []).map(({ day, total }) => {
                          const cap = (trip as any).dailySpendCap as number | undefined;
                          const over = typeof cap === 'number' && cap != null ? total > cap : false;
                          return (
                            <TouchableOpacity key={`${trip.id}-d${day}`} style={[styles.dayChip, over ? styles.dayChipOver : styles.dayChipOk]} onPress={() => { setSelectedTrip(trip); setIsActivityModalVisible(true); /* pass day via state below */ (setPendingInitialDay as any)?.(day); }}>
                              <Text style={styles.dayChipText}>D{day}: {total.toFixed(0)}{typeof cap==='number' ? `/${cap}`: ''}</Text>
                            </TouchableOpacity>
                          );
                        })}
                      </ScrollView>
                    </View>
                  )}
                </View>

                <View style={styles.interestsContainer}>
                  {parseInterests(trip.interests).map((interest, index) => (
                    <Chip
                      key={index}
                      label={interest}
                      selected={true}
                      onPress={() => {}}
                    />
                  ))}
                </View>

                <Text style={styles.tripDate}>
                  Created {formatRelativeDate(trip.createdAt)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Edit Modal */}
      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setIsEditModalVisible(false)}
            >
              <Text style={styles.modalCancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Edit Trip</Text>
            <TouchableOpacity
              style={[styles.modalSaveButton, isLoading && styles.modalSaveButtonDisabled]}
              onPress={handleSaveEdit}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.modalSaveButtonText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Section title="Where are you going?">
              <FormInput
                placeholder="e.g., Budapest, Prague, Barcelona..."
                value={editDestination}
                onChangeText={(text) => {
                  setEditDestination(text);
                  if (editTouched.editDestination) handleEditFieldBlur('editDestination');
                }}
                onBlur={() => handleEditFieldBlur('editDestination')}
                error={editTouched.editDestination ? editErrors.editDestination : undefined}
              />
            </Section>

            <Section title="When are you traveling?">
              <View style={styles.row}>
                <View style={styles.col}>
                  <DatePicker
                    value={editCheckIn}
                    onChange={(date) => {
                      setEditCheckIn(date);
                      if (editTouched.editCheckIn) handleEditFieldBlur('editCheckIn');
                    }}
                    placeholder="Select check-in date"
                    error={editTouched.editCheckIn ? editErrors.editCheckIn : undefined}
                    mode="date"
                  />
                </View>
                <View style={styles.col}>
                  <DatePicker
                    value={editCheckOut}
                    onChange={(date) => {
                      setEditCheckOut(date);
                      if (editTouched.editCheckOut) handleEditFieldBlur('editCheckOut');
                    }}
                    placeholder="Select check-out date"
                    error={editTouched.editCheckOut ? editErrors.editCheckOut : undefined}
                    minimumDate={editCheckIn ? new Date(editCheckIn) : undefined}
                    mode="date"
                  />
                </View>
              </View>
            </Section>

            <Section title="What's your budget?">
              <PreferenceSlider
                value={editBudget}
                onValueChange={setEditBudget}
                min={10}
                max={1000}
                step={10}
                label="Budget per day"
                unit="$"
                onBlur={() => handleEditFieldBlur('editBudget')}
                error={editTouched.editBudget ? editErrors.editBudget : undefined}
              />
            </Section>

            <Section title="Daily spend cap (optional)">
              <FormInput
                placeholder="e.g. 150"
                keyboardType="numeric"
                value={editDailyCap == null ? '' : String(editDailyCap)}
                onChangeText={(text) => {
                  const n = parseFloat(text);
                  setEditDailyCap(isNaN(n) ? undefined : n);
                  if (editTouched.editDailyCap) handleEditFieldBlur('editDailyCap');
                }}
                onBlur={() => handleEditFieldBlur('editDailyCap')}
                error={editTouched.editDailyCap ? editErrors.editDailyCap : undefined}
              />
            </Section>

            <Section title="How active do you want to be?">
              <PreferenceSlider
                value={editActivityLevel}
                onValueChange={setEditActivityLevel}
                min={0}
                max={100}
                step={5}
                label="Activity level"
                unit="%"
                onBlur={() => handleEditFieldBlur('editActivityLevel')}
                error={editTouched.editActivityLevel ? editErrors.editActivityLevel : undefined}
              />
            </Section>

            <Section title="Who's traveling?">
              <GroupTypeSelector
                selectedGroupType={editSelectedGroupType}
                onGroupTypeChange={setEditSelectedGroupType}
              />
            </Section>

            <Section title="What interests you?">
              <View style={styles.interestsContainer}>
                {interests.map((interest) => (
                  <Chip
                    key={interest.id}
                    label={interest.label}
                    selected={editSelectedInterests.includes(interest.id)}
                    onPress={() => handleEditInterestToggle(interest.id)}
                  />
                ))}
              </View>
              {editTouched.editSelectedInterests && editErrors.editSelectedInterests && (
                <Text style={styles.errorText}>{editErrors.editSelectedInterests}</Text>
              )}
            </Section>
          </ScrollView>
        </SafeAreaView>
      </Modal>

       {/* Activity Management Modal */}
       {selectedTrip && (
         <Modal
           visible={isActivityModalVisible}
           animationType="slide"
           presentationStyle="pageSheet"
         >
           <ActivityManagementScreen
             trip={selectedTrip}
             onClose={handleCloseActivityModal}
             initialDay={pendingInitialDay}
           />
         </Modal>
       )}

       {/* Weather Modal */}
       {weatherTrip && (
         <Modal
           visible={isWeatherModalVisible}
           animationType="slide"
           presentationStyle="pageSheet"
         >
           <SafeAreaView style={styles.modalContainer}>
             <View style={styles.modalHeader}>
               <Text style={styles.modalTitle}>Weather for {weatherTrip.destination}</Text>
               <TouchableOpacity onPress={handleCloseWeatherModal}>
                 <Text style={styles.modalCancelButtonText}>Close</Text>
               </TouchableOpacity>
             </View>
             <WeatherWidget location={weatherTrip.destination} />
           </SafeAreaView>
         </Modal>
       )}

       {/* Expense Tracker Modal */}
       {expenseTrip && (
         <ExpenseTracker
           tripId={expenseTrip.id}
           visible={isExpenseModalVisible}
           onClose={handleCloseExpenseModal}
         />
       )}
     </SafeAreaView>
   );
 };

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    marginBottom: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  backButton: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 14,
    color: '#4285F4',
    fontWeight: '500',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 60,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  createTripButton: {
    backgroundColor: '#4285F4',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createTripButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  tripsContainer: {
    gap: 16,
  },
  tripCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tripTitleContainer: {
    flex: 1,
  },
  tripTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  tripGroupType: {
    fontSize: 14,
    color: '#6B7280',
  },
  tripCap: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  tripActions: {
    flexDirection: 'row',
    gap: 8,
  },
  overCapBadge: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FCA5A5',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  overCapBadgeText: {
    color: '#B91C1C',
    fontSize: 12,
    fontWeight: '600',
  },
   actionButton: {
     backgroundColor: '#F3F4F6',
     paddingHorizontal: 8,
     paddingVertical: 6,
     borderRadius: 6,
     marginLeft: 4,
   },
   actionButtonText: {
     fontSize: 14,
   },
   editButton: {
     backgroundColor: '#F3F4F6',
     paddingHorizontal: 12,
     paddingVertical: 8,
     borderRadius: 6,
   },
   editButtonText: {
     fontSize: 16,
   },
   deleteButton: {
     backgroundColor: '#FEF2F2',
     paddingHorizontal: 12,
     paddingVertical: 8,
     borderRadius: 6,
   },
   deleteButtonText: {
     fontSize: 16,
   },
   weatherContainer: {
     marginTop: 12,
   },
  tripDetails: {
    marginBottom: 12,
  },
  tripDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  tripDetailLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  tripDetailValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
  },
  dayChip: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    marginRight: 6,
  },
  dayChipOk: {
    backgroundColor: '#DCFCE7',
  },
  dayChipOver: {
    backgroundColor: '#FEE2E2',
  },
  dayChipText: {
    fontSize: 12,
    color: '#111827',
    fontWeight: '600',
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  tripDate: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'right',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  col: {
    flex: 1,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  modalCancelButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  modalCancelButtonText: {
    fontSize: 16,
    color: '#6B7280',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  modalSaveButton: {
    backgroundColor: '#4285F4',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  modalSaveButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  modalSaveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
});