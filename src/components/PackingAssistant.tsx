import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  PackingItem,
  PackingCategory,
  packingCategories,
  generatePackingList,
  getPackingList,
  updatePackingItem,
  deletePackingItem,
  addCustomPackingItem,
  getPackingProgress,
  getPackingStats,
} from '../services/packingService';

interface PackingAssistantProps {
  tripId: string;
  destination: string;
  visible: boolean;
  onClose: () => void;
}

export const PackingAssistant: React.FC<PackingAssistantProps> = ({
  tripId,
  destination,
  visible,
  onClose,
}) => {
  const [packingItems, setPackingItems] = useState<PackingItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddItem, setShowAddItem] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('misc');

  useEffect(() => {
    if (visible && tripId) {
      loadPackingList();
    }
  }, [visible, tripId]);

  const loadPackingList = async () => {
    setLoading(true);
    try {
      const items = await getPackingList(tripId);
      setPackingItems(items);
    } catch (error) {
      console.error('Error loading packing list:', error);
      Alert.alert('Error', 'Failed to load packing list');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateList = async () => {
    setIsGenerating(true);
    try {
      const items = await generatePackingList(tripId, destination);
      setPackingItems(items);
      Alert.alert('Success', 'Packing list generated based on weather and destination!');
    } catch (error) {
      console.error('Error generating packing list:', error);
      Alert.alert('Error', 'Failed to generate packing list');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTogglePacked = async (itemId: string, isPacked: boolean) => {
    try {
      await updatePackingItem(itemId, { isPacked });
      setPackingItems(prev =>
        prev.map(item => (item.id === itemId ? { ...item, isPacked } : item))
      );
    } catch (error) {
      console.error('Error updating packing item:', error);
      Alert.alert('Error', 'Failed to update item');
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    Alert.alert(
      'Delete Item',
      'Are you sure you want to delete this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePackingItem(itemId);
              setPackingItems(prev => prev.filter(item => item.id !== itemId));
            } catch (error) {
              console.error('Error deleting packing item:', error);
              Alert.alert('Error', 'Failed to delete item');
            }
          },
        },
      ]
    );
  };

  const handleAddCustomItem = async () => {
    if (!newItemName.trim()) {
      Alert.alert('Error', 'Please enter an item name');
      return;
    }

    try {
      const itemId = await addCustomPackingItem(tripId, newItemCategory, newItemName.trim());
      const newItem: PackingItem = {
        id: itemId,
        tripId,
        category: newItemCategory,
        name: newItemName.trim(),
        isPacked: false,
        isEssential: false,
        weatherBased: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setPackingItems(prev => [...prev, newItem]);
      setNewItemName('');
      setShowAddItem(false);
    } catch (error) {
      console.error('Error adding custom item:', error);
      Alert.alert('Error', 'Failed to add item');
    }
  };

  const filteredItems = selectedCategory === 'all'
    ? packingItems
    : packingItems.filter(item => item.category === selectedCategory);

  const progress = getPackingProgress(packingItems);
  const stats = getPackingStats(packingItems);

  const groupedItems = filteredItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, PackingItem[]>);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#6B7280" />
          </TouchableOpacity>
          <Text style={styles.title}>🎒 Packing Assistant</Text>
          <TouchableOpacity
            onPress={handleGenerateList}
            style={styles.generateButton}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.generateButtonText}>Generate</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Packing Progress</Text>
            <Text style={styles.progressText}>{progress.packed}/{progress.total} items</Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${progress.percentage}%` },
              ]}
            />
          </View>
          <Text style={styles.progressPercentage}>{progress.percentage}% complete</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.essential.packed}/{stats.essential.total}</Text>
            <Text style={styles.statLabel}>Essential</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.weatherBased.packed}/{stats.weatherBased.total}</Text>
            <Text style={styles.statLabel}>Weather-based</Text>
          </View>
        </View>

        <View style={styles.categoryFilter}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={[
                styles.categoryButton,
                selectedCategory === 'all' && styles.categoryButtonActive,
              ]}
              onPress={() => setSelectedCategory('all')}
            >
              <Text style={[
                styles.categoryButtonText,
                selectedCategory === 'all' && styles.categoryButtonTextActive,
              ]}>
                All
              </Text>
            </TouchableOpacity>
            {packingCategories.map(category => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryButton,
                  selectedCategory === category.id && styles.categoryButtonActive,
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Text style={[
                  styles.categoryButtonText,
                  selectedCategory === category.id && styles.categoryButtonTextActive,
                ]}>
                  {category.icon} {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4285F4" />
              <Text style={styles.loadingText}>Loading packing list...</Text>
            </View>
          ) : (
            <>
              {Object.entries(groupedItems).map(([category, items]) => {
                const categoryInfo = packingCategories.find(c => c.id === category);
                const categoryStats = stats.byCategory[category] || { packed: 0, total: 0 };
                
                return (
                  <View key={category} style={styles.categorySection}>
                    <View style={styles.categoryHeader}>
                      <Text style={styles.categoryTitle}>
                        {categoryInfo?.icon} {categoryInfo?.name}
                      </Text>
                      <Text style={styles.categoryStats}>
                        {categoryStats.packed}/{categoryStats.total}
                      </Text>
                    </View>
                    {items.map(item => (
                      <View key={item.id} style={styles.itemRow}>
                        <TouchableOpacity
                          style={styles.itemCheckbox}
                          onPress={() => handleTogglePacked(item.id, !item.isPacked)}
                        >
                          <Ionicons
                            name={item.isPacked ? 'checkmark-circle' : 'ellipse-outline'}
                            size={24}
                            color={item.isPacked ? '#10B981' : '#D1D5DB'}
                          />
                        </TouchableOpacity>
                        <View style={styles.itemContent}>
                          <Text style={[
                            styles.itemName,
                            item.isPacked && styles.itemNamePacked,
                          ]}>
                            {item.name}
                          </Text>
                          <View style={styles.itemBadges}>
                            {item.isEssential && (
                              <View style={styles.badge}>
                                <Text style={styles.badgeText}>Essential</Text>
                              </View>
                            )}
                            {item.weatherBased && (
                              <View style={[styles.badge, styles.weatherBadge]}>
                                <Text style={styles.badgeText}>Weather</Text>
                              </View>
                            )}
                          </View>
                        </View>
                        <TouchableOpacity
                          onPress={() => handleDeleteItem(item.id)}
                          style={styles.deleteButton}
                        >
                          <Ionicons name="trash-outline" size={20} color="#EF4444" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                );
              })}
            </>
          )}
        </ScrollView>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddItem(true)}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Add Custom Item</Text>
        </TouchableOpacity>

        {/* Add Item Modal */}
        <Modal visible={showAddItem} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Add Custom Item</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Item name"
                value={newItemName}
                onChangeText={setNewItemName}
              />
              <View style={styles.categorySelector}>
                <Text style={styles.selectorLabel}>Category:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {packingCategories.map(category => (
                    <TouchableOpacity
                      key={category.id}
                      style={[
                        styles.categoryOption,
                        newItemCategory === category.id && styles.categoryOptionActive,
                      ]}
                      onPress={() => setNewItemCategory(category.id)}
                    >
                      <Text style={[
                        styles.categoryOptionText,
                        newItemCategory === category.id && styles.categoryOptionTextActive,
                      ]}>
                        {category.icon} {category.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setShowAddItem(false);
                    setNewItemName('');
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleAddCustomItem}
                >
                  <Text style={styles.saveButtonText}>Add Item</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  closeButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  generateButton: {
    backgroundColor: '#4285F4',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  progressContainer: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  progressText: {
    fontSize: 14,
    color: '#6B7280',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  progressPercentage: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  categoryFilter: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  categoryButtonActive: {
    backgroundColor: '#4285F4',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  categoryButtonTextActive: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  categorySection: {
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  categoryStats: {
    fontSize: 14,
    color: '#6B7280',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  itemCheckbox: {
    marginRight: 12,
  },
  itemContent: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    color: '#111827',
    marginBottom: 4,
  },
  itemNamePacked: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },
  itemBadges: {
    flexDirection: 'row',
    gap: 6,
  },
  badge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  weatherBadge: {
    backgroundColor: '#FEF3C7',
  },
  badgeText: {
    fontSize: 10,
    color: '#1E40AF',
    fontWeight: '600',
  },
  deleteButton: {
    padding: 8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4285F4',
    margin: 16,
    paddingVertical: 16,
    borderRadius: 12,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    width: '90%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  categorySelector: {
    marginBottom: 20,
  },
  selectorLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 8,
  },
  categoryOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  categoryOptionActive: {
    backgroundColor: '#4285F4',
  },
  categoryOptionText: {
    fontSize: 14,
    color: '#6B7280',
  },
  categoryOptionTextActive: {
    color: '#FFFFFF',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#6B7280',
  },
  saveButton: {
    backgroundColor: '#4285F4',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
