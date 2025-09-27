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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../hooks/useThemeColors';
import { useLocalization } from '../contexts/LocalizationContext';

interface HelpArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
}

interface HelpCenterProps {
  visible: boolean;
  onClose: () => void;
}

const HELP_ARTICLES: HelpArticle[] = [
  {
    id: '1',
    title: 'Getting Started with Triply',
    content: 'Welcome to Triply! This guide will help you create your first trip and explore all the amazing features our app has to offer.\n\n1. Create your first trip by tapping the "+" button\n2. Add your destination and travel dates\n3. Set your budget and preferences\n4. Explore recommendations and plan your itinerary',
    category: 'Getting Started',
    tags: ['beginner', 'trip', 'setup']
  },
  {
    id: '2',
    title: 'How to Add Activities to Your Trip',
    content: 'Adding activities to your trip is easy! Follow these steps:\n\n1. Open your trip details\n2. Tap on "Activities" tab\n3. Use the "+" button to add new activities\n4. Fill in the activity details (name, location, time, cost)\n5. Save your activity\n\nYou can also browse recommended activities based on your destination and interests.',
    category: 'Activities',
    tags: ['activities', 'planning', 'trip']
  },
  {
    id: '3',
    title: 'Managing Your Budget',
    content: 'Triply helps you stay on budget with these features:\n\n• Set a total trip budget\n• Add daily spending limits\n• Track expenses in real-time\n• Get alerts when approaching limits\n• View spending analytics\n\nTo set your budget, go to trip settings and enter your total budget amount.',
    category: 'Budget',
    tags: ['budget', 'money', 'expenses']
  },
  {
    id: '4',
    title: 'Offline Mode Usage',
    content: 'Access your trips even without internet connection:\n\n• Enable offline mode in settings\n• Your trip data will be cached locally\n• View saved trips and itineraries offline\n• Add new activities and notes offline\n• Sync when connection is restored\n\nNote: Some features like weather updates require internet connection.',
    category: 'Offline',
    tags: ['offline', 'sync', 'data']
  },
  {
    id: '5',
    title: 'Sharing Your Trip',
    content: 'Share your amazing trips with friends and family:\n\n1. Open your trip details\n2. Tap the share button\n3. Choose sharing method (social media, email, etc.)\n4. Customize your message\n5. Send your trip details\n\nYou can also create beautiful trip summaries to share.',
    category: 'Sharing',
    tags: ['share', 'social', 'export']
  }
];

export const HelpCenter: React.FC<HelpCenterProps> = ({ visible, onClose }) => {
  const colors = useThemeColors();
  const { t } = useLocalization();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(null);

  const categories = useMemo(() => {
    const cats = [...new Set(HELP_ARTICLES.map(article => article.category))];
    return cats;
  }, []);

  const filteredArticles = useMemo(() => {
    let filtered = HELP_ARTICLES;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(query) ||
        article.content.toLowerCase().includes(query) ||
        article.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(article => article.category === selectedCategory);
    }

    return filtered;
  }, [searchQuery, selectedCategory]);

  const styles = useMemo(() => createStyles(colors), [colors]);

  const handleArticlePress = (article: HelpArticle) => {
    setSelectedArticle(article);
  };

  const handleBackToList = () => {
    setSelectedArticle(null);
  };

  if (selectedArticle) {
    return (
      <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background.default }]}>
          <View style={[styles.header, { backgroundColor: colors.surface.primary, borderBottomColor: colors.border.light }]}>
            <TouchableOpacity onPress={handleBackToList} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
              {selectedArticle.title}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
            <View style={[styles.articleCard, { backgroundColor: colors.surface.primary, borderColor: colors.border.light }]}>
              <Text style={[styles.categoryTag, { backgroundColor: colors.primary.light, color: colors.primary.main }]}>
                {selectedArticle.category}
              </Text>
              <Text style={[styles.articleContent, { color: colors.text.primary }]}>
                {selectedArticle.content}
              </Text>
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
            {t('settings.helpCenter')}
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <View style={[styles.searchBar, { backgroundColor: colors.surface.secondary, borderColor: colors.border.light }]}>
            <Ionicons name="search" size={20} color={colors.text.secondary} />
            <TextInput
              style={[styles.searchInput, { color: colors.text.primary }]}
              placeholder={t('common.search')}
              placeholderTextColor={colors.text.secondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color={colors.text.secondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <ScrollView style={styles.categoriesContainer} horizontal showsHorizontalScrollIndicator={false}>
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

        <ScrollView style={styles.articlesContainer} contentContainerStyle={styles.articlesContent}>
          {filteredArticles.map((article) => (
            <TouchableOpacity
              key={article.id}
              style={[styles.articleCard, { backgroundColor: colors.surface.primary, borderColor: colors.border.light }]}
              onPress={() => handleArticlePress(article)}
            >
              <View style={styles.articleHeader}>
                <Text style={[styles.articleTitle, { color: colors.text.primary }]}>
                  {article.title}
                </Text>
                <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
              </View>
              <Text style={[styles.categoryTag, { backgroundColor: colors.primary.light, color: colors.primary.main }]}>
                {article.category}
              </Text>
            </TouchableOpacity>
          ))}
          
          {filteredArticles.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="search" size={48} color={colors.text.secondary} />
              <Text style={[styles.emptyStateText, { color: colors.text.secondary }]}>
                No articles found
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
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
    maxHeight: 50,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    minHeight: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  articlesContainer: {
    flex: 1,
  },
  articlesContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  articleCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  articleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  articleTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  categoryTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    fontSize: 12,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  articleContent: {
    fontSize: 16,
    lineHeight: 24,
    marginTop: 16,
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
