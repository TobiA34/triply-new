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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { databaseService, Trip } from '../services/database';
import { getSpendByDayForTrip } from '../services/database';
import { TripCard } from '../components/TripCard';
import { EnhancedHeader } from '../components/EnhancedHeader';
import { EnhancedButton } from '../components/EnhancedButton';
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
import { designSystem } from '../theme/designSystem';

interface FormErrors {
  [key: string]: string;
}

export const EnhancedSavedTripsScreen = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [editForm, setEditForm] = useState({
    destination: '',
    checkIn: '',
    checkOut: '',
    groupType: 'solo',
    budget: '',
    activityLevel: 50,
    interests: [] as string[],
    dailySpendCap: '',
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  
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
  const { formatAmount } = useCurrency();
  const { isDark } = useTheme();
  const { t } = useLocalization();
  const { isCompactMode } = useCompactMode();
  const { getButtonProps, getTextProps } = useAccessibility();
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

  const loadTrips = async () => {
    try {
      setLoading(true);
      const tripsData = await databaseService.getAllTrips();
      setTrips(tripsData);
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
    // Navigate to trip details or open trip management
    console.log('Trip card pressed:', trip.destination);
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
    setEditForm({
      destination: trip.destination,
      checkIn: trip.checkIn,
      checkOut: trip.checkOut,
      groupType: trip.groupType,
      budget: trip.budget.toString(),
      activityLevel: trip.activityLevel,
      interests: trip.interests ? JSON.parse(trip.interests) : [],
      dailySpendCap: trip.dailySpendCap ? trip.dailySpendCap.toString() : '',
    });
    setIsEditModalVisible(true);
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
              Alert.alert('Error', 'Failed to delete trip. Please try again.');
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

  const handleAddActivity = (trip: Trip) => {
    // Navigate to add activity screen or show activity modal
    console.log('Add activity for trip:', trip.destination);
  };

  // Form validation
  const validateEditField = (field: string, value: any): string | undefined => {
    switch (field) {
      case 'destination':
        if (!value || value.trim().length === 0) {
          return 'Destination is required';
        }
        if (value.trim().length < 2) {
          return 'Destination must be at least 2 characters';
        }
        break;
      case 'checkIn':
        if (!value || value.trim().length === 0) {
          return 'Check-in date is required';
        }
        break;
      case 'checkOut':
        if (!value || value.trim().length === 0) {
          return 'Check-out date is required';
        }
        break;
      case 'budget':
        if (!value || value.trim().length === 0) {
          return 'Budget is required';
        }
        const budgetNum = parseFloat(value);
        if (isNaN(budgetNum) || budgetNum <= 0) {
          return 'Budget must be a positive number';
        }
        break;
      case 'dailySpendCap':
        if (value && value.trim().length > 0) {
          const capNum = parseFloat(value);
          if (isNaN(capNum) || capNum <= 0) {
            return 'Daily spending cap must be a positive number';
          }
        }
        break;
    }
    return undefined;
  };

  const handleEditFieldChange = (field: string, value: any) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSaveEdit = async () => {
    // Validate all fields
    const errors: FormErrors = {};
    const fieldsToValidate = ['destination', 'checkIn', 'checkOut', 'budget', 'dailySpendCap'];
    
    fieldsToValidate.forEach(field => {
      const error = validateEditField(field, editForm[field as keyof typeof editForm]);
      if (error) {
        errors[field] = error;
      }
    });

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (!editingTrip) return;

    try {
      const updatedTrip: Trip = {
        ...editingTrip,
        destination: editForm.destination.trim(),
        checkIn: editForm.checkIn,
        checkOut: editForm.checkOut,
        groupType: editForm.groupType,
        budget: parseFloat(editForm.budget),
        activityLevel: editForm.activityLevel,
        interests: JSON.stringify(editForm.interests),
        dailySpendCap: editForm.dailySpendCap ? parseFloat(editForm.dailySpendCap) : null,
      };

      await databaseService.updateTrip(editingTrip.id, updatedTrip);
      await loadTrips();
      setIsEditModalVisible(false);
      setEditingTrip(null);
      setFormErrors({});
    } catch (error) {
      console.error('Error updating trip:', error);
      Alert.alert('Error', 'Failed to update trip. Please try again.');
    }
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
      <EnhancedHeader
        title={t('trips.title')}
        subtitle={`${trips.length} ${t('trips.subtitle')}`}
        rightAction={{
          icon: 'add',
          onPress: () => { /* Navigate to SetupScreen */ },
          label: 'Add Trip',
        }}
        gradient={true}
      />
      
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
        {trips.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="airplane-outline" size={64} color={colors.text.tertiary} />
            <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>
              {t('trips.empty.title')}
            </Text>
            <Text style={[styles.emptyDescription, { color: colors.text.secondary }]}>
              {t('trips.empty.description')}
            </Text>
            <EnhancedButton
              title={t('trips.createFirstTrip')}
              onPress={() => { /* Navigate to SetupScreen */ }}
              variant="primary"
              size="large"
              icon="add"
              fullWidth
              style={styles.createTripButton}
            />
          </View>
        ) : (
          <View style={styles.tripsContainer}>
            {trips.map((trip) => (
              <TripCard
                key={trip.id}
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
            ))}
          </View>
        )}
      </ScrollView>

      {/* Modals */}
      {weatherTrip && (
        <Modal
          visible={isWeatherModalVisible}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => {
            setIsWeatherModalVisible(false);
            setWeatherTrip(null);
          }}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Weather for {weatherTrip.destination}</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => {
                  setIsWeatherModalVisible(false);
                  setWeatherTrip(null);
                }}
              >
                <Ionicons name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>
            <WeatherWidget 
              destination={weatherTrip.destination} 
              onDismiss={() => setWeatherTrip(null)}
            />
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
            tripId={selectedTripForFeature.id}
            photos={[]} // Mock data - in real app, this would come from state
            onPhotoAdd={() => {}} // Mock handlers
            onPhotoUpdate={() => {}}
            onPhotoDelete={() => {}}
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
    </SafeAreaView>
  );
};

const createStyles = (colors: any, isCompactMode: boolean) => StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: designSystem.layout.sectionSpacing,
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
    marginTop: designSystem.layout.itemSpacing,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: designSystem.layout.containerPadding,
    minHeight: 400,
  },
  emptyTitle: {
    ...designSystem.textStyles.h2,
    marginTop: designSystem.layout.itemSpacing,
    marginBottom: designSystem.layout.itemSpacing,
    textAlign: 'center',
  },
  emptyDescription: {
    ...designSystem.textStyles.body,
    textAlign: 'center',
    marginBottom: designSystem.layout.sectionSpacing,
    lineHeight: designSystem.textStyles.body.lineHeight,
  },
  createTripButton: {
    marginTop: designSystem.layout.itemSpacing,
  },
  tripsContainer: {
    padding: designSystem.layout.containerPadding,
    gap: designSystem.layout.itemSpacing,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: designSystem.layout.containerPadding,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  modalTitle: {
    ...designSystem.textStyles.h2,
    color: colors.text.primary,
  },
  closeButton: {
    padding: 8,
  },
});
