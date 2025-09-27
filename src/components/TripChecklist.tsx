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
import { useLocalization } from '../contexts/LocalizationContext';
import { useAccessibility } from '../hooks/useAccessibility';
import { designSystem, professionalSpacing, professionalShadows, professionalBorderRadius } from '../theme/designSystem';

interface ChecklistItem {
  id: string;
  title: string;
  completed: boolean;
  category: 'packing' | 'documents' | 'booking' | 'preparation' | 'other';
  priority: 'low' | 'medium' | 'high';
}

interface TripChecklistProps {
  visible: boolean;
  tripId: string;
  items: ChecklistItem[];
  onItemAdd: (item: Omit<ChecklistItem, 'id'>) => void;
  onItemUpdate: (itemId: string, updates: Partial<ChecklistItem>) => void;
  onItemDelete: (itemId: string) => void;
  onClose: () => void;
}

export const TripChecklist: React.FC<TripChecklistProps> = ({
  visible,
  tripId,
  items,
  onItemAdd,
  onItemUpdate,
  onItemDelete,
  onClose,
}) => {
  const colors = useThemeColors();
  const { t } = useLocalization();
  const { getButtonProps, getTextProps, getInputProps } = useAccessibility();
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newItem, setNewItem] = useState({
    title: '',
    category: 'packing' as const, 
    priority: 'medium' as const,
    completed: false
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
    categorySection: {
      marginBottom: professionalSpacing[6],
    },
    categoryTitle: {
      ...designSystem.textStyles.h4,
      color: colors.text.primary,
      marginBottom: professionalSpacing[3],
      textTransform: 'capitalize',
    },
    itemCard: {
      backgroundColor: colors.surface.primary,
      borderRadius: professionalBorderRadius.lg,
      padding: professionalSpacing[4],
      marginBottom: professionalSpacing[3],
      ...professionalShadows.sm,
    },
    itemHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: professionalSpacing[2],
    },
    checkbox: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: colors.border.medium,
      marginRight: professionalSpacing[3],
      justifyContent: 'center',
      alignItems: 'center',
    },
    checkedCheckbox: {
      backgroundColor: colors.primary.main,
      borderColor: colors.primary.main,
    },
    itemTitle: {
      ...designSystem.textStyles.bodyLarge,
      color: colors.text.primary,
      flex: 1,
      textDecorationLine: 'none',
    },
    completedItemTitle: {
      textDecorationLine: 'line-through',
      color: colors.text.tertiary,
    },
    priorityBadge: {
      paddingHorizontal: professionalSpacing[2],
      paddingVertical: professionalSpacing[1],
      borderRadius: professionalBorderRadius.sm,
    },
    priorityText: {
      ...designSystem.textStyles.caption,
      textTransform: 'uppercase',
      fontWeight: '600',
    },
    itemActions: {
      flexDirection: 'row',
      gap: professionalSpacing[2],
      marginTop: professionalSpacing[2],
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
    addItemForm: {
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

  const handleAddItem = () => {
    if (newItem.title.trim()) {
      onItemAdd(newItem);
      setNewItem({ title: '', category: 'packing', priority: 'medium', completed: false });
      setIsAddingItem(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return colors.error.main;
      case 'medium': return colors.warning.main;
      case 'low': return colors.success.main;
      default: return colors.primary.main;
    }
  };

  const getCategoryItems = (category: string) => {
    return items.filter(item => item.category === category);
  };

  const categories = ['packing', 'documents', 'booking', 'preparation', 'other'];

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
            <Text style={styles.headerTitle} {...getTextProps('Trip Checklist', 'header')}>
              Trip Checklist
            </Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
              {...getButtonProps('Close checklist')}
          >
            <Ionicons name="close" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {isAddingItem && (
              <View style={styles.addItemForm}>
                <Text style={styles.formTitle} {...getTextProps('Add New Item', 'header')}>
                  Add New Item
                </Text>
                <TextInput
                  style={styles.input}
                  {...getInputProps('Item title')}
                  placeholder={t('trip.checklistItem')}
                  placeholderTextColor="#000000"
                  value={newItem.title}
                  onChangeText={(text) => setNewItem(prev => ({ ...prev, title: text }))}
                />
                <View style={styles.formActions}>
                        <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => {
                      setIsAddingItem(false);
                      setNewItem({ title: '', category: 'packing', priority: 'medium', completed: false });
                    }}
                    {...getButtonProps('Cancel adding item')}
                  >
                    <Text style={styles.cancelButtonText} {...getTextProps('Cancel', 'button')}>
                      Cancel
                                </Text>
                        </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleAddItem}
                    {...getButtonProps('Save item')}
                  >
                    <Text style={styles.saveButtonText} {...getTextProps('Save Item', 'button')}>
                      Save Item
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {items.length === 0 && !isAddingItem ? (
              <View style={styles.emptyState}>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={64}
                  color={colors.text.tertiary}
                  style={styles.emptyIcon}
                />
                <Text style={styles.emptyTitle} {...getTextProps('No Items Yet', 'header')}>
                  No Items Yet
                </Text>
                <Text style={styles.emptyDescription} {...getTextProps('Add items to your trip checklist to stay organized', 'text')}>
                  Add items to your trip checklist to stay organized
                </Text>
              </View>
            ) : (
              categories.map((category) => {
                const categoryItems = getCategoryItems(category);
                if (categoryItems.length === 0) return null;

                return (
                  <View key={category} style={styles.categorySection}>
                    <Text style={styles.categoryTitle} {...getTextProps(category, 'header')}>
                      {category}
                    </Text>
                    {categoryItems.map((item) => (
                      <View key={item.id} style={styles.itemCard}>
                        <View style={styles.itemHeader}>
                        <TouchableOpacity
                          style={[
                              styles.checkbox,
                              item.completed && styles.checkedCheckbox,
                            ]}
                            onPress={() => onItemUpdate(item.id, { completed: !item.completed })}
                          {...getButtonProps(
                              item.completed ? 'Mark as incomplete' : 'Mark as complete'
                          )}
                        >
                            {item.completed && (
                          <Ionicons
                                name="checkmark"
                            size={16}
                                color={colors.primary.contrastText}
                          />
                            )}
                          </TouchableOpacity>
                          <Text
                            style={[
                              styles.itemTitle,
                              item.completed && styles.completedItemTitle,
                            ]}
                            {...getTextProps('Toggle item', 'button')}
                          >
                            {item.title}
                          </Text>
                          <View
                            style={[
                              styles.priorityBadge,
                              { backgroundColor: getPriorityColor(item.priority) + '20' },
                            ]}
                          >
                            <Text
                              style={[
                                styles.priorityText,
                                { color: getPriorityColor(item.priority) },
                              ]}
                              {...getTextProps(item.priority, 'text')}
                            >
                              {item.priority}
                          </Text>
                    </View>
                  </View>
                        <View style={styles.itemActions}>
                          <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => onItemUpdate(item.id, { title: 'Updated item' })}
                            {...getButtonProps('Edit item')}
                          >
                            <Text style={styles.actionButtonText} {...getTextProps('Edit', 'button')}>
                              Edit
                            </Text>
                          </TouchableOpacity>
                  <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => onItemDelete(item.id)}
                            {...getButtonProps('Delete item')}
                          >
                            <Text style={styles.actionButtonText} {...getTextProps('Delete', 'button')}>
                              Delete
                            </Text>
                  </TouchableOpacity>
                </View>
              </View>
                    ))}
            </View>
                );
              })
            )}

            {!isAddingItem && (
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => setIsAddingItem(true)}
                {...getButtonProps('Add new item')}
              >
                <Ionicons name="add" size={20} color={colors.primary.contrastText} />
                <Text style={styles.addButtonText} {...getTextProps('Add Item', 'button')}>
                  Add Item
                </Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};