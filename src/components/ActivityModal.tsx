import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../hooks/useThemeColors';
import { useLocalization } from '../contexts/LocalizationContext';
import { designSystem, professionalSpacing, professionalShadows, professionalBorderRadius } from '../theme/designSystem';

interface ActivityModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (activityData: any) => void;
  trip: any;
  editingActivity?: any;
}

export const ActivityModal: React.FC<ActivityModalProps> = ({
  visible,
  onClose,
  onSave,
  trip,
  editingActivity,
}) => {
  const colors = useThemeColors();
  const { t } = useLocalization();
  const styles = createStyles(colors);

  const [formData, setFormData] = useState({
    name: '',
    type: '',
    duration: '',
    cost: '',
    description: '',
    location: '',
    time: '',
  });

  useEffect(() => {
    if (editingActivity) {
      setFormData({
        name: editingActivity.name || '',
        type: editingActivity.type || '',
        duration: editingActivity.duration || '',
        cost: editingActivity.cost || '',
        description: editingActivity.description || '',
        location: editingActivity.location || '',
        time: editingActivity.time || '',
      });
    } else {
      setFormData({
        name: '',
        type: '',
        duration: '',
        cost: '',
        description: '',
        location: '',
        time: '',
      });
    }
  }, [editingActivity, visible]);

  const handleSave = () => {
    if (!formData.name.trim() || !formData.type.trim()) {
      Alert.alert(t('alert.error'), t('alert.fillRequiredFields'));
      return;
    }

    onSave(formData);
  };

  const activityTypes = [
    'Adventure', 'Culture', 'Food', 'Nature', 'Nightlife', 'Shopping', 'Sightseeing', 'Sports', 'Other'
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>
            {editingActivity ? t('activity.editActivity') : t('activity.addActivity')}
          </Text>
          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>{t('common.save')}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('activity.basicInfo')}</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('activity.name')} *</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder={t('activity.namePlaceholder')}
                placeholderTextColor="#000000"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('activity.type')} *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeSelector}>
                {activityTypes.map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeChip,
                      formData.type === type && styles.selectedTypeChip
                    ]}
                    onPress={() => setFormData({ ...formData, type })}
                  >
                    <Text style={[
                      styles.typeChipText,
                      formData.type === type && styles.selectedTypeChipText
                    ]}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('activity.description')}</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                placeholder={t('activity.descriptionPlaceholder')}
                placeholderTextColor="#000000"
                multiline
                numberOfLines={3}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('activity.details')}</Text>
            
            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>{t('activity.duration')}</Text>
                <TextInput
                  style={styles.input}
                  value={formData.duration}
                  onChangeText={(text) => setFormData({ ...formData, duration: text })}
                  placeholder={t('activity.durationPlaceholder')}
                  placeholderTextColor="#000000"
                />
              </View>

              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>{t('activity.cost')}</Text>
                <TextInput
                  style={styles.input}
                  value={formData.cost}
                  onChangeText={(text) => setFormData({ ...formData, cost: text })}
                  placeholder={t('activity.costPlaceholder')}
                  placeholderTextColor="#000000"
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>{t('activity.time')}</Text>
                <TextInput
                  style={styles.input}
                  value={formData.time}
                  onChangeText={(text) => setFormData({ ...formData, time: text })}
                  placeholder={t('activity.timePlaceholder')}
                  placeholderTextColor="#000000"
                />
              </View>

              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>{t('activity.location')}</Text>
                <TextInput
                  style={styles.input}
                  value={formData.location}
                  onChangeText={(text) => setFormData({ ...formData, location: text })}
                  placeholder={t('activity.locationPlaceholder')}
                  placeholderTextColor="#000000"
                />
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: professionalSpacing[4],
    paddingVertical: professionalSpacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  closeButton: {
    padding: professionalSpacing[2],
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    flex: 1,
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: colors.primary.main,
    paddingHorizontal: professionalSpacing[4],
    paddingVertical: professionalSpacing[2],
    borderRadius: professionalBorderRadius.md,
  },
  saveButtonText: {
    color: colors.primary.contrastText,
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: professionalSpacing[4],
  },
  section: {
    marginBottom: professionalSpacing[6],
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: professionalSpacing[4],
  },
  inputGroup: {
    marginBottom: professionalSpacing[4],
  },
  halfWidth: {
    flex: 1,
    marginRight: professionalSpacing[2],
  },
  row: {
    flexDirection: 'row',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.secondary,
    marginBottom: professionalSpacing[1],
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: professionalBorderRadius.md,
    paddingHorizontal: professionalSpacing[3],
    paddingVertical: professionalSpacing[2],
    fontSize: 16,
    color: colors.text.primary,
    backgroundColor: colors.surface.primary,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  typeSelector: {
    marginTop: professionalSpacing[1],
  },
  typeChip: {
    paddingHorizontal: professionalSpacing[3],
    paddingVertical: professionalSpacing[2],
    borderRadius: professionalBorderRadius.full,
    backgroundColor: colors.surface.secondary,
    marginRight: professionalSpacing[2],
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  selectedTypeChip: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },
  typeChipText: {
    fontSize: 14,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  selectedTypeChipText: {
    color: colors.primary.contrastText,
  },
});
