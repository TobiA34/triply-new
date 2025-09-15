import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView, Dimensions } from 'react-native';
import { formatDate, formatTime, formatDateTime } from '../utils/dateFormatting';

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  placeholder?: string;
  error?: string;
  style?: any;
  minimumDate?: Date;
  maximumDate?: Date;
  mode?: 'date' | 'time' | 'datetime';
}

const { width } = Dimensions.get('window');

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  placeholder,
  error,
  style,
  minimumDate,
  maximumDate,
  mode = 'date',
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [currentDate, setCurrentDate] = useState<Date>(
    value ? new Date(value) : new Date()
  );
  const [selectedDate, setSelectedDate] = useState<Date>(
    value ? new Date(value) : new Date()
  );
  const [selectedTime, setSelectedTime] = useState<{ hour: number; minute: number }>(() => {
    const date = value ? new Date(value) : new Date();
    return {
      hour: date.getHours(),
      minute: date.getMinutes(),
    };
  });

  const formatDisplayValue = (dateString: string) => {
    if (!dateString) return '';
    
    if (mode === 'time') {
      return formatTime(dateString);
    } else if (mode === 'datetime') {
      return formatDateTime(dateString);
    } else {
      return formatDate(dateString);
    }
  };

  const getPlaceholder = () => {
    if (placeholder) return placeholder;
    if (mode === 'time') return 'Select time';
    if (mode === 'datetime') return 'Select date & time';
    return 'Select date';
  };

  const getTitle = () => {
    if (mode === 'time') return 'Select Time';
    if (mode === 'datetime') return 'Select Date & Time';
    return 'Select Date';
  };

  const getIcon = () => {
    if (mode === 'time') return '🕐';
    return '📅';
  };

  const openDatePicker = () => {
    const currentDate = value ? new Date(value) : new Date();
    
    // Validate the date
    if (isNaN(currentDate.getTime())) {
      setCurrentDate(new Date());
      setSelectedDate(new Date());
    } else {
      setCurrentDate(currentDate);
      setSelectedDate(currentDate);
    }
    
    setShowPicker(true);
  };

  const handleConfirm = () => {
    if (mode === 'time') {
      const newDate = new Date();
      newDate.setHours(selectedTime.hour, selectedTime.minute, 0, 0);
      onChange(newDate.toISOString());
    } else if (mode === 'datetime') {
      const newDate = new Date(selectedDate);
      newDate.setHours(selectedTime.hour, selectedTime.minute, 0, 0);
      onChange(newDate.toISOString());
    } else {
      onChange(selectedDate.toISOString());
    }
    setShowPicker(false);
  };

  const handleCancel = () => {
    setCurrentDate(value ? new Date(value) : new Date());
    setSelectedDate(value ? new Date(value) : new Date());
    setShowPicker(false);
  };

  const handleClear = () => {
    onChange('');
    setShowPicker(false);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const selectDate = (day: number) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(newDate);
    
    // For date mode, confirm immediately
    if (mode === 'date') {
      onChange(newDate.toISOString());
      setShowPicker(false);
    }
  };

  const isDateDisabled = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    
    if (minimumDate && date < minimumDate) return true;
    if (maximumDate && date > maximumDate) return true;
    
    return false;
  };

  const isDateSelected = (day: number) => {
    return selectedDate.getDate() === day &&
           selectedDate.getMonth() === currentDate.getMonth() &&
           selectedDate.getFullYear() === currentDate.getFullYear();
  };

  const isToday = (day: number) => {
    const today = new Date();
    return day === today.getDate() &&
           currentDate.getMonth() === today.getMonth() &&
           currentDate.getFullYear() === today.getFullYear();
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<View key={`empty-${i}`} style={styles.dayCell} />);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const disabled = isDateDisabled(day);
      const selected = isDateSelected(day);
      const today = isToday(day);

      days.push(
        <TouchableOpacity
          key={day}
          style={[
            styles.dayCell,
            selected && styles.selectedDay,
            today && !selected && styles.todayDay,
            disabled && styles.disabledDay,
          ]}
          onPress={() => !disabled && selectDate(day)}
          disabled={disabled}
        >
          <Text
            style={[
              styles.dayText,
              selected && styles.selectedDayText,
              today && !selected && styles.todayDayText,
              disabled && styles.disabledDayText,
            ]}
          >
            {day}
          </Text>
        </TouchableOpacity>
      );
    }

    return days;
  };

  const renderTimePicker = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const minutes = Array.from({ length: 60 }, (_, i) => i);

    return (
      <View style={styles.timePickerContainer}>
        <View style={styles.timePickerColumn}>
          <Text style={styles.timePickerLabel}>Hour</Text>
          <ScrollView style={styles.timePickerScroll} showsVerticalScrollIndicator={false}>
            {hours.map((hour) => (
              <TouchableOpacity
                key={hour}
                style={[
                  styles.timePickerItem,
                  selectedTime.hour === hour && styles.selectedTimeItem,
                ]}
                onPress={() => setSelectedTime({ ...selectedTime, hour })}
              >
                <Text
                  style={[
                    styles.timePickerText,
                    selectedTime.hour === hour && styles.selectedTimeText,
                  ]}
                >
                  {hour.toString().padStart(2, '0')}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        <View style={styles.timePickerColumn}>
          <Text style={styles.timePickerLabel}>Minute</Text>
          <ScrollView style={styles.timePickerScroll} showsVerticalScrollIndicator={false}>
            {minutes.map((minute) => (
              <TouchableOpacity
                key={minute}
                style={[
                  styles.timePickerItem,
                  selectedTime.minute === minute && styles.selectedTimeItem,
                ]}
                onPress={() => setSelectedTime({ ...selectedTime, minute })}
              >
                <Text
                  style={[
                    styles.timePickerText,
                    selectedTime.minute === minute && styles.selectedTimeText,
                  ]}
                >
                  {minute.toString().padStart(2, '0')}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.inputContainer, error && styles.inputError, style]}
        onPress={openDatePicker}
      >
        <Text style={[styles.inputText, !value && styles.placeholderText]}>
          {value ? formatDisplayValue(value) : getPlaceholder()}
        </Text>
        <View style={styles.iconContainer}>
          {value && (
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              style={styles.clearButton}
            >
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.calendarIcon}>{getIcon()}</Text>
        </View>
      </TouchableOpacity>
      {error && <Text style={styles.errorText}>{error}</Text>}
      
      {showPicker && (
        <Modal
          transparent={true}
          animationType="slide"
          visible={showPicker}
          onRequestClose={handleCancel}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={handleCancel}>
                  <Text style={styles.cancelButton}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>{getTitle()}</Text>
                <TouchableOpacity onPress={handleConfirm}>
                  <Text style={styles.doneButton}>Done</Text>
                </TouchableOpacity>
              </View>
              
              {mode === 'time' ? (
                renderTimePicker()
              ) : (
                <View style={styles.calendarContainer}>
                  <View style={styles.calendarHeader}>
                    <TouchableOpacity onPress={() => navigateMonth('prev')}>
                      <Text style={styles.navButton}>‹</Text>
                    </TouchableOpacity>
                    <Text style={styles.monthYear}>
                      {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </Text>
                    <TouchableOpacity onPress={() => navigateMonth('next')}>
                      <Text style={styles.navButton}>›</Text>
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.dayNamesRow}>
                    {dayNames.map((day) => (
                      <Text key={day} style={styles.dayName}>
                        {day}
                      </Text>
                    ))}
                  </View>
                  
                  <View style={styles.calendarGrid}>
                    {renderCalendar()}
                  </View>
                  
                  {mode === 'datetime' && (
                    <View style={styles.timeSection}>
                      <Text style={styles.timeSectionTitle}>Time</Text>
                      {renderTimePicker()}
                    </View>
                  )}
                </View>
              )}
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 12,
    minHeight: 48,
  },
  inputText: {
    fontSize: 16,
    color: '#111827',
    flex: 1,
  },
  placeholderText: {
    color: '#9CA3AF',
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clearButton: {
    marginRight: 8,
    padding: 4,
  },
  clearIcon: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: 'bold',
  },
  calendarIcon: {
    fontSize: 20,
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34,
    maxHeight: '80%',
    minHeight: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    textAlign: 'center',
  },
  cancelButton: {
    fontSize: 16,
    color: '#6B7280',
  },
  doneButton: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '600',
  },
  calendarContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  navButton: {
    fontSize: 24,
    color: '#3B82F6',
    fontWeight: 'bold',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  monthYear: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  dayNamesRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  dayName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'center',
    width: 40,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  dayCell: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 2,
    borderRadius: 20,
  },
  selectedDay: {
    backgroundColor: '#3B82F6',
  },
  todayDay: {
    backgroundColor: '#E5E7EB',
  },
  disabledDay: {
    opacity: 0.3,
  },
  dayText: {
    fontSize: 16,
    color: '#111827',
  },
  selectedDayText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  todayDayText: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  disabledDayText: {
    color: '#9CA3AF',
  },
  timeSection: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 20,
  },
  timeSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 15,
    textAlign: 'center',
  },
  timePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    height: 200,
  },
  timePickerColumn: {
    flex: 1,
    alignItems: 'center',
  },
  timePickerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 10,
  },
  timePickerScroll: {
    flex: 1,
    width: '100%',
  },
  timePickerItem: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginVertical: 2,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectedTimeItem: {
    backgroundColor: '#3B82F6',
  },
  timePickerText: {
    fontSize: 16,
    color: '#111827',
  },
  selectedTimeText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

