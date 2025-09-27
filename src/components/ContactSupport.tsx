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
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../hooks/useThemeColors';
import { useLocalization } from '../contexts/LocalizationContext';

interface ContactSupportProps {
  visible: boolean;
  onClose: () => void;
}

const SUPPORT_OPTIONS = [
  {
    id: 'email',
    title: 'Email Support',
    description: 'Get help via email within 24 hours',
    icon: 'mail',
    action: 'email'
  },
  {
    id: 'chat',
    title: 'Live Chat',
    description: 'Chat with our support team in real-time',
    icon: 'chatbubbles',
    action: 'chat'
  },
  {
    id: 'phone',
    title: 'Phone Support',
    description: 'Call us for immediate assistance',
    icon: 'call',
    action: 'phone'
  },
  {
    id: 'ticket',
    title: 'Support Ticket',
    description: 'Create a detailed support ticket',
    icon: 'ticket',
    action: 'ticket'
  }
];

export const ContactSupport: React.FC<ContactSupportProps> = ({ visible, onClose }) => {
  const colors = useThemeColors();
  const { t } = useLocalization();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    priority: 'Medium',
    category: 'General'
  });

  const styles = useMemo(() => createStyles(colors), [colors]);

  const handleOptionPress = (optionId: string) => {
    setSelectedOption(optionId);
  };

  const handleBackToOptions = () => {
    setSelectedOption(null);
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: '',
      priority: 'Medium',
      category: 'General'
    });
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    Alert.alert(
      'Support Request Submitted',
      'Thank you for contacting us! We\'ll get back to you within 24 hours.',
      [
        {
          text: 'OK',
          onPress: handleBackToOptions
        }
      ]
    );
  };

  const handleDirectContact = async (action: string) => {
    switch (action) {
      case 'email':
        await Linking.openURL('mailto:support@triply.app?subject=Support Request');
        break;
      case 'phone':
        await Linking.openURL('tel:+1234567890');
        break;
      case 'chat':
        Alert.alert('Live Chat', 'Live chat feature coming soon!');
        break;
      default:
        break;
    }
  };

  if (selectedOption === 'ticket') {
    return (
      <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background.default }]}>
          <View style={[styles.header, { backgroundColor: colors.surface.primary, borderBottomColor: colors.border.light }]}>
            <TouchableOpacity onPress={handleBackToOptions} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
              Support Ticket
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
            <View style={[styles.formCard, { backgroundColor: colors.surface.primary, borderColor: colors.border.light }]}>
              <Text style={[styles.formTitle, { color: colors.text.primary }]}>
                Create Support Ticket
              </Text>
              
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text.primary }]}>Name *</Text>
                <TextInput
                  style={[styles.textInput, { backgroundColor: colors.surface.secondary, borderColor: colors.border.light, color: colors.text.primary }]}
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                  placeholder="Your full name"
                  placeholderTextColor={colors.text.secondary}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text.primary }]}>Email *</Text>
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
                <Text style={[styles.inputLabel, { color: colors.text.primary }]}>Subject *</Text>
                <TextInput
                  style={[styles.textInput, { backgroundColor: colors.surface.secondary, borderColor: colors.border.light, color: colors.text.primary }]}
                  value={formData.subject}
                  onChangeText={(text) => setFormData({ ...formData, subject: text })}
                  placeholder="Brief description of your issue"
                  placeholderTextColor={colors.text.secondary}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text.primary }]}>Message *</Text>
                <TextInput
                  style={[styles.textArea, { backgroundColor: colors.surface.secondary, borderColor: colors.border.light, color: colors.text.primary }]}
                  value={formData.message}
                  onChangeText={(text) => setFormData({ ...formData, message: text })}
                  placeholder="Please provide detailed information about your issue..."
                  placeholderTextColor={colors.text.secondary}
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                />
              </View>

              <TouchableOpacity
                style={[styles.submitButton, { backgroundColor: colors.primary.main }]}
                onPress={handleSubmit}
              >
                <Text style={[styles.submitButtonText, { color: colors.surface.primary }]}>
                  Submit Ticket
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background.default }]}>
        <View style={[styles.header, { backgroundColor: colors.surface.primary, borderBottomColor: colors.border.light }]}>
          <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
            {t('settings.contactSupport')}
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          <Text style={[styles.description, { color: colors.text.secondary }]}>
            Choose how you'd like to get in touch with our support team
          </Text>

          {SUPPORT_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[styles.optionCard, { backgroundColor: colors.surface.primary, borderColor: colors.border.light }]}
              onPress={() => {
                if (option.action === 'ticket') {
                  handleOptionPress(option.id);
                } else {
                  handleDirectContact(option.action);
                }
              }}
            >
              <View style={[styles.iconContainer, { backgroundColor: colors.primary.light }]}>
                <Ionicons name={option.icon as any} size={24} color={colors.primary.main} />
              </View>
              
              <View style={styles.optionInfo}>
                <Text style={[styles.optionTitle, { color: colors.text.primary }]}>
                  {option.title}
                </Text>
                <Text style={[styles.optionDescription, { color: colors.text.secondary }]}>
                  {option.description}
                </Text>
              </View>
              
              <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
            </TouchableOpacity>
          ))}

          <View style={[styles.infoCard, { backgroundColor: colors.surface.primary, borderColor: colors.border.light }]}>
            <Ionicons name="information-circle" size={24} color={colors.primary.main} />
            <View style={styles.infoContent}>
              <Text style={[styles.infoTitle, { color: colors.text.primary }]}>
                Support Hours
              </Text>
              <Text style={[styles.infoText, { color: colors.text.secondary }]}>
                Monday - Friday: 9:00 AM - 6:00 PM (EST){'\n'}
                Saturday: 10:00 AM - 4:00 PM (EST){'\n'}
                Sunday: Closed
              </Text>
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
  backButton: {
    padding: 8,
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
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
    textAlign: 'center',
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  optionInfo: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 8,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
  formCard: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '600',
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
    height: 120,
  },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});