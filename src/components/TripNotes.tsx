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
import { useAccessibility } from '../hooks/useAccessibility';
import { useLocalization } from '../contexts/LocalizationContext';
import { designSystem, professionalSpacing, professionalShadows, professionalBorderRadius } from '../theme/designSystem';

interface TripNote {
  id: string;
  title: string;
  content: string;
  timestamp: string;
  category: 'general' | 'tips' | 'memories' | 'recommendations';
}

interface TripNotesProps {
  visible: boolean;
  tripId: string;
  notes: TripNote[];
  onNoteAdd: (note: Omit<TripNote, 'id'>) => void;
  onNoteUpdate: (noteId: string, updates: Partial<TripNote>) => void;
  onNoteDelete: (noteId: string) => void;
  onClose: () => void;
}

export const TripNotes: React.FC<TripNotesProps> = ({
  visible,
  tripId,
  notes,
  onNoteAdd,
  onNoteUpdate,
  onNoteDelete,
  onClose,
}) => {
  const colors = useThemeColors();
  const { getButtonProps, getTextProps, getInputProps } = useAccessibility();
  const { t } = useLocalization();
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', content: '', category: 'general' as const });

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
    noteCard: {
      backgroundColor: colors.surface.primary,
      borderRadius: professionalBorderRadius.lg,
      padding: professionalSpacing[4],
      marginBottom: professionalSpacing[4],
      ...professionalShadows.sm,
    },
    noteHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: professionalSpacing[3],
    },
    noteTitle: {
      ...designSystem.textStyles.h4,
      color: colors.text.primary,
      flex: 1,
      marginRight: professionalSpacing[3],
    },
    noteCategory: {
      ...designSystem.textStyles.caption,
      color: colors.primary.main,
      backgroundColor: colors.primary.main + '20',
      paddingHorizontal: professionalSpacing[2],
      paddingVertical: professionalSpacing[1],
      borderRadius: professionalBorderRadius.sm,
      textTransform: 'uppercase',
    },
    noteContent: {
      ...designSystem.textStyles.body,
      color: colors.text.secondary,
      lineHeight: designSystem.textStyles.body.lineHeight,
      marginBottom: professionalSpacing[3],
    },
    noteTimestamp: {
      ...designSystem.textStyles.caption,
      color: colors.text.tertiary,
      marginBottom: professionalSpacing[3],
    },
    noteActions: {
      flexDirection: 'row',
      gap: professionalSpacing[2],
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
    addNoteForm: {
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
    textArea: {
      height: 100,
      textAlignVertical: 'top',
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

  const handleAddNote = () => {
    if (newNote.title.trim() && newNote.content.trim()) {
      onNoteAdd({
        ...newNote,
        timestamp: new Date().toLocaleDateString(),
      });
      setNewNote({ title: '', content: '', category: 'general' });
      setIsAddingNote(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'tips': return colors.warning.main;
      case 'memories': return colors.accent.main;
      case 'recommendations': return colors.success.main;
      default: return colors.primary.main;
    }
  };

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
            <Text style={styles.headerTitle} {...getTextProps('Trip Notes', 'header')}>
              Trip Notes
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              {...getButtonProps('Close notes')}
            >
              <Ionicons name="close" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {isAddingNote && (
              <View style={styles.addNoteForm}>
                <Text style={styles.formTitle} {...getTextProps('Add New Note', 'header')}>
                  Add New Note
                </Text>
                <TextInput
                  style={styles.input}
                  {...getInputProps('Note title')}
                  placeholder={t('trip.noteTitle')}
                  placeholderTextColor="#000000"
                  value={newNote.title}
                  onChangeText={(text) => setNewNote(prev => ({ ...prev, title: text }))}
                />
                <TextInput
                  style={[styles.input, styles.textArea]}
                  {...getInputProps('Note content')}
                  placeholder={t('trip.noteContent')}
                  placeholderTextColor="#000000"
                  value={newNote.content}
                  onChangeText={(text) => setNewNote(prev => ({ ...prev, content: text }))}
                  multiline
                />
                <View style={styles.formActions}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => {
                      setIsAddingNote(false);
                      setNewNote({ title: '', content: '', category: 'general' });
                    }}
                    {...getButtonProps('Cancel adding note')}
                  >
                    <Text style={styles.cancelButtonText} {...getTextProps('Cancel', 'button')}>
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleAddNote}
                    {...getButtonProps('Save note')}
                  >
                    <Text style={styles.saveButtonText} {...getTextProps('Save Note', 'button')}>
                      Save Note
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {notes.length === 0 && !isAddingNote ? (
              <View style={styles.emptyState}>
                <Ionicons
                  name="document-text-outline"
                  size={64}
                  color={colors.text.tertiary}
                  style={styles.emptyIcon}
                />
                <Text style={styles.emptyTitle} {...getTextProps('No Notes Yet', 'header')}>
                  No Notes Yet
                </Text>
                <Text style={styles.emptyDescription} {...getTextProps('Add notes to remember important details about your trip', 'text')}>
                  Add notes to remember important details about your trip
                </Text>
              </View>
            ) : (
              notes.map((note) => (
                <View key={note.id} style={styles.noteCard}>
                  <View style={styles.noteHeader}>
                    <Text style={styles.noteTitle} {...getTextProps(note.title, 'header')}>
                      {note.title}
                    </Text>
                    <Text
                      style={[
                        styles.noteCategory,
                        { color: getCategoryColor(note.category) },
                      ]}
                      {...getTextProps('Edit note', 'button')}
                    >
                      {note.category}
                    </Text>
                  </View>
                  <Text style={styles.noteContent} {...getTextProps(note.content, 'text')}>
                    {note.content}
                  </Text>
                  <Text style={styles.noteTimestamp} {...getTextProps(note.timestamp, 'text')}>
                    {note.timestamp}
                  </Text>
                  <View style={styles.noteActions}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => onNoteUpdate(note.id, { title: 'Updated title' })}
                      {...getButtonProps('Edit note')}
                    >
                      <Text style={styles.actionButtonText} {...getTextProps('Edit', 'button')}>
                        Edit
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => onNoteDelete(note.id)}
                      {...getButtonProps('Delete note')}
                    >
                      <Text style={styles.actionButtonText} {...getTextProps('Delete', 'button')}>
                        Delete
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}

            {!isAddingNote && (
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => setIsAddingNote(true)}
                {...getButtonProps('Add new note')}
              >
                <Ionicons name="add" size={20} color={colors.primary.contrastText} />
                <Text style={styles.addButtonText} {...getTextProps('Add Note', 'button')}>
                  Add Note
                </Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};