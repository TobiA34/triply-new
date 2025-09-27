import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { FormInput } from '../components/FormInput';
import { DatePicker } from '../components/DatePicker';
import { GroupTypeSelector } from '../components/GroupTypeSelector';
import { PreferenceSlider } from '../components/PreferenceSlider';
import { databaseService, Trip } from '../services/database';
import { useCurrency } from '../contexts/CurrencyContext';
import { useThemeColors } from '../hooks/useThemeColors';
import { useLocalization } from '../contexts/LocalizationContext';
import { designSystem, professionalSpacing, professionalShadows, professionalBorderRadius } from '../theme/designSystem';

interface FormErrors {
  [key: string]: string;
}

interface EditTripScreenProps {
  trip: Trip;
  onClose: () => void;
  onSave: (updatedTrip: Partial<Trip>) => void;
}

export const EditTripScreen: React.FC<EditTripScreenProps> = ({ trip, onClose, onSave }) => {
  const [editForm, setEditForm] = useState({
    destination: trip.destination,
    checkIn: trip.checkIn,
    checkOut: trip.checkOut,
    groupType: trip.groupType,
    budget: trip.budget.toString(),
    activityLevel: trip.activityLevel,
    interests: trip.interests ? JSON.parse(trip.interests) : [],
    dailySpendCap: trip.dailySpendCap ? trip.dailySpendCap.toString() : '',
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  // Hooks
  const currencyContext = useCurrency();
  const { formatAmount, getCurrencySymbol, currency } = currencyContext || { 
    formatAmount: (amount: number) => `$${amount.toFixed(2)}`, 
    getCurrencySymbol: () => '$', 
    currency: 'USD' as any 
  };
  const { t } = useLocalization();
  const colors = useThemeColors();

  // Form validation
  const validateEditField = (field: string, value: any): string | undefined => {
    switch (field) {
      case 'destination':
        if (!value || value.trim().length === 0) {
          return t('validation.destination.required');
        }
        if (value.trim().length < 2) {
          return t('validation.destination.minLength');
        }
        break;
      case 'checkIn':
        if (!value || value.trim().length === 0) {
          return t('validation.checkIn.required');
        }
        break;
      case 'checkOut':
        if (!value || value.trim().length === 0) {
          return t('validation.checkOut.required');
        }
        break;
      case 'budget':
        if (!value || value.trim().length === 0) {
          return t('validation.budget.required');
        }
        const budgetNum = parseFloat(value);
        if (isNaN(budgetNum) || budgetNum <= 0) {
          return t('validation.budget.positive');
        }
        break;
      case 'dailySpendCap':
        if (value && value.trim().length > 0) {
          const capNum = parseFloat(value);
          if (isNaN(capNum) || capNum <= 0) {
            return t('validation.dailySpendCap.positive');
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

  const handleSave = async () => {
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

    try {
      const updatedTripData = {
        destination: editForm.destination.trim(),
        checkIn: editForm.checkIn,
        checkOut: editForm.checkOut,
        groupType: editForm.groupType,
        budget: parseFloat(editForm.budget),
        activityLevel: editForm.activityLevel,
        interests: JSON.stringify(editForm.interests),
        dailySpendCap: editForm.dailySpendCap ? parseFloat(editForm.dailySpendCap) : null,
      };

      await databaseService.updateTrip(trip.id, updatedTripData);
      onSave(updatedTripData);
      onClose();
    } catch (error) {
      console.error('Error updating trip:', error);
      Alert.alert(t('common.error'), t('alert.updateTripError'));
    }
  };

  const styles = createStyles(colors);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.default }]}>
      {/* Header with Gradient */}
      <LinearGradient
        colors={[colors.primary.main, colors.primary.dark]}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={onClose}
          >
            <Ionicons name="arrow-back" size={24} color={colors.primary.contrastText} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('common.edit')} Trip</Text>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
          >
            <Text style={styles.saveButtonText}>{t('common.save')}</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Content */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formContainer}>
          <FormInput
            label={t('setup.destination')}
            value={editForm.destination}
            onChangeText={(text) => handleEditFieldChange('destination', text)}
            error={formErrors.destination}
            placeholder={t('setup.destination.placeholder')}
          />
          
          <View style={styles.dateRow}>
            <View style={styles.dateColumn}>
              <DatePicker
                value={editForm.checkIn}
                onChange={(date) => handleEditFieldChange('checkIn', date)}
                placeholder={t('setup.checkInDate')}
                error={formErrors.checkIn}
                mode="date"
              />
            </View>
            <View style={styles.dateColumn}>
              <DatePicker
                value={editForm.checkOut}
                onChange={(date) => handleEditFieldChange('checkOut', date)}
                placeholder={t('setup.checkOutDate')}
                error={formErrors.checkOut}
                minimumDate={editForm.checkIn ? new Date(editForm.checkIn) : undefined}
                mode="date"
              />
            </View>
          </View>
          
          <GroupTypeSelector
            selectedGroupType={editForm.groupType}
            onGroupTypeChange={(type) => handleEditFieldChange('groupType', type)}
          />
          
          <FormInput
            label={t('setup.budget')}
            value={editForm.budget}
            onChangeText={(text) => handleEditFieldChange('budget', text)}
            error={formErrors.budget}
            keyboardType="numeric"
            placeholder={`${getCurrencySymbol(currency)}0.00`}
          />
          
          <PreferenceSlider
            value={editForm.activityLevel}
            onValueChange={(value) => handleEditFieldChange('activityLevel', value)}
            min={0}
            max={100}
            step={5}
            label={t('setup.activityLevel')}
            unit="%"
            description={t('setup.activityLevel.description')}
          />
          
          <FormInput
            label={t('setup.dailySpendCap.optional')}
            value={editForm.dailySpendCap}
            onChangeText={(text) => handleEditFieldChange('dailySpendCap', text)}
            error={formErrors.dailySpendCap}
            keyboardType="numeric"
            placeholder={`${getCurrencySymbol(currency)}0.00`}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  headerGradient: {
    paddingTop: 0,
    paddingBottom: professionalSpacing[4],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: professionalSpacing[6],
    paddingTop: professionalSpacing[4],
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    ...designSystem.textStyles.h2,
    color: colors.primary.contrastText,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: professionalSpacing[4],
  },
  saveButton: {
    paddingHorizontal: professionalSpacing[4],
    paddingVertical: professionalSpacing[2],
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: professionalBorderRadius.lg,
  },
  saveButtonText: {
    ...designSystem.textStyles.button,
    color: colors.primary.contrastText,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: professionalSpacing[6],
    paddingBottom: professionalSpacing[8],
  },
  formContainer: {
    gap: professionalSpacing[6],
  },
  dateRow: {
    flexDirection: 'row',
    gap: professionalSpacing[4],
  },
  dateColumn: {
    flex: 1,
  },
});
