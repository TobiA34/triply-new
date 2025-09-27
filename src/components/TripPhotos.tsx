import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useThemeColors } from '../hooks/useThemeColors';
import { useAccessibility } from '../hooks/useAccessibility';
import { designSystem, professionalSpacing, professionalShadows, professionalBorderRadius } from '../theme/designSystem';

interface TripPhoto {
  id: string;
  uri: string;
  caption: string;
  timestamp: string;
  location?: string;
}

interface TripPhotosProps {
  visible: boolean;
  tripId: string;
  photos: TripPhoto[];
  onPhotoAdd: (photo: Omit<TripPhoto, 'id'>) => void;
  onPhotoUpdate: (photoId: string, updates: Partial<TripPhoto>) => void;
  onPhotoDelete: (photoId: string) => void;
  onClose: () => void;
}

const { width } = Dimensions.get('window');
const photoSize = (width - professionalSpacing[6] * 3) / 2;

export const TripPhotos: React.FC<TripPhotosProps> = ({
  visible,
  tripId,
  photos,
  onPhotoAdd,
  onPhotoUpdate,
  onPhotoDelete,
  onClose,
}) => {
  const colors = useThemeColors();
  const { getButtonProps, getTextProps } = useAccessibility();

  const handleAddPhoto = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });
      if (!result.canceled && result.assets && result.assets[0]?.uri) {
        onPhotoAdd({
          uri: result.assets[0].uri,
          caption: 'Photo',
          timestamp: new Date().toISOString(),
          location: 'Unknown',
        });
      }
    } catch (e) {
      // Silently ignore for now; callers can add error reporting via onPhotoAdd
    }
  };

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
    photosGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: professionalSpacing[4],
    },
    photoContainer: {
      width: photoSize,
      marginBottom: professionalSpacing[4],
    },
    photo: {
      width: photoSize,
      height: photoSize,
      borderRadius: professionalBorderRadius.lg,
      backgroundColor: colors.surface.secondary,
    },
    photoOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      borderRadius: professionalBorderRadius.lg,
      justifyContent: 'flex-end',
      padding: professionalSpacing[3],
    },
    photoCaption: {
      ...designSystem.textStyles.caption,
      color: colors.text.inverse,
      marginBottom: professionalSpacing[1],
    },
    photoTimestamp: {
      ...designSystem.textStyles.caption,
      color: colors.text.inverse,
      opacity: 0.8,
    },
    photoActions: {
      position: 'absolute',
      top: professionalSpacing[2],
      right: professionalSpacing[2],
      flexDirection: 'row',
      gap: professionalSpacing[2],
    },
    photoActionButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    addPhotoButton: {
      width: photoSize,
      height: photoSize,
      borderRadius: professionalBorderRadius.lg,
      backgroundColor: colors.surface.secondary,
      borderWidth: 2,
      borderColor: colors.border.light,
      borderStyle: 'dashed',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: professionalSpacing[4],
    },
    addPhotoIcon: {
      marginBottom: professionalSpacing[2],
    },
    addPhotoText: {
      ...designSystem.textStyles.caption,
      color: colors.text.secondary,
      textAlign: 'center',
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
            <Text style={styles.headerTitle} {...getTextProps('Trip Photos', 'header')}>
              Trip Photos
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              {...getButtonProps('Close photos')}
            >
              <Ionicons name="close" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {photos.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons
                  name="camera-outline"
                  size={64}
                  color={colors.text.tertiary}
                  style={styles.emptyIcon}
                />
                <Text style={styles.emptyTitle} {...getTextProps('No Photos Yet', 'header')}>
                  No Photos Yet
                </Text>
                <Text style={styles.emptyDescription} {...getTextProps('Add photos to capture your trip memories', 'text')}>
                  Add photos to capture your trip memories
                </Text>
              </View>
            ) : (
              <View style={styles.photosGrid}>
                {photos.map((photo) => (
                  <View key={photo.id} style={styles.photoContainer}>
                    <View style={styles.photo}>
                      <Image
                        source={{ uri: photo.uri }}
                        style={styles.photo}
                        resizeMode="cover"
                      />
                      <View style={styles.photoOverlay}>
                        <Text style={styles.photoCaption} {...getTextProps(photo.caption, 'text')}>
                          {photo.caption}
                        </Text>
                        <Text style={styles.photoTimestamp} {...getTextProps(photo.timestamp, 'text')}>
                          {photo.timestamp}
                        </Text>
                      </View>
                      <View style={styles.photoActions}>
                        <TouchableOpacity
                          style={styles.photoActionButton}
                          onPress={() => onPhotoUpdate(photo.id, { caption: 'Updated caption' })}
                          {...getButtonProps('Edit photo')}
                        >
                          <Ionicons name="create" size={16} color={colors.text.inverse} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.photoActionButton}
                          onPress={() => onPhotoDelete(photo.id)}
                          {...getButtonProps('Delete photo')}
                        >
                          <Ionicons name="trash" size={16} color={colors.text.inverse} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}

            <TouchableOpacity
              style={styles.addPhotoButton}
              onPress={handleAddPhoto}
              {...getButtonProps('Add new photo')}
            >
              <Ionicons
                name="camera"
                size={32}
                color={colors.text.tertiary}
                style={styles.addPhotoIcon}
              />
              <Text style={styles.addPhotoText} {...getTextProps('Add Photo', 'button')}>
                Add Photo
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};