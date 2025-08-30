import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Slider } from '../components/Slider';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ... (keep existing constants)

interface FormErrors {
  destination?: string;
  checkIn?: string;
  checkOut?: string;
  interests?: string;
}

export const SetupScreen = () => {
  const [destination, setDestination] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [budget, setBudget] = useState(50);
  const [activityLevel, setActivityLevel] = useState(50);
  const [selectedGroupType, setSelectedGroupType] = useState('couple');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = (field: string, value: any): string | undefined => {
    switch (field) {
      case 'destination':
        if (!value.trim()) {
          return 'Destination is required';
        }
        if (value.trim().length < 2) {
          return 'Destination must be at least 2 characters';
        }
        break;

      case 'checkIn':
        if (!value) {
          return 'Check-in date is required';
        }
        const checkInRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[012])\/(20)\d\d$/;
        if (!checkInRegex.test(value)) {
          return 'Invalid date format (dd/mm/yyyy)';
        }
        const checkInDate = new Date(value.split('/').reverse().join('-'));
        if (checkInDate < new Date()) {
          return 'Check-in date cannot be in the past';
        }
        break;

      case 'checkOut':
        if (!value) {
          return 'Check-out date is required';
        }
        const checkOutRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[012])\/(20)\d\d$/;
        if (!checkOutRegex.test(value)) {
          return 'Invalid date format (dd/mm/yyyy)';
        }
        if (checkIn) {
          const startDate = new Date(checkIn.split('/').reverse().join('-'));
          const endDate = new Date(value.split('/').reverse().join('-'));
          if (endDate <= startDate) {
            return 'Check-out date must be after check-in date';
          }
        }
        break;

      case 'interests':
        if (!value || value.length === 0) {
          return 'Please select at least one interest';
        }
        break;
    }
  };

  const handleFieldBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const error = validateField(field, 
      field === 'interests' ? selectedInterests : 
      field === 'destination' ? destination :
      field === 'checkIn' ? checkIn : checkOut
    );
    setErrors(prev => ({
      ...prev,
      [field]: error,
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    // Validate all fields
    const destinationError = validateField('destination', destination);
    const checkInError = validateField('checkIn', checkIn);
    const checkOutError = validateField('checkOut', checkOut);
    const interestsError = validateField('interests', selectedInterests);

    if (destinationError) newErrors.destination = destinationError;
    if (checkInError) newErrors.checkIn = checkInError;
    if (checkOutError) newErrors.checkOut = checkOutError;
    if (interestsError) newErrors.interests = interestsError;

    setErrors(newErrors);
    setTouched({
      destination: true,
      checkIn: true,
      checkOut: true,
      interests: true,
    });

    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      Alert.alert('Error', 'Please fix the errors before saving.');
      return;
    }

    setIsLoading(true);
    try {
      const tripData = {
        destination,
        checkIn,
        checkOut,
        budget,
        activityLevel,
        groupType: selectedGroupType,
        interests: selectedInterests,
        createdAt: new Date().toISOString(),
      };

      await AsyncStorage.setItem('tripData', JSON.stringify(tripData));
      Alert.alert('Success', 'Your trip preferences have been saved!');
    } catch (error) {
      Alert.alert('Error', 'Failed to save trip preferences');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>✈️ Triply Itinerary Helper</Text>
          <Text style={styles.subtitle}>Plan your perfect trip in minutes</Text>
        </View>

        <View style={styles.content}>
          {/* Destination Input */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Where are you going?</Text>
            <View>
              <View style={[
                styles.inputContainer,
                touched.destination && errors.destination && styles.inputError
              ]}>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Budapest, Prague, Barcelona..."
                  value={destination}
                  onChangeText={(text) => {
                    setDestination(text);
                    if (touched.destination) {
                      handleFieldBlur('destination');
                    }
                  }}
                  onBlur={() => handleFieldBlur('destination')}
                  placeholderTextColor="#999"
                />
              </View>
              {touched.destination && errors.destination && (
                <Text style={styles.errorText}>{errors.destination}</Text>
              )}
            </View>
          </View>

          {/* Date Inputs */}
          <View style={styles.section}>
            <View style={styles.dateContainer}>
              <View style={styles.dateInput}>
                <Text style={styles.label}>Check-in</Text>
                <View>
                  <View style={[
                    styles.inputContainer,
                    touched.checkIn && errors.checkIn && styles.inputError
                  ]}>
                    <TextInput
                      style={styles.input}
                      placeholder="dd/mm/yyyy"
                      value={checkIn}
                      onChangeText={(text) => {
                        setCheckIn(text);
                        if (touched.checkIn) {
                          handleFieldBlur('checkIn');
                        }
                      }}
                      onBlur={() => handleFieldBlur('checkIn')}
                      placeholderTextColor="#999"
                    />
                    <Text style={styles.calendarIcon}>📅</Text>
                  </View>
                  {touched.checkIn && errors.checkIn && (
                    <Text style={styles.errorText}>{errors.checkIn}</Text>
                  )}
                </View>
              </View>
              <View style={styles.dateInput}>
                <Text style={styles.label}>Check-out</Text>
                <View>
                  <View style={[
                    styles.inputContainer,
                    touched.checkOut && errors.checkOut && styles.inputError
                  ]}>
                    <TextInput
                      style={styles.input}
                      placeholder="dd/mm/yyyy"
                      value={checkOut}
                      onChangeText={(text) => {
                        setCheckOut(text);
                        if (touched.checkOut) {
                          handleFieldBlur('checkOut');
                        }
                      }}
                      onBlur={() => handleFieldBlur('checkOut')}
                      placeholderTextColor="#999"
                    />
                    <Text style={styles.calendarIcon}>📅</Text>
                  </View>
                  {touched.checkOut && errors.checkOut && (
                    <Text style={styles.errorText}>{errors.checkOut}</Text>
                  )}
                </View>
              </View>
            </View>
          </View>

          {/* Keep existing preferences section */}

          {/* Interests Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What interests you?</Text>
            <View style={styles.interestsContainer}>
              {interests.map((interest) => (
                <TouchableOpacity
                  key={interest.id}
                  style={[
                    styles.interestChip,
                    selectedInterests.includes(interest.id) && styles.interestChipSelected,
                    touched.interests && errors.interests && styles.interestError
                  ]}
                  onPress={() => {
                    const newInterests = selectedInterests.includes(interest.id)
                      ? selectedInterests.filter(id => id !== interest.id)
                      : [...selectedInterests, interest.id];
                    setSelectedInterests(newInterests);
                    if (touched.interests) {
                      handleFieldBlur('interests');
                    }
                  }}
                >
                  <Text style={[
                    styles.interestText,
                    selectedInterests.includes(interest.id) && styles.interestTextSelected
                  ]}>
                    {interest.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {touched.interests && errors.interests && (
              <Text style={styles.errorText}>{errors.interests}</Text>
            )}
          </View>

          {/* Save Button */}
          <View style={styles.saveButtonContainer}>
            <TouchableOpacity
              style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
              onPress={handleSave}
              activeOpacity={0.8}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.saveButtonText}>Create Itinerary</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // ... (keep existing styles)

  inputError: {
    borderColor: '#DC2626',
  },
  interestError: {
    borderColor: '#DC2626',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
});