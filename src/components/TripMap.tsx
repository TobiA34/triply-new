import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../hooks/useThemeColors';
import { useAccessibility } from '../hooks/useAccessibility';
import { useLocalization } from '../contexts/LocalizationContext';
import { designSystem, professionalSpacing, professionalShadows, professionalBorderRadius } from '../theme/designSystem';

interface MapLocation {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  type: 'attraction' | 'restaurant' | 'hotel' | 'transport' | 'other';
  notes?: string;
}

interface TripMapProps {
  visible: boolean;
  tripId: string;
  locations: MapLocation[];
  onLocationAdd: (location: Omit<MapLocation, 'id'>) => void;
  onLocationUpdate: (locationId: string, updates: Partial<MapLocation>) => void;
  onLocationDelete: (locationId: string) => void;
  onClose: () => void;
}

export const TripMap: React.FC<TripMapProps> = ({
  visible,
  tripId,
  locations,
  onLocationAdd,
  onLocationUpdate,
  onLocationDelete,
  onClose,
}) => {
  const colors = useThemeColors();
  const { getButtonProps, getTextProps, getInputProps } = useAccessibility();
  const { t } = useLocalization();
  const [isAddingLocation, setIsAddingLocation] = useState(false);
  const [newLocation, setNewLocation] = useState({ 
    name: '', 
    address: '', 
    latitude: 0, 
    longitude: 0, 
    type: 'attraction' as const,
    notes: ''
  });

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
    mapPlaceholder: {
      height: 200,
      backgroundColor: colors.surface.secondary,
      borderRadius: professionalBorderRadius.lg,
      marginBottom: professionalSpacing[6],
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: colors.border.light,
      borderStyle: 'dashed',
    },
    mapPlaceholderText: {
      ...designSystem.textStyles.body,
      color: colors.text.tertiary,
      textAlign: 'center',
    },
    locationCard: {
      backgroundColor: colors.surface.primary,
      borderRadius: professionalBorderRadius.lg,
      padding: professionalSpacing[4],
      marginBottom: professionalSpacing[3],
      ...professionalShadows.sm,
    },
    locationHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: professionalSpacing[2],
    },
    locationIcon: {
      marginRight: professionalSpacing[3],
    },
    locationName: {
      ...designSystem.textStyles.h4,
      color: colors.text.primary,
      flex: 1,
    },
    locationType: {
      ...designSystem.textStyles.caption,
      color: colors.primary.main,
      backgroundColor: colors.primary.main + '20',
      paddingHorizontal: professionalSpacing[2],
      paddingVertical: professionalSpacing[1],
      borderRadius: professionalBorderRadius.sm,
      textTransform: 'uppercase',
    },
    locationAddress: {
      ...designSystem.textStyles.body,
      color: colors.text.secondary,
      marginBottom: professionalSpacing[2],
    },
    locationNotes: {
      ...designSystem.textStyles.caption,
      color: colors.text.tertiary,
      fontStyle: 'italic',
      marginBottom: professionalSpacing[3],
    },
    locationActions: {
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
    addLocationForm: {
      backgroundColor: colors.surface.primary,
      borderRadius: professionalBorderRadius.lg,
      padding: professionalSpacing[4],
      marginBottom: professionalSpacing[4],
      ...professionalShadows.sm,
    },
    formTitle: {
      ...designSystem.textStyles.h4,
      color: colors.text.primary,
      marginBottom: professionalSpacing[4],
    },
    input: {
      ...designSystem.textStyles.body,
      color: colors.text.primary,
      backgroundColor: colors.background.paper,
      borderRadius: professionalBorderRadius.md,
      padding: professionalSpacing[3],
      marginBottom: professionalSpacing[3],
      borderWidth: 1,
      borderColor: colors.border.light,
    },
    textArea: {
      height: 80,
      textAlignVertical: 'top',
    },
    formActions: {
      flexDirection: 'row',
      gap: professionalSpacing[3],
    },
    saveButton: {
      flex: 1,
      backgroundColor: colors.primary.main,
      borderRadius: professionalBorderRadius.md,
      padding: professionalSpacing[3],
      alignItems: 'center',
    },
    saveButtonText: {
      ...designSystem.textStyles.button,
      color: colors.primary.contrastText,
    },
    cancelButton: {
      flex: 1,
      backgroundColor: colors.surface.secondary,
      borderRadius: professionalBorderRadius.md,
      padding: professionalSpacing[3],
      alignItems: 'center',
    },
    cancelButtonText: {
      ...designSystem.textStyles.button,
      color: colors.text.primary,
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
  });

  const handleAddLocation = () => {
    if (newLocation.name.trim() && newLocation.address.trim()) {
      onLocationAdd({
        ...newLocation,
        latitude: Math.random() * 180 - 90, // Mock coordinates
        longitude: Math.random() * 360 - 180,
      });
      setNewLocation({ 
        name: '', 
        address: '', 
        latitude: 0, 
        longitude: 0, 
        type: 'attraction',
        notes: ''
      });
      setIsAddingLocation(false);
    }
  };

  const getLocationIcon = (type: string) => {
    switch (type) {
      case 'attraction': return 'camera';
      case 'restaurant': return 'restaurant';
      case 'hotel': return 'bed';
      case 'transport': return 'car';
      default: return 'location';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'attraction': return colors.accent.main;
      case 'restaurant': return colors.warning.main;
      case 'hotel': return colors.primary.main;
      case 'transport': return colors.success.main;
      default: return colors.text.secondary;
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
            <Text style={styles.headerTitle} {...getTextProps('Trip Map', 'header')}>
              Trip Map
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              {...getButtonProps('Close map')}
            >
              <Ionicons name="close" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.mapPlaceholder}>
              <Ionicons name="map" size={48} color={colors.text.tertiary} />
              <Text style={styles.mapPlaceholderText} {...getTextProps('Interactive map would be displayed here', 'text')}>
                Interactive map would be displayed here
              </Text>
            </View>

            {isAddingLocation && (
              <View style={styles.addLocationForm}>
                <Text style={styles.formTitle} {...getTextProps('Add New Location', 'header')}>
                  Add New Location
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder={t('trip.locationName')}
                  {...getInputProps('Location name')}
                  placeholderTextColor="#000000"
                  value={newLocation.name}
                  onChangeText={(text) => setNewLocation(prev => ({ ...prev, name: text }))}
                />
                <TextInput
                  style={styles.input}
                  placeholder={t('trip.address')}
                  {...getInputProps('Address')}
                  placeholderTextColor="#000000"
                  value={newLocation.address}
                  onChangeText={(text) => setNewLocation(prev => ({ ...prev, address: text }))}
                />
                <TextInput
                  style={[styles.input, styles.textArea]}
                  {...getInputProps('Notes')}
                  placeholder={t('trip.notesOptional')}
                  placeholderTextColor="#000000"
                  value={newLocation.notes}
                  onChangeText={(text) => setNewLocation(prev => ({ ...prev, notes: text }))}
                  multiline
                />
                <View style={styles.formActions}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => {
                      setIsAddingLocation(false);
                      setNewLocation({ 
                        name: '', 
                        address: '', 
                        latitude: 0, 
                        longitude: 0, 
                        type: 'attraction',
                        notes: ''
                      });
                    }}
                    {...getButtonProps('Cancel adding location')}
                  >
                    <Text style={styles.cancelButtonText} {...getTextProps('Cancel', 'button')}>
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleAddLocation}
                    {...getButtonProps('Save location')}
                  >
                    <Text style={styles.saveButtonText} {...getTextProps('Save Location', 'button')}>
                      Save Location
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {locations.length === 0 && !isAddingLocation ? (
              <View style={styles.emptyState}>
                <Ionicons
                  name="location-outline"
                  size={64}
                  color={colors.text.tertiary}
                  style={styles.emptyIcon}
                />
                <Text style={styles.emptyTitle} {...getTextProps('No Locations Yet', 'header')}>
                  No Locations Yet
                </Text>
                <Text style={styles.emptyDescription} {...getTextProps('Add locations to create your trip map', 'text')}>
                  Add locations to create your trip map
                </Text>
              </View>
            ) : (
              locations.map((location) => (
                <View key={location.id} style={styles.locationCard}>
                  <View style={styles.locationHeader}>
                    <Ionicons
                      name={getLocationIcon(location.type) as any}
                      size={20}
                      color={getTypeColor(location.type)}
                      style={styles.locationIcon}
                    />
                    <Text style={styles.locationName} {...getTextProps(location.name, 'header')}>
                      {location.name}
                    </Text>
                    <Text
                      style={[
                        styles.locationType,
                        { color: getTypeColor(location.type) },
                      ]}
                      {...getTextProps('Edit location', 'button')}
                    >
                      {location.type}
                    </Text>
                  </View>
                  <Text style={styles.locationAddress} {...getTextProps(location.address, 'text')}>
                    {location.address}
                  </Text>
                  {location.notes && (
                    <Text style={styles.locationNotes} {...getTextProps(location.notes, 'text')}>
                      {location.notes}
                    </Text>
                  )}
                  <View style={styles.locationActions}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => onLocationUpdate(location.id, { name: 'Updated location' })}
                      {...getButtonProps('Edit location')}
                    >
                      <Text style={styles.actionButtonText} {...getTextProps('Edit', 'button')}>
                        Edit
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => onLocationDelete(location.id)}
                      {...getButtonProps('Delete location')}
                    >
                      <Text style={styles.actionButtonText} {...getTextProps('Delete', 'button')}>
                        Delete
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}

            {!isAddingLocation && (
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => setIsAddingLocation(true)}
                {...getButtonProps('Add new location')}
              >
                <Ionicons name="add" size={20} color={colors.primary.contrastText} />
                <Text style={styles.addButtonText} {...getTextProps('Add Location', 'button')}>
                  Add Location
                </Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};