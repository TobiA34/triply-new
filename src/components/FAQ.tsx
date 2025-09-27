import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../hooks/useThemeColors';
import { useLocalization } from '../contexts/LocalizationContext';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

interface FAQProps {
  visible: boolean;
  onClose: () => void;
}

const FAQ_DATA: FAQItem[] = [
  {
    id: '1',
    question: 'How do I create my first trip?',
    answer: 'To create your first trip, tap the "+" button on the main screen, then fill in your destination, travel dates, budget, and preferences. The app will guide you through each step.',
    category: 'Getting Started'
  },
  {
    id: '2',
    question: 'Can I use the app offline?',
    answer: 'Yes! Enable offline mode in settings to access your saved trips, itineraries, and add new activities even without an internet connection. Data will sync when you\'re back online.',
    category: 'Offline Mode'
  },
  {
    id: '3',
    question: 'How does the budget tracking work?',
    answer: 'Set your total trip budget and daily spending limits. The app tracks your expenses in real-time and sends alerts when you\'re approaching your limits. View detailed spending analytics anytime.',
    category: 'Budget'
  },
  {
    id: '4',
    question: 'Can I share my trip with others?',
    answer: 'Absolutely! Use the share button in your trip details to send your itinerary via social media, email, or messaging apps. You can also create beautiful trip summaries.',
    category: 'Sharing'
  },
  {
    id: '5',
    question: 'How do I add activities to my trip?',
    answer: 'Open your trip details, go to the Activities tab, and tap the "+" button. Fill in the activity name, location, time, and cost. You can also browse recommended activities.',
    category: 'Activities'
  },
  {
    id: '6',
    question: 'What if I need to change my travel dates?',
    answer: 'You can edit your trip dates anytime by opening the trip details and tapping the edit button. The app will automatically adjust recommendations and weather forecasts.',
    category: 'Trip Management'
  },
  {
    id: '7',
    question: 'How do I get weather updates for my destination?',
    answer: 'Weather information is automatically updated for your trip destination. You can view current conditions and forecasts in the Weather tab of your trip details.',
    category: 'Weather'
  },
  {
    id: '8',
    question: 'Can I export my trip data?',
    answer: 'Yes! Go to Settings > Data & Privacy to export your trip data as JSON. This is useful for backup purposes or transferring data to other apps.',
    category: 'Data'
  },
  {
    id: '9',
    question: 'How do I delete a trip?',
    answer: 'Open the trip you want to delete, tap the menu button (three dots), and select "Delete Trip". This action cannot be undone, so make sure you want to delete it.',
    category: 'Trip Management'
  },
  {
    id: '10',
    question: 'Why can\'t I see my saved trips?',
    answer: 'Make sure you\'re logged in and have an internet connection. If the problem persists, try refreshing the app or checking your account status in settings.',
    category: 'Troubleshooting'
  }
];

export const FAQ: React.FC<FAQProps> = ({ visible, onClose }) => {
  const colors = useThemeColors();
  const { t } = useLocalization();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = [...new Set(FAQ_DATA.map(item => item.category))];
  
  const filteredFAQ = selectedCategory 
    ? FAQ_DATA.filter(item => item.category === selectedCategory)
    : FAQ_DATA;

  const styles = useMemo(() => createStyles(colors), [colors]);

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background.default }]}>
        <View style={[styles.header, { backgroundColor: colors.surface.primary, borderBottomColor: colors.border.light }]}>
          <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
            {t('settings.faq')}
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.categoriesSection}>
          <ScrollView 
            style={styles.categoriesContainer} 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContent}
          >
            <TouchableOpacity
              style={[
                styles.categoryChip,
                { backgroundColor: selectedCategory === null ? colors.primary.main : colors.surface.secondary }
              ]}
              onPress={() => setSelectedCategory(null)}
            >
              <Text style={[
                styles.categoryChipText,
                { color: selectedCategory === null ? colors.surface.primary : colors.text.primary }
              ]}>
                All
              </Text>
            </TouchableOpacity>
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryChip,
                  { backgroundColor: selectedCategory === category ? colors.primary.main : colors.surface.secondary }
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text style={[
                  styles.categoryChipText,
                  { color: selectedCategory === category ? colors.surface.primary : colors.text.primary }
                ]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          {filteredFAQ.map((item) => {
            const isExpanded = expandedItems.has(item.id);
            return (
              <View
                key={item.id}
                style={[styles.faqItem, { backgroundColor: colors.surface.primary, borderColor: colors.border.light }]}
              >
                <TouchableOpacity
                  style={styles.questionContainer}
                  onPress={() => toggleExpanded(item.id)}
                >
                  <Text style={[styles.question, { color: colors.text.primary }]}>
                    {item.question}
                  </Text>
                  <Ionicons
                    name={isExpanded ? "chevron-up" : "chevron-down"}
                    size={20}
                    color={colors.text.secondary}
                  />
                </TouchableOpacity>
                
                {isExpanded && (
                  <View style={styles.answerContainer}>
                    <Text style={[styles.answer, { color: colors.text.secondary }]}>
                      {item.answer}
                    </Text>
                  </View>
                )}
              </View>
            );
          })}
          
          {filteredFAQ.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="help-circle-outline" size={48} color={colors.text.secondary} />
              <Text style={[styles.emptyStateText, { color: colors.text.secondary }]}>
                No FAQs found for this category
              </Text>
            </View>
          )}
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
  categoriesSection: {
    paddingVertical: 16,
  },
  categoriesContainer: {
    flexGrow: 0,
  },
  categoriesContent: {
    paddingHorizontal: 20,
    paddingRight: 40, // Extra padding to ensure last item is fully visible
  },
  categoryChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 12,
    minWidth: 80, // Ensure minimum width for text
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  faqItem: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
  },
  questionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  question: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 12,
    lineHeight: 22,
  },
  answerContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  answer: {
    fontSize: 15,
    lineHeight: 22,
    marginTop: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyStateText: {
    fontSize: 16,
    marginTop: 12,
  },
});
