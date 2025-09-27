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

interface BugReportProps {
  visible: boolean;
  onClose: () => void;
}

const BUG_CATEGORIES = [
  'App Crashes',
  'UI/UX Issues',
  'Performance Problems',
  'Data Sync Issues',
  'Feature Not Working',
  'Login/Authentication',
  'Other'
];

const PRIORITY_LEVELS = [
  'Low',
  'Medium',
  'High',
  'Critical'
];

export const BugReport: React.FC<BugReportProps> = ({ visible, onClose }) => {
  const colors = useThemeColors();
  const { t } = useLocalization();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    steps: '',
    expectedBehavior: '',
    actualBehavior: '',
    category: 'Other',
    priority: 'Medium',
    deviceInfo: '',
    appVersion: '1.0.0',
    email: ''
  });

  const styles = useMemo(() => createStyles(colors), [colors]);

  const handleSubmit = () => {
    if (!formData.title || !formData.description || !formData.steps) {
      Alert.alert('Error', 'Please fill in all required fields (Title, Description, Steps to Reproduce)');
      return;
    }

    // In a real app, this would send the bug report to your backend
    Alert.alert(
      'Bug Report Submitted',
      'Thank you for reporting this bug! We\'ll investigate and get back to you soon.',
      [
        {
          text: 'OK',
          onPress: () => {
            setFormData({
              title: '',
              description: '',
              steps: '',
              expectedBehavior: '',
              actualBehavior: '',
              category: 'Other',
              priority: 'Medium',
              deviceInfo: '',
              appVersion: '1.0.0',
              email: ''
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
              steps: '',
              expectedBehavior: '',
              actualBehavior: '',
              category: 'Other',
              priority: 'Medium',
              deviceInfo: '',
              appVersion: '1.0.0',
              email: ''
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
            {t('settings.bugReport')}
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          <View style={[styles.formCard, { backgroundColor: colors.surface.primary, borderColor: colors.border.light }]}>
            <Text style={[styles.formTitle, { color: colors.text.primary }]}>
              Report a Bug
            </Text>
            <Text style={[styles.formSubtitle, { color: colors.text.secondary }]}>
              Help us improve the app by reporting any issues you encounter
            </Text>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text.primary }]}>Bug Title *</Text>
              <TextInput
                style={[styles.textInput, { backgroundColor: colors.surface.secondary, borderColor: colors.border.light, color: colors.text.primary }]}
                value={formData.title}
                onChangeText={(text) => setFormData({ ...formData, title: text })}
                placeholder="Brief description of the bug"
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
              <Text style={[styles.inputLabel, { color: colors.text.primary }]}>Priority</Text>
              <TouchableOpacity style={[styles.dropdown, { backgroundColor: colors.surface.secondary, borderColor: colors.border.light }]}>
                <Text style={[styles.dropdownText, { color: colors.text.primary }]}>
                  {formData.priority}
                </Text>
                <Ionicons name="chevron-down" size={20} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text.primary }]}>Description *</Text>
              <TextInput
                style={[styles.textArea, { backgroundColor: colors.surface.secondary, borderColor: colors.border.light, color: colors.text.primary }]}
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                placeholder="Describe the bug in detail..."
                placeholderTextColor={colors.text.secondary}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text.primary }]}>Steps to Reproduce *</Text>
              <TextInput
                style={[styles.textArea, { backgroundColor: colors.surface.secondary, borderColor: colors.border.light, color: colors.text.primary }]}
                value={formData.steps}
                onChangeText={(text) => setFormData({ ...formData, steps: text })}
                placeholder="1. Go to...&#10;2. Click on...&#10;3. See error..."
                placeholderTextColor={colors.text.secondary}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text.primary }]}>Expected Behavior</Text>
              <TextInput
                style={[styles.textArea, { backgroundColor: colors.surface.secondary, borderColor: colors.border.light, color: colors.text.primary }]}
                value={formData.expectedBehavior}
                onChangeText={(text) => setFormData({ ...formData, expectedBehavior: text })}
                placeholder="What should have happened?"
                placeholderTextColor={colors.text.secondary}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text.primary }]}>Actual Behavior</Text>
              <TextInput
                style={[styles.textArea, { backgroundColor: colors.surface.secondary, borderColor: colors.border.light, color: colors.text.primary }]}
                value={formData.actualBehavior}
                onChangeText={(text) => setFormData({ ...formData, actualBehavior: text })}
                placeholder="What actually happened?"
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
                  Submit Bug Report
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
