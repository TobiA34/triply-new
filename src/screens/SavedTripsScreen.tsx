import React, { useState, useEffect, useMemo } from 'react';
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
  TextInput,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { databaseService, Trip } from '../services/database';
import { getSpendByDayForTrip } from '../services/database';
import { TripCard } from '../components/TripCard';
import { EnhancedHeader } from '../components/EnhancedHeader';
import { EnhancedButton } from '../components/EnhancedButton';
import { EditTripScreen } from './EditTripScreen';
import { ActivityModal } from '../components/ActivityModal';
import { WeatherWidget } from '../components/WeatherWidget';
import { ExpenseTracker } from '../components/ExpenseTracker';
import { PackingAssistant } from '../components/PackingAssistant';
import { SocialSharing } from '../components/SocialSharing';
import { AnalyticsDashboard } from '../components/AnalyticsDashboard';
import { SmartRecommendations } from '../components/SmartRecommendations';
import { TripTimeline } from '../components/TripTimeline';
import { TripPhotos } from '../components/TripPhotos';
import { TripNotes } from '../components/TripNotes';
import { TripChecklist } from '../components/TripChecklist';
import { TripMap } from '../components/TripMap';
import { formatDate, formatDateRange, formatRelativeDate } from '../utils/dateFormatting';
import { useCurrency } from '../contexts/CurrencyContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLocalization } from '../contexts/LocalizationContext';
import { useCompactMode } from '../contexts/CompactModeContext';
import { useAccessibility } from '../hooks/useAccessibility';
import { useThemeColors } from '../hooks/useThemeColors';
import { designSystem, professionalSpacing, professionalShadows, professionalBorderRadius } from '../theme/designSystem';

interface FormErrors {
  [key: string]: string;
}

interface SavedTripsScreenProps {
  onNavigateToSetup?: () => void;
  onNavigateToItinerary?: () => void;
  onOpenActivities?: (trip: Trip) => void;
}

export const SavedTripsScreen = ({ onNavigateToSetup, onNavigateToItinerary, onOpenActivities }: SavedTripsScreenProps = {}) => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [filteredTrips, setFilteredTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'destination' | 'budget'>('date');
  const [filterBy, setFilterBy] = useState<'all' | 'upcoming' | 'completed' | 'current'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [isEditScreenVisible, setIsEditScreenVisible] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [isActivityModalVisible, setIsActivityModalVisible] = useState(false);
  const [selectedTripForActivity, setSelectedTripForActivity] = useState<Trip | null>(null);
  const [editingActivity, setEditingActivity] = useState<any>(null);
  const [tripActivities, setTripActivities] = useState<Record<string, any[]>>({});
  
  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];
  
  // Modal states
  const [isWeatherModalVisible, setIsWeatherModalVisible] = useState(false);
  const [isExpenseModalVisible, setIsExpenseModalVisible] = useState(false);
  const [isPackingModalVisible, setIsPackingModalVisible] = useState(false);
  const [isSocialModalVisible, setIsSocialModalVisible] = useState(false);
  const [isAnalyticsModalVisible, setIsAnalyticsModalVisible] = useState(false);
  const [isRecommendationsModalVisible, setIsRecommendationsModalVisible] = useState(false);
  const [isTimelineModalVisible, setIsTimelineModalVisible] = useState(false);
  const [isPhotosModalVisible, setIsPhotosModalVisible] = useState(false);
  const [isNotesModalVisible, setIsNotesModalVisible] = useState(false);
  const [isChecklistModalVisible, setIsChecklistModalVisible] = useState(false);
  const [isMapModalVisible, setIsMapModalVisible] = useState(false);

  // Photos state per trip (in-memory for now; can be persisted later)
  interface PhotoItem { id: string; uri: string; caption: string; timestamp: string; location?: string }
  const [photosByTrip, setPhotosByTrip] = useState<Record<string, PhotoItem[]>>({});
  
  // Selected trip for features
  const [selectedTripForFeature, setSelectedTripForFeature] = useState<Trip | null>(null);
  const [weatherTrip, setWeatherTrip] = useState<Trip | null>(null);
  const [expenseTrip, setExpenseTrip] = useState<Trip | null>(null);
  const [packingTrip, setPackingTrip] = useState<Trip | null>(null);
  const [socialTrip, setSocialTrip] = useState<Trip | null>(null);

  // Data states
  const [totalSpendByTrip, setTotalSpendByTrip] = useState<Record<string, number>>({});
  const [overCapCounts, setOverCapCounts] = useState<Record<string, number>>({});
  const [spendByTrip, setSpendByTrip] = useState<Record<string, any[]>>({});

  // Hooks
  const currencyContext = useCurrency();
  const { formatAmount, getCurrencySymbol, currency } = currencyContext || { 
    formatAmount: (amount: number) => `$${amount.toFixed(2)}`, 
    getCurrencySymbol: () => '$', 
    currency: 'USD' as any 
  };
  const { t, language } = useLocalization();
  
  // Debug logging
  console.log('SavedTripsScreen render - language:', language);
  console.log('SavedTripsScreen render - title translation:', t('trips.title'));
  const { isCompactMode } = useCompactMode();
  const { getButtonProps, getTextProps, getInputProps } = useAccessibility();
  const colors = useThemeColors();

  // Load trips on mount
  useEffect(() => {
    loadTrips();
  }, []);

  // Load spending data when trips change
  useEffect(() => {
    if (trips.length > 0) {
      loadSpendingData();
    }
  }, [trips]);

  // Utility: normalize date to start/end of day for reliable comparisons
  const startOfDay = (date: Date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  };
  const endOfDay = (date: Date) => {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
  };

  // Filter and sort trips
  useEffect(() => {
    let filtered = [...trips];

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(trip =>
        trip.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trip.groupType.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    const now = new Date();
    switch (filterBy) {
      case 'upcoming':
        filtered = filtered.filter(trip => startOfDay(new Date(trip.checkIn)) > endOfDay(now));
        break;
      case 'completed':
        filtered = filtered.filter(trip => endOfDay(new Date(trip.checkOut)) < startOfDay(now));
        break;
      case 'current':
        filtered = filtered.filter(trip => {
          const checkIn = startOfDay(new Date(trip.checkIn));
          const checkOut = endOfDay(new Date(trip.checkOut));
          return checkIn <= now && checkOut >= now;
        });
        break;
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'destination':
          return a.destination.localeCompare(b.destination);
        case 'budget':
          return b.budget - a.budget;
        case 'date':
        default:
          // Sort by earliest upcoming/current first, then past
          const aTime = new Date(a.checkIn).getTime();
          const bTime = new Date(b.checkIn).getTime();
          return aTime - bTime;
      }
    });

    setFilteredTrips(filtered);
  }, [trips, searchQuery, sortBy, filterBy]);

  // Animate content on load
  useEffect(() => {
    if (!loading && trips.length > 0) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [loading, trips.length]);

  const loadTrips = async () => {
    try {
      setLoading(true);
      const tripsData = await databaseService.getAllTrips();
      setTrips(tripsData);
      
      // Load activities for each trip
      const activitiesMap: Record<string, any[]> = {};
      for (const trip of tripsData) {
        try {
          const activities = await databaseService.getActivitiesForTrip(trip.id);
          activitiesMap[trip.id] = activities;
        } catch (error) {
          console.error(`Error loading activities for trip ${trip.id}:`, error);
          activitiesMap[trip.id] = [];
        }
      }
      setTripActivities(activitiesMap);
    } catch (error) {
      console.error('Error loading trips:', error);
      Alert.alert(t('common.error'), t('alert.loadTripsError'));
    } finally {
      setLoading(false);
    }
  };

  const loadSpendingData = async () => {
    try {
      const spendData: Record<string, any[]> = {};
      const totalSpend: Record<string, number> = {};
      const overCap: Record<string, number> = {};

      for (const trip of trips) {
        const dailySpend = await getSpendByDayForTrip(trip.id);
        spendData[trip.id] = dailySpend;
        
        const total = dailySpend.reduce((sum, day) => sum + day.total, 0);
        totalSpend[trip.id] = total;
        
        const overCapDays = dailySpend.filter(day => 
          trip.dailySpendCap && day.total > trip.dailySpendCap
        ).length;
        overCap[trip.id] = overCapDays;
      }

      setSpendByTrip(spendData);
      setTotalSpendByTrip(totalSpend);
      setOverCapCounts(overCap);
    } catch (error) {
      console.error('Error loading spending data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTrips();
    setRefreshing(false);
  };

  // Event handlers
  const handleTripCardPress = (trip: Trip) => {
    // Open Activities for this trip
    onOpenActivities?.(trip);
  };

  const handleAddActivity = (trip: Trip) => {
    setSelectedTripForActivity(trip);
    setEditingActivity(null);
    setIsActivityModalVisible(true);
  };

  const handleEditActivity = (trip: Trip, activity: any) => {
    setSelectedTripForActivity(trip);
    setEditingActivity(activity);
    setIsActivityModalVisible(true);
  };

  const handleDeleteActivity = async (tripId: string, activityId: string) => {
    Alert.alert(
      t('alert.deleteActivity'),
      t('alert.deleteActivityConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          onPress: async () => {
            try {
              await databaseService.deleteActivity(activityId);
              await loadTrips(); // Reload to update activities
              Alert.alert(t('common.success'), t('alert.activityDeleted'));
            } catch (error) {
              console.error('Error deleting activity:', error);
              Alert.alert(t('alert.error'), t('alert.activityDeleteError'));
            }
          }
        }
      ]
    );
  };

  const handleSaveActivity = async (activityData: any) => {
    if (!selectedTripForActivity) return;

    try {
      if (editingActivity) {
        // Update existing activity
        await databaseService.updateActivity(editingActivity.id, activityData);
        Alert.alert(t('common.success'), t('alert.activityUpdated'));
      } else {
        // Add new activity
        await databaseService.saveActivity({
          ...activityData,
          tripId: selectedTripForActivity.id,
          day: 1 // Default to day 1, can be enhanced later
        });
        Alert.alert(t('common.success'), t('alert.activityAdded'));
      }
      
      await loadTrips(); // Reload to update activities
      setIsActivityModalVisible(false);
      setSelectedTripForActivity(null);
      setEditingActivity(null);
    } catch (error) {
      console.error('Error saving activity:', error);
      Alert.alert(t('alert.error'), editingActivity ? t('alert.activityUpdateError') : t('alert.activityAddError'));
    }
  };

  const handleWeatherPress = (trip: Trip) => {
    setWeatherTrip(trip);
    setIsWeatherModalVisible(true);
  };

  const handleExpensePress = (trip: Trip) => {
    setExpenseTrip(trip);
    setIsExpenseModalVisible(true);
  };

  const handlePackingPress = (trip: Trip) => {
    setPackingTrip(trip);
    setIsPackingModalVisible(true);
  };

  const handleSocialPress = (trip: Trip) => {
    setSocialTrip(trip);
    setIsSocialModalVisible(true);
  };

  const handleEditTrip = (trip: Trip) => {
    setEditingTrip(trip);
    setIsEditScreenVisible(true);
  };

  const handleTripPress = (trip: Trip) => {
    // Navigate to itinerary screen when trip card is pressed
    onNavigateToItinerary?.();
  };

  const handleDeleteTrip = (tripId: string, destination: string) => {
    Alert.alert(
      t('alert.deleteTrip'),
      `${t('alert.deleteTripConfirm')} ${destination}?`,
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          onPress: async () => {
            try {
              await databaseService.deleteTrip(tripId);
              await loadTrips();
            } catch (error) {
              console.error('Error deleting trip:', error);
              Alert.alert(t('common.error'), t('alert.deleteTripError'));
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleAnalyticsPress = () => {
    setIsAnalyticsModalVisible(true);
  };

  const handleRecommendationsPress = () => {
    setIsRecommendationsModalVisible(true);
  };

  const handleTimelinePress = (trip: Trip) => {
    setSelectedTripForFeature(trip);
    setIsTimelineModalVisible(true);
  };

  const handlePhotosPress = (trip: Trip) => {
    setSelectedTripForFeature(trip);
    setIsPhotosModalVisible(true);
  };

  const handlePhotoAdd = (tripId: string | undefined, photo: Omit<PhotoItem, 'id'>) => {
    if (!tripId) return;
    setPhotosByTrip(prev => {
      const list = prev[tripId] ?? [];
      const newItem: PhotoItem = { id: String(Date.now()), ...photo };
      return { ...prev, [tripId]: [newItem, ...list] };
    });
  };

  const handlePhotoUpdate = (tripId: string | undefined, photoId: string, updates: Partial<PhotoItem>) => {
    if (!tripId) return;
    setPhotosByTrip(prev => {
      const list = prev[tripId] ?? [];
      return { ...prev, [tripId]: list.map(p => p.id === photoId ? { ...p, ...updates } : p) };
    });
  };

  const handlePhotoDelete = (tripId: string | undefined, photoId: string) => {
    if (!tripId) return;
    setPhotosByTrip(prev => {
      const list = prev[tripId] ?? [];
      return { ...prev, [tripId]: list.filter(p => p.id !== photoId) };
    });
  };

  const handleNotesPress = (trip: Trip) => {
    setSelectedTripForFeature(trip);
    setIsNotesModalVisible(true);
  };

  const handleChecklistPress = (trip: Trip) => {
    setSelectedTripForFeature(trip);
    setIsChecklistModalVisible(true);
  };

  const handleMapPress = (trip: Trip) => {
    setSelectedTripForFeature(trip);
    setIsMapModalVisible(true);
  };

  const handleEditScreenClose = () => {
    setIsEditScreenVisible(false);
    setEditingTrip(null);
  };

  const handleEditScreenSave = async (updatedTripData: Partial<Trip>) => {
    await loadTrips();
    setIsEditScreenVisible(false);
    setEditingTrip(null);
  };

  const handleCloseWeather = () => {
    setIsWeatherModalVisible(false);
    setWeatherTrip(null);
  };


  const styles = useMemo(() => createStyles(colors, isCompactMode), [colors, isCompactMode]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background.default }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.main} />
          <Text style={[styles.loadingText, { color: colors.text.primary }]}>
            Loading your trips...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.default }]}>
      {/* Modern Header with Gradient */}
      <LinearGradient
        colors={[colors.primary.main, colors.primary.dark]}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerTitle} {...getTextProps(t('trips.title'), 'header')}>
                {t('trips.title')}
              </Text>
              <Text style={styles.headerSubtitle} {...getTextProps(t('trips.tripCount'), 'text')}>
                {filteredTrips.length} {t('trips.of')} {trips.length} {t('trips.trips')}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => onNavigateToSetup?.()}
              {...getButtonProps(t('trips.addNewTrip'))}
            >
              <Ionicons name="add" size={24} color={colors.primary.contrastText} />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <Ionicons name="search" size={20} color={colors.text.tertiary} />
              <TextInput
                style={styles.searchInput}
                placeholder={t('trips.searchPlaceholder')}
                placeholderTextColor="#000000"
                value={searchQuery}
                onChangeText={setSearchQuery}
                {...getInputProps(t('trips.searchPlaceholder'), t('trips.searchDescription'))}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={20} color={colors.text.tertiary} />
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setShowFilters(!showFilters)}
              {...getButtonProps(t('trips.toggleFilters'))}
            >
              <Ionicons name="options" size={20} color={colors.primary.contrastText} />
            </TouchableOpacity>
          </View>

          {/* Filter Options */}
          {showFilters && (
            <Animated.View style={[styles.filtersContainer, { opacity: fadeAnim }]}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.filterChips}>
                  {[
                    { key: 'all', label: t('trips.filters.all') },
                    { key: 'upcoming', label: t('trips.filters.upcoming') },
                    { key: 'current', label: t('trips.filters.current') },
                    { key: 'completed', label: t('trips.filters.completed') },
                  ].map((filter) => (
                    <TouchableOpacity
                      key={filter.key}
                      style={[
                        styles.filterChip,
                        filterBy === filter.key && styles.activeFilterChip,
                      ]}
                      onPress={() => setFilterBy(filter.key as any)}
                      {...getButtonProps(`Filter by ${filter.label}`)}
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          filterBy === filter.key && styles.activeFilterChipText,
                        ]}
                        {...getTextProps(filter.label, 'button')}
                      >
                        {filter.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
              
              <View style={styles.sortContainer}>
                <Text style={styles.sortLabel} {...getTextProps(t('trips.sortBy'), 'text')}>{t('trips.sortBy')}:</Text>
                <View style={styles.sortOptions}>
                  {[
                    { key: 'date', label: t('trips.sortOptions.date'), icon: 'calendar' },
                    { key: 'destination', label: t('trips.sortOptions.destination'), icon: 'location' },
                    { key: 'budget', label: t('trips.sortOptions.budget'), icon: 'cash' },
                  ].map((sort) => (
                    <TouchableOpacity
                      key={sort.key}
                      style={[
                        styles.sortOption,
                        sortBy === sort.key && styles.activeSortOption,
                      ]}
                      onPress={() => setSortBy(sort.key as any)}
                      {...getButtonProps(`Sort by ${sort.label}`)}
                    >
                      <Ionicons
                        name={sort.icon as any}
                        size={16}
                        color={sortBy === sort.key ? colors.primary.contrastText : colors.text.secondary}
                      />
                      <Text
                        style={[
                          styles.sortOptionText,
                          sortBy === sort.key && styles.activeSortOptionText,
                        ]}
                        {...getTextProps(sort.label, 'button')}
                      >
                        {sort.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </Animated.View>
          )}
        </View>
      </LinearGradient>
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary.main}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {filteredTrips.length === 0 ? (
          <Animated.View 
            style={[
              styles.emptyState,
              { 
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <View style={styles.emptyIconContainer}>
              <Ionicons name="airplane-outline" size={80} color={colors.text.tertiary} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text.primary }]} {...getTextProps(t('trips.empty.title'), 'header')}>
              {searchQuery ? t('trips.noResults') : t('trips.empty.title')}
            </Text>
            <Text style={[styles.emptyDescription, { color: colors.text.secondary }]} {...getTextProps(t('trips.empty.description'), 'text')}>
              {searchQuery 
                ? t('trips.noResults.description')
                : t('trips.empty.description')
              }
            </Text>
            {!searchQuery && (
              <EnhancedButton
                title={t('trips.createFirstTrip')}
                onPress={() => { /* Navigate to SetupScreen */ }}
                variant="primary"
                size="large"
                icon="add"
                fullWidth
                style={styles.createTripButton}
              />
            )}
          </Animated.View>
        ) : (
          <Animated.View 
            style={[
              styles.tripsContainer,
              { 
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            {filteredTrips.map((trip, index) => (
              <Animated.View
                key={trip.id}
                style={{
                  opacity: fadeAnim,
                  transform: [{
                    translateY: slideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 20 * index],
                    })
                  }]
                }}
              >
                <TripCard
                  trip={trip}
                  isCompactMode={isCompactMode}
                  onPress={() => handleTripCardPress(trip)}
                  onWeatherPress={() => handleWeatherPress(trip)}
                  onExpensePress={() => handleExpensePress(trip)}
                  onPackingPress={() => handlePackingPress(trip)}
                  onSocialPress={() => handleSocialPress(trip)}
                  onEditPress={() => handleEditTrip(trip)}
                  onDeletePress={() => handleDeleteTrip(trip.id, trip.destination)}
                  onAddActivityPress={() => handleAddActivity(trip)}
                  onTimelinePress={() => handleTimelinePress(trip)}
                  onPhotosPress={() => handlePhotosPress(trip)}
                  onNotesPress={() => handleNotesPress(trip)}
                  onChecklistPress={() => handleChecklistPress(trip)}
                  onMapPress={() => handleMapPress(trip)}
                  onAnalyticsPress={() => handleAnalyticsPress()}
                  totalSpend={totalSpendByTrip[trip.id]}
                  overCapCount={overCapCounts[trip.id]}
                  formatAmount={formatAmount}
                />
              </Animated.View>
            ))}
          </Animated.View>
        )}
      </ScrollView>

      {/* Modals */}
      {weatherTrip && isWeatherModalVisible && (
        <Modal
          visible={isWeatherModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={handleCloseWeather}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <WeatherWidget 
                destination={weatherTrip?.destination || ''} 
              />
            </View>
          </View>
        </Modal>
      )}

      {expenseTrip && (
        <ExpenseTracker
          tripId={expenseTrip.id}
          visible={isExpenseModalVisible}
          onClose={() => {
            setIsExpenseModalVisible(false);
            setExpenseTrip(null);
          }}
        />
      )}

      {packingTrip && (
        <PackingAssistant
          tripId={packingTrip.id}
          destination={packingTrip.destination}
          visible={isPackingModalVisible}
          onClose={() => {
            setIsPackingModalVisible(false);
            setPackingTrip(null);
          }}
        />
      )}

      {socialTrip && (
        <SocialSharing
          trip={socialTrip}
          visible={isSocialModalVisible}
          onClose={() => {
            setIsSocialModalVisible(false);
            setSocialTrip(null);
          }}
        />
      )}

      <AnalyticsDashboard
        visible={isAnalyticsModalVisible}
        trips={trips}
        onClose={() => setIsAnalyticsModalVisible(false)}
      />

      <SmartRecommendations
        visible={isRecommendationsModalVisible}
        trips={trips}
        onClose={() => setIsRecommendationsModalVisible(false)}
      />

      {selectedTripForFeature && (
        <>
          <TripTimeline
            tripId={selectedTripForFeature.id}
            events={[]} // Mock data - in real app, this would come from state
            onEventUpdate={() => {}} // Mock handlers
            onEventAdd={() => {}}
            onEventDelete={() => {}}
            visible={isTimelineModalVisible}
            onClose={() => {
              setIsTimelineModalVisible(false);
              setSelectedTripForFeature(null);
            }}
          />

          <TripPhotos
            tripId={selectedTripForFeature?.id ?? ''}
            photos={selectedTripForFeature ? (photosByTrip[selectedTripForFeature.id] ?? []) : []}
            onPhotoAdd={(p) => handlePhotoAdd(selectedTripForFeature?.id, p)}
            onPhotoUpdate={(photoId, updates) => handlePhotoUpdate(selectedTripForFeature?.id, photoId, updates)}
            onPhotoDelete={(photoId) => handlePhotoDelete(selectedTripForFeature?.id, photoId)}
            visible={isPhotosModalVisible}
            onClose={() => {
              setIsPhotosModalVisible(false);
              setSelectedTripForFeature(null);
            }}
          />

          <TripNotes
            tripId={selectedTripForFeature.id}
            notes={[]} // Mock data - in real app, this would come from state
            onNoteAdd={() => {}} // Mock handlers
            onNoteUpdate={() => {}}
            onNoteDelete={() => {}}
            visible={isNotesModalVisible}
            onClose={() => {
              setIsNotesModalVisible(false);
              setSelectedTripForFeature(null);
            }}
          />

          <TripChecklist
            tripId={selectedTripForFeature.id}
            items={[]} // Mock data - in real app, this would come from state
            onItemAdd={() => {}} // Mock handlers
            onItemUpdate={() => {}}
            onItemDelete={() => {}}
            visible={isChecklistModalVisible}
            onClose={() => {
              setIsChecklistModalVisible(false);
              setSelectedTripForFeature(null);
            }}
          />

          <TripMap
            tripId={selectedTripForFeature.id}
            locations={[]} // Mock data - in real app, this would come from state
            onLocationAdd={() => {}} // Mock handlers
            onLocationUpdate={() => {}}
            onLocationDelete={() => {}}
            visible={isMapModalVisible}
            onClose={() => {
              setIsMapModalVisible(false);
              setSelectedTripForFeature(null);
            }}
          />
        </>
      )}

      {/* Edit Trip Screen */}
      {isEditScreenVisible && editingTrip && (
        <EditTripScreen
          trip={editingTrip}
          onClose={handleEditScreenClose}
          onSave={handleEditScreenSave}
        />
      )}

      <ActivityModal
        visible={isActivityModalVisible}
        onClose={() => {
          setIsActivityModalVisible(false);
          setSelectedTripForActivity(null);
          setEditingActivity(null);
        }}
        onSave={handleSaveActivity}
        trip={selectedTripForActivity}
        editingActivity={editingActivity}
      />
    </SafeAreaView>
  );
};

const createStyles = (colors: any, isCompactMode: boolean) => StyleSheet.create({
  container: {
    flex: 1,
  },
  headerGradient: {
    paddingTop: professionalSpacing[2],
    paddingBottom: professionalSpacing[6],
  },
  header: {
    paddingHorizontal: professionalSpacing[6],
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: professionalSpacing[6],
  },
  headerTitle: {
    ...designSystem.textStyles.h1,
    color: colors.primary.contrastText,
    marginBottom: professionalSpacing[1],
  },
  headerSubtitle: {
    ...designSystem.textStyles.bodyLarge,
    color: colors.primary.contrastText,
    opacity: 0.8,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    ...professionalShadows.sm,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: professionalSpacing[3],
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: professionalBorderRadius.lg,
    paddingHorizontal: professionalSpacing[4],
    paddingVertical: professionalSpacing[3],
    gap: professionalSpacing[3],
  },
  searchInput: {
    flex: 1,
    ...designSystem.textStyles.body,
    color: colors.primary.contrastText,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filtersContainer: {
    marginTop: professionalSpacing[4],
    paddingTop: professionalSpacing[4],
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  filterChips: {
    flexDirection: 'row',
    gap: professionalSpacing[3],
    paddingRight: professionalSpacing[6],
  },
  filterChip: {
    paddingHorizontal: professionalSpacing[4],
    paddingVertical: professionalSpacing[2],
    borderRadius: professionalBorderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  activeFilterChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  filterChipText: {
    ...designSystem.textStyles.buttonSmall,
    color: colors.primary.contrastText,
  },
  activeFilterChipText: {
    fontWeight: '600',
  },
  sortContainer: {
    marginTop: professionalSpacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    gap: professionalSpacing[4],
  },
  sortLabel: {
    ...designSystem.textStyles.body,
    color: colors.primary.contrastText,
    opacity: 0.8,
  },
  sortOptions: {
    flexDirection: 'row',
    gap: professionalSpacing[2],
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: professionalSpacing[3],
    paddingVertical: professionalSpacing[2],
    borderRadius: professionalBorderRadius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    gap: professionalSpacing[2],
  },
  activeSortOption: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  sortOptionText: {
    ...designSystem.textStyles.caption,
    color: colors.primary.contrastText,
  },
  activeSortOptionText: {
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: professionalSpacing[6],
    flexGrow: 1,
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: designSystem.layout.containerPadding,
  },
  loadingText: {
    ...designSystem.textStyles.bodyLarge,
    marginTop: professionalSpacing[4],
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: designSystem.layout.containerPadding,
    minHeight: 400,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.surface.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: professionalSpacing[6],
  },
  emptyTitle: {
    ...designSystem.textStyles.h2,
    marginBottom: professionalSpacing[3],
    textAlign: 'center',
  },
  emptyDescription: {
    ...designSystem.textStyles.body,
    textAlign: 'center',
    marginBottom: professionalSpacing[8],
    lineHeight: designSystem.textStyles.body.lineHeight,
    paddingHorizontal: professionalSpacing[4],
  },
  createTripButton: {
    marginTop: professionalSpacing[4],
  },
  tripsContainer: {
    padding: professionalSpacing[6],
    gap: professionalSpacing[4],
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.surface.primary,
    borderRadius: professionalBorderRadius.lg,
    margin: professionalSpacing[4],
    maxHeight: '90%',
    width: '95%',
  },
});