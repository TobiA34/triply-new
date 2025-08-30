import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Animated,
} from 'react-native';

interface GroupOption {
  id: string;
  label: string;
  icon: string;
}

const GROUP_OPTIONS: GroupOption[] = [
  { id: 'solo', label: 'Solo', icon: '🚶' },
  { id: 'couple', label: 'Couple', icon: '👫' },
  { id: 'group', label: 'Group', icon: '👥' },
];

interface GroupTypeSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export const GroupTypeSelector: React.FC<GroupTypeSelectorProps> = ({
  value,
  onChange,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const selectedOption = GROUP_OPTIONS.find(option => option.id === value) || GROUP_OPTIONS[0];

  return (
    <>
      <TouchableOpacity
        style={styles.selector}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <Text style={styles.selectorText}>
          {selectedOption.icon} {selectedOption.label}
        </Text>
        <Text style={styles.chevron}>▼</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            {GROUP_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.option,
                  option.id === value && styles.optionSelected,
                ]}
                onPress={() => {
                  onChange(option.id);
                  setModalVisible(false);
                }}
              >
                <Text style={[
                  styles.optionText,
                  option.id === value && styles.optionTextSelected,
                ]}>
                  {option.icon} {option.label}
                </Text>
                {option.id === value && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#FFF',
    width: '100%',
  },
  selectorText: {
    fontSize: 16,
    color: '#333',
  },
  chevron: {
    fontSize: 12,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    width: '85%',
    padding: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 8,
  },
  optionSelected: {
    backgroundColor: '#4285F4',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  optionTextSelected: {
    color: '#FFF',
    fontWeight: '500',
  },
  checkmark: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
