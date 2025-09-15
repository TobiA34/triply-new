import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { databaseService, Trip, Activity } from '../services/database';
import { CurrencyInput } from '../components/CurrencyInput';
import { DatePicker } from '../components/DatePicker';
import { DurationPicker } from '../components/DurationPicker';
import { validateForm, validateField, commonRules, ValidationErrors } from '../utils/formValidation';
import { formatTime } from '../utils/dateFormatting';

interface ActivityManagementScreenProps {
  trip: Trip;
  onClose: () => void;
}

export const ActivityManagementScreen = ({ trip, onClose }: ActivityManagementScreenProps) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  // Form state for adding/editing activities
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    duration: '',
    cost: '',
    description: '',
    location: '',
    time: '',
    day: 1,
  });
  const [formErrors, setFormErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const activityTypes = useMemo(() => [
    'Adventure', 'Culture', 'Food', 'Nature', 'Nightlife', 
    'Shopping', 'Relaxation', 'History', 'Art', 'Sports', 'General'
  ], []);

  const validationRules = useMemo(() => ({
    name: { ...commonRules.name },
    type: { ...commonRules.required },
    duration: { required: true, minLength: 1 },
    cost: { ...commonRules.cost },
    description: { ...commonRules.description },
    location: { required: true, minLength: 2 },
    time: { ...commonRules.required },
    day: { ...commonRules.day },
  }), []);

  useEffect(() => {
    loadActivities();
  }, [trip.id]);

  const loadActivities = useCallback(async () => {
    try {
      const activities = await databaseService.getActivitiesForTrip(trip.id);
      setActivities(activities);
    } catch (error) {
      console.error('Error loading activities:', error);
      Alert.alert('Error', 'Failed to load activities. Please try again.');
    }
  }, [trip.id]);

  const handleAddActivity = useCallback(() => {
    setFormData({
      name: '',
      type: '',
      duration: '',
      cost: '',
      description: '',
      location: '',
      time: '',
      day: 1,
    });
    setFormErrors({});
    setTouched({});
    setIsAddModalVisible(true);
  }, []);

  const handleEditActivity = (activity: Activity) => {
    setFormData({
      name: activity.name,
      type: activity.type,
      duration: activity.duration,
      cost: activity.cost,
      description: activity.description,
      location: activity.location,
      time: activity.time,
      day: activity.day,
    });
    setEditingActivity(activity);
    setIsEditModalVisible(true);
  };

  const handleDeleteActivity = (activityId: string) => {
    Alert.alert(
      'Delete Activity',
      'Are you sure you want to delete this activity?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await databaseService.deleteActivity(activityId);
              setActivities(prev => prev.filter(activity => activity.id !== activityId));
            } catch (error) {
              console.error('Error deleting activity:', error);
              Alert.alert('Error', 'Failed to delete activity. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleSaveActivity = async () => {
    if (!formData.name.trim() || !formData.type.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      if (editingActivity) {
        // Update existing activity
        await databaseService.updateActivity(editingActivity.id, {
          name: formData.name,
          type: formData.type,
          duration: formData.duration,
          cost: formData.cost,
          description: formData.description,
          location: formData.location,
          time: formData.time,
          day: formData.day,
        });
        
        setActivities(prev => 
          prev.map(activity => 
            activity.id === editingActivity.id 
              ? { ...activity, ...formData }
              : activity
          )
        );
        setIsEditModalVisible(false);
        setEditingActivity(null);
      } else {
        // Create new activity
        const activityId = await databaseService.saveActivity({
          tripId: trip.id,
          name: formData.name,
          type: formData.type,
          duration: formData.duration,
          cost: formData.cost,
          description: formData.description,
          location: formData.location,
          time: formData.time,
          day: formData.day,
        });
        
        const newActivity: Activity = {
          id: activityId,
          tripId: trip.id,
          name: formData.name,
          type: formData.type,
          duration: formData.duration,
          cost: formData.cost,
          description: formData.description,
          location: formData.location,
          time: formData.time,
          day: formData.day,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        setActivities(prev => [...prev, newActivity]);
        setIsAddModalVisible(false);
      }

      setFormData({
        name: '',
        type: '',
        duration: '',
        cost: '',
        description: '',
        location: '',
        time: '',
        day: 1,
      });
    } catch (error) {
      console.error('Error saving activity:', error);
      Alert.alert('Error', 'Failed to save activity. Please try again.');
    }
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    // Validate the field
    const validationRules = {
      name: commonRules.required,
      type: commonRules.required,
      duration: commonRules.required,
      cost: commonRules.required,
      description: commonRules.required,
      location: commonRules.required,
      time: commonRules.required,
      day: commonRules.required,
    };

    const rule = validationRules[field as keyof typeof validationRules];
    const error = rule ? validateField(formData[field as keyof typeof formData], rule) : undefined;
    setFormErrors(prev => ({ ...prev, [field]: error || '' }));
  };

  const groupActivitiesByDay = (activities: Activity[]) => {
    return activities.reduce((groups, activity) => {
      const day = activity.day;
      if (!groups[day]) {
        groups[day] = [];
      }
      groups[day].push(activity);
      return groups;
    }, {} as Record<number, Activity[]>);
  };

  const groupedActivities = useMemo(() => groupActivitiesByDay(activities), [activities]);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onClose}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Activities for {trip.destination}</Text>
          <TouchableOpacity style={styles.addButton} onPress={handleAddActivity}>
            <Text style={styles.addButtonText}>+ Add</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {Object.keys(groupedActivities).length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🎯</Text>
            <Text style={styles.emptyTitle}>No activities yet</Text>
            <Text style={styles.emptySubtitle}>Tap the + Add button to create your first activity</Text>
          </View>
        ) : (
          Object.entries(groupedActivities)
            .sort(([a], [b]) => parseInt(a) - parseInt(b))
            .map(([day, dayActivities]) => (
              <View key={day} style={styles.daySection}>
                <Text style={styles.dayTitle}>Day {day}</Text>
                {dayActivities.map((activity) => (
                  <View key={activity.id} style={styles.activityCard}>
                    <View style={styles.activityHeader}>
                      <Text style={styles.activityName}>{activity.name}</Text>
                      <View style={styles.activityActions}>
                        <TouchableOpacity
                          style={styles.editButton}
                          onPress={() => handleEditActivity(activity)}
                        >
                          <Text style={styles.editButtonText}>Edit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.deleteButton}
                          onPress={() => handleDeleteActivity(activity.id)}
                        >
                          <Text style={styles.deleteButtonText}>Delete</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                    <Text style={styles.activityType}>{activity.type}</Text>
                    <Text style={styles.activityDescription}>{activity.description}</Text>
                    <View style={styles.activityDetails}>
                      <Text style={styles.activityDetail}>📍 {activity.location}</Text>
                      <Text style={styles.activityDetail}>⏱️ {activity.duration}</Text>
                      <Text style={styles.activityDetail}>💰 {activity.cost}</Text>
                      <Text style={styles.activityDetail}>🕐 {formatTime(activity.time)}</Text>
                    </View>
                  </View>
                ))}
              </View>
            ))
        )}
      </ScrollView>

      {/* Add Activity Modal */}
      <Modal
        visible={isAddModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setIsAddModalVisible(false)}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add Activity</Text>
            <TouchableOpacity onPress={handleSaveActivity}>
              <Text style={styles.saveButton}>Save</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Activity Name *</Text>
              <TextInput
                style={styles.textInput}
                value={formData.name}
                onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                placeholder="Enter activity name"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Type *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeSelector}>
                {activityTypes.map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeChip,
                      formData.type === type && styles.selectedTypeChip
                    ]}
                    onPress={() => setFormData(prev => ({ ...prev, type }))}
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
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={formData.description}
                onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                placeholder="Enter activity description"
                multiline
                numberOfLines={3}
              />
            </View>
            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>Duration</Text>
                <DurationPicker
                  value={formData.duration}
                  onChange={(duration) => setFormData(prev => ({ ...prev, duration }))}
                  error={touched.duration ? formErrors.duration : undefined}
                />
              </View>
              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>Cost</Text>
                <CurrencyInput
                  value={formData.cost}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, cost: text }))}
                  onBlur={() => handleBlur('cost')}
                  placeholder="0.00"
                  error={touched.cost ? formErrors.cost : undefined}
                />
              </View>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Location</Text>
              <TextInput
                style={styles.textInput}
                value={formData.location}
                onChangeText={(text) => setFormData(prev => ({ ...prev, location: text }))}
                placeholder="Enter location"
              />
            </View>
            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>Time</Text>
                <DatePicker
                  value={formData.time}
                  onChange={(time) => setFormData(prev => ({ ...prev, time }))}
                  mode="time"
                  error={touched.time ? formErrors.time : undefined}
                />
              </View>
              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>Day</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.day.toString()}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, day: parseInt(text) || 1 }))}
                  placeholder="Day number"
                  keyboardType="numeric"
                />
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Edit Activity Modal */}
      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setIsEditModalVisible(false)}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Edit Activity</Text>
            <TouchableOpacity onPress={handleSaveActivity}>
              <Text style={styles.saveButton}>Save</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Activity Name *</Text>
              <TextInput
                style={styles.textInput}
                value={formData.name}
                onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                placeholder="Enter activity name"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Type *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeSelector}>
                {activityTypes.map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeChip,
                      formData.type === type && styles.selectedTypeChip
                    ]}
                    onPress={() => setFormData(prev => ({ ...prev, type }))}
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
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={formData.description}
                onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                placeholder="Enter activity description"
                multiline
                numberOfLines={3}
              />
            </View>
            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>Duration</Text>
                <DurationPicker
                  value={formData.duration}
                  onChange={(duration) => setFormData(prev => ({ ...prev, duration }))}
                  error={touched.duration ? formErrors.duration : undefined}
                />
              </View>
              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>Cost</Text>
                <CurrencyInput
                  value={formData.cost}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, cost: text }))}
                  onBlur={() => handleBlur('cost')}
                  placeholder="0.00"
                  error={touched.cost ? formErrors.cost : undefined}
                />
              </View>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Location</Text>
              <TextInput
                style={styles.textInput}
                value={formData.location}
                onChangeText={(text) => setFormData(prev => ({ ...prev, location: text }))}
                placeholder="Enter location"
              />
            </View>
            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>Time</Text>
                <DatePicker
                  value={formData.time}
                  onChange={(time) => setFormData(prev => ({ ...prev, time }))}
                  mode="time"
                  error={touched.time ? formErrors.time : undefined}
                />
              </View>
              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>Day</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.day.toString()}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, day: parseInt(text) || 1 }))}
                  placeholder="Day number"
                  keyboardType="numeric"
                />
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  safeArea: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#4285F4',
    fontWeight: '500',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#4285F4',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
    paddingTop: 120,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  daySection: {
    marginBottom: 24,
  },
  dayTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  activityCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  activityName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  activityActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  editButtonText: {
    fontSize: 12,
    color: '#4285F4',
    fontWeight: '500',
  },
  deleteButton: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  deleteButtonText: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '500',
  },
  activityType: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  activityDescription: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 12,
    lineHeight: 20,
  },
  activityDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  activityDetail: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  cancelButton: {
    fontSize: 16,
    color: '#6B7280',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  saveButton: {
    fontSize: 16,
    color: '#4285F4',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  typeSelector: {
    marginBottom: 8,
  },
  typeChip: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
  },
  selectedTypeChip: {
    backgroundColor: '#4285F4',
  },
  typeChipText: {
    fontSize: 14,
    color: '#6B7280',
  },
  selectedTypeChipText: {
    color: '#FFFFFF',
  },
});
