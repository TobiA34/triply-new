import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { typography, spacing, borderRadius, shadows } from '../theme';
import { useThemeColors } from '../hooks/useThemeColors';
import { useLocalization } from '../contexts/LocalizationContext';
import { Location, searchLocations } from '../data/locations';

interface DestinationSelectorProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
  onLocationSelect?: (location: Location) => void;
  error?: string;
  label?: string;
}

export const DestinationSelector: React.FC<DestinationSelectorProps> = ({
  placeholder,
  value,
  onChangeText,
  onBlur,
  onLocationSelect,
  error,
  label,
}) => {
  const colors = useThemeColors();
  const { t } = useLocalization();
  const styles = createStyles(colors);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Location[]>([]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim().length >= 2) {
      const results = searchLocations(query, 10);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const handleLocationSelect = (location: Location) => {
    const displayText = location.type === 'city' 
      ? `${location.name}, ${location.country}`
      : location.name;
    
    onChangeText(displayText);
    onLocationSelect?.(location);
    setIsModalVisible(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleModalOpen = () => {
    setIsModalVisible(true);
    setSearchQuery(value);
    if (value.trim().length >= 2) {
      const results = searchLocations(value, 10);
      setSearchResults(results);
    }
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSearchQuery('');
    setSearchResults([]);
    onBlur?.();
  };

  const popularDestinations = [
    { id: 'paris', name: t('destinations.paris'), country: t('destinations.france'), countryCode: 'FR', type: 'city' as const, searchable: [] },
    { id: 'london', name: t('destinations.london'), country: t('destinations.unitedKingdom'), countryCode: 'GB', type: 'city' as const, searchable: [] },
    { id: 'tokyo', name: t('destinations.tokyo'), country: t('destinations.japan'), countryCode: 'JP', type: 'city' as const, searchable: [] },
    { id: 'newyork', name: t('destinations.newYork'), country: t('destinations.unitedStates'), countryCode: 'US', type: 'city' as const, searchable: [] },
    { id: 'barcelona', name: t('destinations.barcelona'), country: t('destinations.spain'), countryCode: 'ES', type: 'city' as const, searchable: [] },
    { id: 'rome', name: t('destinations.rome'), country: t('destinations.italy'), countryCode: 'IT', type: 'city' as const, searchable: [] },
  ];

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <TouchableOpacity
        style={[styles.selector, error && styles.selectorError]}
        onPress={handleModalOpen}
      >
        <View style={styles.selectorContent}>
          <Ionicons 
            name="location-outline" 
            size={20} 
            color={value ? colors.text.primary : colors.text.tertiary} 
          />
          <Text style={[styles.selectorText, !value && styles.placeholderText]}>
            {value || placeholder}
          </Text>
        </View>
        <Ionicons name="chevron-down" size={20} color={colors.text.secondary} />
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleModalClose}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={handleModalClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.text.primary} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Select Destination</Text>
            <View style={styles.placeholder} />
          </View>

          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <Ionicons name="search" size={20} color={colors.text.secondary} />
              <TextInput
                style={styles.searchInput}
                placeholder={t('trip.searchDestinations')}
                value={searchQuery}
                onChangeText={handleSearch}
                placeholderTextColor="#000000"
                autoFocus
              />
            </View>
          </View>

          <ScrollView style={styles.resultsContainer}>
            {searchQuery.trim().length < 2 ? (
              <View style={styles.popularSection}>
                <Text style={styles.sectionTitle}>Popular Destinations</Text>
                {popularDestinations.map((location) => (
                  <TouchableOpacity
                    key={location.id}
                    style={styles.resultItem}
                    onPress={() => handleLocationSelect(location)}
                  >
                    <View style={styles.resultContent}>
                      <Ionicons
                        name={location.type === 'city' ? 'location' : 'globe'}
                        size={20}
                        color={colors.primary.main}
                      />
                      <View style={styles.resultText}>
                        <Text style={styles.resultName}>{location.name}</Text>
                        <Text style={styles.resultCountry}>{location.country}</Text>
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={colors.text.secondary} />
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.searchSection}>
                <Text style={styles.sectionTitle}>
                  {searchResults.length > 0 ? t('destination.searchResults') : t('destination.noResults')}
                </Text>
                {searchResults.map((location) => (
                  <TouchableOpacity
                    key={location.id}
                    style={styles.resultItem}
                    onPress={() => handleLocationSelect(location)}
                  >
                    <View style={styles.resultContent}>
                      <Ionicons
                        name={location.type === 'city' ? 'location' : 'globe'}
                        size={20}
                        color={colors.primary.main}
                      />
                      <View style={styles.resultText}>
                        <Text style={styles.resultName}>{location.name}</Text>
                        <Text style={styles.resultCountry}>{location.country}</Text>
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={colors.text.secondary} />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
    width: '100%',
  },
  label: {
    fontSize: typography.fontSize.sm,
      fontFamily: typography?.fontFamily?.medium || 'System',
    color: colors.text.primary,
    marginBottom: spacing.sm,
    lineHeight: typography.lineHeight.sm,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: 48,
  },
  selectorError: {
    borderColor: colors.status.error,
    borderWidth: 2,
  },
  selectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  selectorText: {
    fontSize: typography.fontSize.base,
      fontFamily: typography?.fontFamily?.regular || 'System',
    color: colors.text.primary,
    marginLeft: spacing.sm,
    flex: 1,
  },
  placeholderText: {
    color: colors.text.tertiary,
  },
  errorText: {
    color: colors.status.error,
    fontSize: typography.fontSize.xs,
      fontFamily: typography?.fontFamily?.medium || 'System',
    marginTop: spacing.xs,
    lineHeight: typography.lineHeight.xs,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  closeButton: {
    padding: spacing.sm,
  },
  modalTitle: {
    fontSize: typography.fontSize.lg,
      fontFamily: typography?.fontFamily?.semibold || 'System',
    color: colors.text.primary,
  },
  placeholder: {
    width: 40,
  },
  searchContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface.primary,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.fontSize.base,
      fontFamily: typography?.fontFamily?.regular || 'System',
    color: colors.text.primary,
    marginLeft: spacing.sm,
  },
  resultsContainer: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  popularSection: {
    paddingTop: spacing.md,
  },
  searchSection: {
    paddingTop: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.base,
      fontFamily: typography?.fontFamily?.semibold || 'System',
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xs,
  },
  resultContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  resultText: {
    marginLeft: spacing.md,
    flex: 1,
  },
  resultName: {
    fontSize: typography.fontSize.base,
      fontFamily: typography?.fontFamily?.medium || 'System',
    color: colors.text.primary,
    marginBottom: 2,
  },
  resultCountry: {
    fontSize: typography.fontSize.sm,
      fontFamily: typography?.fontFamily?.regular || 'System',
    color: colors.text.secondary,
  },
});
