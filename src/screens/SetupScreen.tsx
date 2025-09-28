import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { databaseService } from '../services/database';
import { Section } from '../components/Section';
import { FormInput } from '../components/FormInput';
import { LocationSearchInput } from '../components/LocationSearchInput';
import { DatePicker } from '../components/DatePicker';
import { GroupTypeSelector } from '../components/GroupTypeSelector';
import { PreferenceSlider } from '../components/PreferenceSlider';
import { Chip } from '../components/Chip';
import { WeatherWidget } from '../components/WeatherWidget';
import { CurrencyConverter } from '../components/CurrencyConverter';
import { useCurrency } from '../contexts/CurrencyContext';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import { Location } from '../data/locations';

interface FormErrors {
  [key: string]: string;
}

export const SetupScreen = () => {
  const { formatAmount, getCurrencySymbol, currency } = useCurrency();
  const [destination, setDestination] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [budget, setBudget] = useState(50);
  const [activityLevel, setActivityLevel] = useState(50);
  const [dailySpendCap, setDailySpendCap] = useState<number | undefined>(undefined);
  const [selectedGroupType, setSelectedGroupType] = useState('couple');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showWeatherWidget, setShowWeatherWidget] = useState(true);

  useEffect(() => { (async () => { try { await databaseService.init(); } catch {} })(); }, []);

  const interests = [
    'Adventure', 'Culture', 'Food', 'Nature', 'Nightlife', 'Relaxation',
    'Shopping', 'Sports', 'History', 'Art', 'Music', 'Photography'
  ];

  const validateField = (field: string, value: any): string | undefined => {
    switch (field) {
      case 'destination':
        if (!value || value.trim().length === 0) {
          return 'Destination is required';
        }
        break;
      case 'checkIn':
        if (!value || value.trim().length === 0) {
          return 'Check-in date is required';
        }
        const checkInDate = new Date(value);
        if (isNaN(checkInDate.getTime())) {
          return 'Invalid check-in date format';
        }
        break;
      case 'checkOut':
        if (!value || value.trim().length === 0) {
          return 'Check-out date is required';
        }
        const checkOutDate = new Date(value);
        if (isNaN(checkOutDate.getTime())) {
          return 'Invalid check-out date format';
        }
        if (value && checkIn && checkOutDate <= new Date(checkIn)) {
          return 'Check-out must be after check-in';
        }
        break;
      case 'selectedInterests':
        if (!value || value.length === 0) {
          return 'Please select at least one interest';
        }
        break;
      case 'dailySpendCap':
        if (value != null && value !== '' && (isNaN(value) || Number(value) < 0)) {
          return 'Daily cap must be a positive number';
        }
        break;
      default:
        break;
    }
    return undefined;
  };

  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location);
    // The LocationSearchInput will handle setting the display text
    // We just need to clear any existing destination error
    if (errors.destination) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.destination;
        return newErrors;
      });
    }
  };

  const handleFieldBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    let value;
    switch (field) {
      case 'destination':
        value = destination;
        break;
      case 'checkIn':
        value = checkIn;
        break;
      case 'checkOut':
        value = checkOut;
        break;
      case 'selectedInterests':
        value = selectedInterests;
        break;
      default:
        return;
    }

    const error = validateField(field, value);
    setErrors(prev => ({ ...prev, [field]: error || '' }));
  };

  const validateAllFields = () => {
    const allFields = ['destination', 'checkIn', 'checkOut', 'budget', 'activityLevel', 'selectedInterests', 'dailySpendCap'];
    const newErrors: FormErrors = {};

    allFields.forEach(field => {
      let value;
      switch (field) {
        case 'destination':
          value = destination;
          break;
        case 'checkIn':
          value = checkIn;
          break;
        case 'checkOut':
          value = checkOut;
          break;
        case 'budget':
          value = budget;
          break;
        case 'activityLevel':
          value = activityLevel;
          break;
        case 'selectedInterests':
          value = selectedInterests;
          break;
        case 'dailySpendCap':
          value = dailySpendCap;
          break;
        default:
          return;
      }

      const error = validateField(field, value);
      if (error) {
        newErrors[field] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateAllFields()) {
      Alert.alert('Validation Error', 'Please fix all errors before saving.');
      return;
    }

    setIsLoading(true);
    try {
      // Ensure dates are properly formatted
      const formatDateForStorage = (dateString: string): string => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? '' : date.toISOString();
      };

      const tripData = {
        destination: destination.trim(),
        checkIn: formatDateForStorage(checkIn),
        checkOut: formatDateForStorage(checkOut),
        budget,
        activityLevel,
        groupType: selectedGroupType,
        interests: JSON.stringify(selectedInterests),
        dailySpendCap: (dailySpendCap != null && !isNaN(dailySpendCap)) ? Math.round(Number(dailySpendCap)) : null,
      };

      await databaseService.saveTrip(tripData);
      
      Alert.alert('Success', 'Trip saved successfully!', [
        {
          text: 'OK',
          onPress: () => {
            // Reset form
            setDestination('');
            setCheckIn('');
            setCheckOut('');
            setBudget(50);
            setActivityLevel(50);
            setSelectedGroupType('couple');
            setSelectedInterests([]);
            setDailySpendCap(undefined);
            setErrors({});
            setTouched({});
          }
        }
      ]);
    } catch (error) {
      console.error('Error saving trip:', error);
      Alert.alert('Error', 'Failed to save trip. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInterestToggle = (interest: string) => {
    const newInterests = selectedInterests.includes(interest)
      ? selectedInterests.filter(i => i !== interest)
      : [...selectedInterests, interest];
    
    setSelectedInterests(newInterests);
    
    // Validate interests when changed
    if (touched.selectedInterests) {
      const error = validateField('selectedInterests', newInterests);
      setErrors(prev => ({ ...prev, selectedInterests: error || '' }));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Plan Your Perfect Trip</Text>
          <Text style={styles.subtitle}>Create a personalized itinerary in just a few steps</Text>
        </View>

        <Section
          title="Destination"
          subtitle="Where would you like to go?"
        >
          <LocationSearchInput
            placeholder="Search for a city or country"
            value={destination}
            onChangeText={(text) => {
              setDestination(text);
              setSelectedLocation(null); // Clear selected location when typing
              if (touched.destination) handleFieldBlur('destination');
            }}
            onBlur={() => handleFieldBlur('destination')}
            onLocationSelect={handleLocationSelect}
            error={touched.destination ? errors.destination : undefined}
          />
          {selectedLocation && (
            <View style={styles.selectedLocationContainer}>
              <View style={styles.selectedLocationBadge}>
                <Ionicons 
                  name={selectedLocation.type === 'city' ? 'location' : 'globe'} 
                  size={16} 
                  color={colors.primary.main} 
                />
                <Text style={styles.selectedLocationText}>
                  {selectedLocation.type === 'city' ? 'City' : 'Country'} selected
                </Text>
              </View>
            </View>
          )}
        </Section>

        {/* Weather Widget */}
        {showWeatherWidget && (
          <WeatherWidget 
            destination={destination} 
            onDismiss={() => setShowWeatherWidget(false)}
          />
        )}

        {/* Currency Converter */}
        <CurrencyConverter destination={destination} />

        <Section 
          title="Travel Dates" 
          subtitle="When are you planning to travel?"
        >
          <View style={styles.dateRow}>
            <View style={styles.dateColumn}>
              <DatePicker
                value={checkIn}
                onChange={(date) => {
                  setCheckIn(date);
                  if (touched.checkIn) handleFieldBlur('checkIn');
                }}
                placeholder="Check-in date"
                error={touched.checkIn ? errors.checkIn : undefined}
                mode="date"
              />
            </View>
            <View style={styles.dateColumn}>
              <DatePicker
                value={checkOut}
                onChange={(date) => {
                  setCheckOut(date);
                  if (touched.checkOut) handleFieldBlur('checkOut');
                }}
                placeholder="Check-out date"
                error={touched.checkOut ? errors.checkOut : undefined}
                minimumDate={checkIn ? new Date(checkIn) : undefined}
                mode="date"
              />
            </View>
          </View>
        </Section>

        <Section 
          title="Budget Planning" 
          subtitle="Set your spending expectations"
        >
          <PreferenceSlider
            value={budget}
            onValueChange={setBudget}
            min={0}
            max={1000}
            step={10}
            label="Total Budget"
            unit={getCurrencySymbol(currency)}
            description="Your overall trip budget"
            onBlur={() => handleFieldBlur('budget')}
            error={touched.budget ? errors.budget : undefined}
          />
          
          <FormInput
            placeholder={`Daily limit (e.g. 150 ${getCurrencySymbol(currency)})`}
            keyboardType="numeric"
            value={dailySpendCap == null ? '' : String(dailySpendCap)}
            onChangeText={(text) => {
              const n = parseFloat(text);
              setDailySpendCap(isNaN(n) ? undefined : n);
              if (touched.dailySpendCap) handleFieldBlur('dailySpendCap');
            }}
            onBlur={() => handleFieldBlur('dailySpendCap')}
            error={touched.dailySpendCap ? errors.dailySpendCap : undefined}
          />
        </Section>

        <Section 
          title="Activity Level" 
          subtitle="How active do you want to be?"
        >
          <PreferenceSlider
            value={activityLevel}
            onValueChange={setActivityLevel}
            min={0}
            max={100}
            step={5}
            label="Activity Level"
            unit="%"
            description="From relaxed to adventure-packed"
            onBlur={() => handleFieldBlur('activityLevel')}
            error={touched.activityLevel ? errors.activityLevel : undefined}
          />
        </Section>

        <Section 
          title="Travel Group" 
          subtitle="Who's coming along?"
        >
          <GroupTypeSelector
            selectedGroupType={selectedGroupType}
            onGroupTypeChange={setSelectedGroupType}
          />
        </Section>

        <Section 
          title="Interests" 
          subtitle="What activities interest you most?"
        >
          <View style={styles.interestsContainer}>
            {interests.map((interest) => (
              <Chip
                key={interest}
                label={interest}
                selected={selectedInterests.includes(interest)}
                onPress={() => handleInterestToggle(interest)}
                variant="outline"
              />
            ))}
          </View>
          {touched.selectedInterests && errors.selectedInterests && (
            <Text style={styles.errorText}>{errors.selectedInterests}</Text>
          )}
        </Section>

        <TouchableOpacity
          style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.primary.contrastText} />
          ) : (
            <Text style={styles.saveButtonText}>Create My Trip</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.paper,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing['3xl'],
    paddingBottom: spacing['6xl'],
  },
  header: {
    marginBottom: spacing['5xl'],
    alignItems: 'center',
  },
  title: {
    fontSize: typography?.fontSize?.['4xl'] || 32,
      fontFamily: typography?.fontFamily?.bold || 'System',
    color: colors.text.primary,
    marginBottom: spacing.sm,
    textAlign: 'center',
    lineHeight: typography?.lineHeight?.['4xl'] || 40,
    letterSpacing: typography?.letterSpacing?.tight || -0.5,
  },
  subtitle: {
    fontSize: typography?.fontSize?.lg || 18,
      fontFamily: typography?.fontFamily?.regular || 'System',
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: typography?.lineHeight?.lg || 28,
    maxWidth: 280,
  },
  dateRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  dateColumn: {
    flex: 1,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  errorText: {
    color: colors.status.error,
    fontSize: typography?.fontSize?.xs || 12,
      fontFamily: typography?.fontFamily?.medium || 'System',
    marginTop: spacing.xs,
    lineHeight: typography?.lineHeight?.xs || 16,
  },
  saveButton: {
    backgroundColor: colors.primary.main,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing['3xl'],
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    marginTop: spacing['4xl'],
    ...shadows.md,
  },
  saveButtonDisabled: {
    backgroundColor: colors.text.disabled,
    ...shadows.sm,
  },
  saveButtonText: {
    color: colors.primary.contrastText,
    fontSize: typography?.fontSize?.lg || 18,
      fontFamily: typography?.fontFamily?.semibold || 'System',
    lineHeight: typography?.lineHeight?.lg || 28,
  },
  selectedLocationContainer: {
    marginTop: spacing.md,
  },
  selectedLocationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary.main + '20',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    alignSelf: 'flex-start',
  },
  selectedLocationText: {
    fontSize: typography?.fontSize?.sm || 14,
      fontFamily: typography?.fontFamily?.medium || 'System',
    color: colors.primary.main,
    marginLeft: spacing.sm,
    lineHeight: typography?.lineHeight?.sm || 20,
  },
});