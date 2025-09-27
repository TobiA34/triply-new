import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../hooks/useThemeColors';
import { useLocalization } from '../contexts/LocalizationContext';

interface FeatureRequestProps {
  visible: boolean;
  onClose: () => void;
}

const FEATURE_CATEGORIES = [
  'Trip Planning',
  'Budget Management',
  'Social Features',
  'Offline Mode',
  'Analytics & Reports',
  'UI/UX Improvements',
  'Integration & Export',
  'Other'
];

const IMPACT_LEVELS = [
  'Low',
  'Medium',
  'High',
  'Critical'
];

export const FeatureRequest: React.FC<FeatureRequestProps> = ({ visible, onClose }) => {
  const colors = useThemeColors();
  const { t } = useLocalization();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    useCase: '',
    benefits: '',
    category: 'Other',
    impact: 'Medium',
    email: '',
    additionalInfo: ''
  });

  const styles = useMemo(() => createStyles(colors), [colors]);

  const handleSubmit = () => {
    if (!formData.title || !formData.description || !formData.useCase) {
      Alert.alert('Error', 'Please fill in all required fields (Title, Description, Use Case)');
      return;
    }

    // In a real app, this would send the feature request to your backend
    Alert.alert(
      'Feature Request Submitted',
      'Thank you for your suggestion! We\'ll review it and consider it for future updates.',
      [
        {
          text: 'OK',
          onPress: () => {
            setFormData({
              title: '',
              description: '',
              useCase: '',
              benefits: '',
              category: 'Other',
              impact: 'Medium',
              email: '',
              additionalInfo: ''
            });
            onClose();
          }
        }
      ]
    );
  };

  const handleReset = () => {
    Alert.alert(
      'Reset Form',
      'Are you sure you want to clear all the information you\'ve entered?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            setFormData({
              title: '',
              description: '',
              useCase: '',
              benefits: '',
              category: 'Other',
              impact: 'Medium',
              email: '',
              additionalInfo: ''
            });
          }
        }
      ]
    );
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background.default }]}>
        <View style={[styles.header, { backgroundColor: colors.surface.primary, borderBottomColor: colors.border.light }]}>
          <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
            {t('settings.featureRequest')}
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          <View style={[styles.formCard, { backgroundColor: colors.surface.primary, borderColor: colors.border.light }]}>
            <Text style={[styles.formTitle, { color: colors.text.primary }]}>
              Suggest a Feature
            </Text>
            <Text style={[styles.formSubtitle, { color: colors.text.secondary }]}>
              Help us improve Triply by suggesting new features or improvements
            </Text>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text.primary }]}>Feature Title *</Text>
              <TextInput
                style={[styles.textInput, { backgroundColor: colors.surface.secondary, borderColor: colors.border.light, color: colors.text.primary }]}
                value={formData.title}
                onChangeText={(text) => setFormData({ ...formData, title: text })}
                placeholder="Brief description of the feature"
                placeholderTextColor={colors.text.secondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text.primary }]}>Category</Text>
              <TouchableOpacity style={[styles.dropdown, { backgroundColor: colors.surface.secondary, borderColor: colors.border.light }]}>
                <Text style={[styles.dropdownText, { color: colors.text.primary }]}>
                  {formData.category}
                </Text>
                <Ionicons name="chevron-down" size={20} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text.primary }]}>Impact Level</Text>
              <TouchableOpacity style={[styles.dropdown, { backgroundColor: colors.surface.secondary, borderColor: colors.border.light }]}>
                <Text style={[styles.dropdownText, { color: colors.text.primary }]}>
                  {formData.impact}
                </Text>
                <Ionicons name="chevron-down" size={20} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text.primary }]}>Feature Description *</Text>
              <TextInput
                style={[styles.textArea, { backgroundColor: colors.surface.secondary, borderColor: colors.border.light, color: colors.text.primary }]}
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                placeholder="Describe the feature in detail..."
                placeholderTextColor={colors.text.secondary}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text.primary }]}>Use Case *</Text>
              <TextInput
                style={[styles.textArea, { backgroundColor: colors.surface.secondary, borderColor: colors.border.light, color: colors.text.primary }]}
                value={formData.useCase}
                onChangeText={(text) => setFormData({ ...formData, useCase: text })}
                placeholder="How would you use this feature? What problem would it solve?"
                placeholderTextColor={colors.text.secondary}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text.primary }]}>Benefits</Text>
              <TextInput
                style={[styles.textArea, { backgroundColor: colors.surface.secondary, borderColor: colors.border.light, color: colors.text.primary }]}
                value={formData.benefits}
                onChangeText={(text) => setFormData({ ...formData, benefits: text })}
                placeholder="What benefits would this feature provide to users?"
                placeholderTextColor={colors.text.secondary}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text.primary }]}>Your Email (Optional)</Text>
              <TextInput
                style={[styles.textInput, { backgroundColor: colors.surface.secondary, borderColor: colors.border.light, color: colors.text.primary }]}
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                placeholder="your.email@example.com"
                placeholderTextColor={colors.text.secondary}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text.primary }]}>Additional Information</Text>
              <TextInput
                style={[styles.textArea, { backgroundColor: colors.surface.secondary, borderColor: colors.border.light, color: colors.text.primary }]}
                value={formData.additionalInfo}
                onChangeText={(text) => setFormData({ ...formData, additionalInfo: text })}
                placeholder="Any additional details, mockups, or references..."
                placeholderTextColor={colors.text.secondary}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.resetButton, { backgroundColor: colors.surface.secondary, borderColor: colors.border.light }]}
                onPress={handleReset}
              >
                <Text style={[styles.resetButtonText, { color: colors.text.secondary }]}>
                  Reset
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.submitButton, { backgroundColor: colors.primary.main }]}
                onPress={handleSubmit}
              >
                <Text style={[styles.submitButtonText, { color: colors.surface.primary }]}>
                  Submit Feature Request
                </Text>
              </TouchableOpacity>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  formCard: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  formSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    height: 100,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dropdownText: {
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  resetButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    flex: 2,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
