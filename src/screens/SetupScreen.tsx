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
import { SafeAreaView } from 'react-native-safe-area-context';
import { databaseService } from '../services/database';
import { Section } from '../components/Section';
import { FormInput } from '../components/FormInput';
import { DatePicker } from '../components/DatePicker';
import { GroupTypeSelector } from '../components/GroupTypeSelector';
import { PreferenceSlider } from '../components/PreferenceSlider';
import { Chip } from '../components/Chip';
import { useCurrency } from '../contexts/CurrencyContext';

interface FormErrors {
  [key: string]: string;
}

export const SetupScreen = () => {
  const { formatAmount, getCurrencySymbol } = useCurrency();
  const [destination, setDestination] = useState('');
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
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Triply Itinerary Helper</Text>
          <Text style={styles.subtitle}>Plan your perfect trip in minutes</Text>
        </View>

        <Section title="Where are you going?">
          <FormInput
            placeholder="Enter destination"
            value={destination}
            onChangeText={(text) => {
              setDestination(text);
              if (touched.destination) handleFieldBlur('destination');
            }}
            onBlur={() => handleFieldBlur('destination')}
            error={touched.destination ? errors.destination : undefined}
          />
        </Section>

        <Section title="When are you traveling?">
          <View style={styles.row}>
            <View style={styles.col}>
              <DatePicker
                value={checkIn}
                onChange={(date) => {
                  setCheckIn(date);
                  if (touched.checkIn) handleFieldBlur('checkIn');
                }}
                placeholder="Select check-in date"
                error={touched.checkIn ? errors.checkIn : undefined}
                mode="date"
              />
            </View>
            <View style={styles.col}>
              <DatePicker
                value={checkOut}
                onChange={(date) => {
                  setCheckOut(date);
                  if (touched.checkOut) handleFieldBlur('checkOut');
                }}
                placeholder="Select check-out date"
                error={touched.checkOut ? errors.checkOut : undefined}
                minimumDate={checkIn ? new Date(checkIn) : undefined}
                mode="date"
              />
            </View>
          </View>
        </Section>

        <Section title="What's your budget?">
          <PreferenceSlider
            value={budget}
            onValueChange={setBudget}
            min={0}
            max={1000}
            step={10}
            label="Budget"
            unit={getCurrencySymbol()}
            onBlur={() => handleFieldBlur('budget')}
            error={touched.budget ? errors.budget : undefined}
          />
        </Section>

        <Section title="Daily spend cap (optional)">
          <FormInput
            placeholder={`e.g. 150 (${getCurrencySymbol()})`}
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

        <Section title="How active do you want to be?">
          <PreferenceSlider
            value={activityLevel}
            onValueChange={setActivityLevel}
            min={0}
            max={100}
            step={5}
            label="Activity Level"
            unit="%"
            onBlur={() => handleFieldBlur('activityLevel')}
            error={touched.activityLevel ? errors.activityLevel : undefined}
          />
        </Section>

        <Section title="Who's traveling?">
          <GroupTypeSelector
            selectedGroupType={selectedGroupType}
            onGroupTypeChange={setSelectedGroupType}
          />
        </Section>

        <Section title="What interests you?">
          <View style={styles.interestsContainer}>
            {interests.map((interest) => (
              <Chip
                key={interest}
                label={interest}
                selected={selectedInterests.includes(interest)}
                onPress={() => handleInterestToggle(interest)}
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
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>Save Trip</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  content: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  col: {
    flex: 1,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
  },
  saveButton: {
    backgroundColor: '#4285F4',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  saveButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  dateInputContainer: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
});