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
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Trip } from '../services/database';
import {
  shareMethods,
  shareTrip,
  generateTripShareData,
  inviteCollaborator,
  getTripCollaborators,
  addTripComment,
  getTripComments,
  likeTrip,
  getTripLikes,
  exportTripAsPDF,
  TripCollaborator,
  TripComment,
} from '../services/socialService';

interface SocialSharingProps {
  trip: Trip;
  visible: boolean;
  onClose: () => void;
}

export const SocialSharing: React.FC<SocialSharingProps> = ({
  trip,
  visible,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'share' | 'collaborate' | 'comments'>('share');
  const [loading, setLoading] = useState(false);
  const [shareData, setShareData] = useState<any>(null);
  const [collaborators, setCollaborators] = useState<TripCollaborator[]>([]);
  const [comments, setComments] = useState<TripComment[]>([]);
  const [likes, setLikes] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePermission, setInvitePermission] = useState<'view' | 'edit' | 'admin'>('view');

  useEffect(() => {
    if (visible && trip) {
      loadShareData();
      loadCollaborators();
      loadComments();
      loadLikes();
    }
  }, [visible, trip]);

  const loadShareData = async () => {
    try {
      const data = await generateTripShareData(trip);
      setShareData(data);
    } catch (error) {
      console.error('Error loading share data:', error);
    }
  };

  const loadCollaborators = async () => {
    try {
      const collabs = await getTripCollaborators(trip.id);
      setCollaborators(collabs);
    } catch (error) {
      console.error('Error loading collaborators:', error);
    }
  };

  const loadComments = async () => {
    try {
      const comms = await getTripComments(trip.id);
      setComments(comms);
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const loadLikes = async () => {
    try {
      const likeCount = await getTripLikes(trip.id);
      setLikes(likeCount);
    } catch (error) {
      console.error('Error loading likes:', error);
    }
  };

  const handleShare = async (method: string) => {
    setLoading(true);
    try {
      if (method === 'social') {
        await Share.share({
          message: shareData?.shareableText || '',
          url: shareData?.shareableUrl || '',
        });
      } else {
        await shareTrip(trip.id, method, [], 'Check out this amazing trip!');
        Alert.alert('Success', 'Trip shared successfully!');
      }
    } catch (error) {
      console.error('Error sharing trip:', error);
      Alert.alert('Error', 'Failed to share trip');
    } finally {
      setLoading(false);
    }
  };

  const handleInviteCollaborator = async () => {
    if (!inviteEmail.trim()) {
      Alert.alert('Error', 'Please enter an email address');
      return;
    }

    setLoading(true);
    try {
      await inviteCollaborator(trip.id, inviteEmail.trim(), invitePermission);
      Alert.alert('Success', 'Invitation sent successfully!');
      setInviteEmail('');
      loadCollaborators();
    } catch (error) {
      console.error('Error inviting collaborator:', error);
      Alert.alert('Error', 'Failed to send invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      Alert.alert('Error', 'Please enter a comment');
      return;
    }

    setLoading(true);
    try {
      await addTripComment(trip.id, 'current-user', 'You', newComment.trim());
      setNewComment('');
      loadComments();
      Alert.alert('Success', 'Comment added successfully!');
    } catch (error) {
      console.error('Error adding comment:', error);
      Alert.alert('Error', 'Failed to add comment');
    } finally {
      setLoading(false);
    }
  };

  const handleLikeTrip = async () => {
    try {
      await likeTrip(trip.id, 'current-user');
      setLikes(prev => prev + 1);
    } catch (error) {
      console.error('Error liking trip:', error);
    }
  };

  const handleExportPDF = async () => {
    setLoading(true);
    try {
      await exportTripAsPDF(trip.id);
      Alert.alert('Success', 'Trip exported successfully!');
    } catch (error) {
      console.error('Error exporting trip:', error);
      Alert.alert('Error', 'Failed to export trip');
    } finally {
      setLoading(false);
    }
  };

  const getPermissionIcon = (permission: string) => {
    switch (permission) {
      case 'admin': return '👑';
      case 'edit': return '✏️';
      case 'view': return '👁️';
      default: return '👁️';
    }
  };

  const getPermissionColor = (permission: string) => {
    switch (permission) {
      case 'admin': return '#EF4444';
      case 'edit': return '#F59E0B';
      case 'view': return '#6B7280';
      default: return '#6B7280';
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#6B7280" />
          </TouchableOpacity>
          <Text style={styles.title}>🤝 Share Trip</Text>
          <TouchableOpacity onPress={handleLikeTrip} style={styles.likeButton}>
            <Ionicons name="heart" size={24} color="#EF4444" />
            <Text style={styles.likeCount}>{likes}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'share' && styles.activeTab]}
            onPress={() => setActiveTab('share')}
          >
            <Text style={[styles.tabText, activeTab === 'share' && styles.activeTabText]}>
              📤 Share
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'collaborate' && styles.activeTab]}
            onPress={() => setActiveTab('collaborate')}
          >
            <Text style={[styles.tabText, activeTab === 'collaborate' && styles.activeTabText]}>
              👥 Collaborate
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'comments' && styles.activeTab]}
            onPress={() => setActiveTab('comments')}
          >
            <Text style={[styles.tabText, activeTab === 'comments' && styles.activeTabText]}>
              💬 Comments
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {activeTab === 'share' && (
            <View style={styles.shareTab}>
              <View style={styles.tripPreview}>
                <Text style={styles.tripTitle}>{trip.destination}</Text>
                <Text style={styles.tripDates}>
                  {new Date(trip.checkIn).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} - 
                  {new Date(trip.checkOut).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                </Text>
                <Text style={styles.tripDescription}>
                  {shareData?.description || 'Check out this amazing trip!'}
                </Text>
              </View>

              <View style={styles.shareMethods}>
                <Text style={styles.sectionTitle}>Share Methods</Text>
                {shareMethods.map(method => (
                  <TouchableOpacity
                    key={method.id}
                    style={styles.shareMethod}
                    onPress={() => handleShare(method.id)}
                    disabled={loading}
                  >
                    <Text style={styles.methodIcon}>{method.icon}</Text>
                    <View style={styles.methodInfo}>
                      <Text style={styles.methodName}>{method.name}</Text>
                      <Text style={styles.methodDescription}>{method.description}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#6B7280" />
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={styles.exportButton}
                onPress={handleExportPDF}
                disabled={loading}
              >
                <Ionicons name="document-text" size={24} color="#FFFFFF" />
                <Text style={styles.exportButtonText}>Export as PDF</Text>
              </TouchableOpacity>
            </View>
          )}

          {activeTab === 'collaborate' && (
            <View style={styles.collaborateTab}>
              <View style={styles.inviteSection}>
                <Text style={styles.sectionTitle}>Invite Collaborators</Text>
                <View style={styles.inviteForm}>
                  <TextInput
                    style={styles.emailInput}
                    placeholder="Enter email address"
                    value={inviteEmail}
                    onChangeText={setInviteEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                  <View style={styles.permissionSelector}>
                    <Text style={styles.selectorLabel}>Permission:</Text>
                    <View style={styles.permissionOptions}>
                      {(['view', 'edit', 'admin'] as const).map(permission => (
                        <TouchableOpacity
                          key={permission}
                          style={[
                            styles.permissionOption,
                            invitePermission === permission && styles.permissionOptionActive,
                          ]}
                          onPress={() => setInvitePermission(permission)}
                        >
                          <Text style={[
                            styles.permissionOptionText,
                            invitePermission === permission && styles.permissionOptionTextActive,
                          ]}>
                            {getPermissionIcon(permission)} {permission.charAt(0).toUpperCase() + permission.slice(1)}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.inviteButton}
                    onPress={handleInviteCollaborator}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.inviteButtonText}>Send Invitation</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.collaboratorsSection}>
                <Text style={styles.sectionTitle}>Current Collaborators</Text>
                {collaborators.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>No collaborators yet</Text>
                    <Text style={styles.emptySubtext}>Invite friends to collaborate on this trip</Text>
                  </View>
                ) : (
                  collaborators.map(collaborator => (
                    <View key={collaborator.id} style={styles.collaboratorItem}>
                      <View style={styles.collaboratorAvatar}>
                        <Text style={styles.avatarText}>
                          {collaborator.name.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <View style={styles.collaboratorInfo}>
                        <Text style={styles.collaboratorName}>{collaborator.name}</Text>
                        <Text style={styles.collaboratorEmail}>{collaborator.email}</Text>
                      </View>
                      <View style={[
                        styles.permissionBadge,
                        { backgroundColor: getPermissionColor(collaborator.permission) + '20' }
                      ]}>
                        <Text style={[
                          styles.permissionBadgeText,
                          { color: getPermissionColor(collaborator.permission) }
                        ]}>
                          {getPermissionIcon(collaborator.permission)} {collaborator.permission}
                        </Text>
                      </View>
                    </View>
                  ))
                )}
              </View>
            </View>
          )}

          {activeTab === 'comments' && (
            <View style={styles.commentsTab}>
              <View style={styles.addCommentSection}>
                <Text style={styles.sectionTitle}>Add Comment</Text>
                <TextInput
                  style={styles.commentInput}
                  placeholder="Share your thoughts about this trip..."
                  value={newComment}
                  onChangeText={setNewComment}
                  multiline={true}
                  maxLength={500}
                />
                <TouchableOpacity
                  style={styles.addCommentButton}
                  onPress={handleAddComment}
                  disabled={loading || !newComment.trim()}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.addCommentButtonText}>Add Comment</Text>
                  )}
                </TouchableOpacity>
              </View>

              <View style={styles.commentsSection}>
                <Text style={styles.sectionTitle}>Comments ({comments.length})</Text>
                {comments.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>No comments yet</Text>
                    <Text style={styles.emptySubtext}>Be the first to comment on this trip</Text>
                  </View>
                ) : (
                  comments.map(comment => (
                    <View key={comment.id} style={styles.commentItem}>
                      <View style={styles.commentAvatar}>
                        <Text style={styles.avatarText}>
                          {comment.userName.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <View style={styles.commentContent}>
                        <View style={styles.commentHeader}>
                          <Text style={styles.commentAuthor}>{comment.userName}</Text>
                          <Text style={styles.commentDate}>
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </Text>
                        </View>
                        <Text style={styles.commentText}>{comment.comment}</Text>
                        {comment.day && (
                          <Text style={styles.commentDay}>Day {comment.day}</Text>
                        )}
                      </View>
                    </View>
                  ))
                )}
              </View>
            </View>
          )}
        </ScrollView>
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
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  likeCount: {
    marginLeft: 4,
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#4285F4',
  },
  tabText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#4285F4',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  shareTab: {
    gap: 20,
  },
  tripPreview: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tripTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  tripDates: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 12,
  },
  tripDescription: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  shareMethods: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
    padding: 16,
    paddingBottom: 0,
  },
  shareMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  methodIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  methodInfo: {
    flex: 1,
  },
  methodName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  methodDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4285F4',
    paddingVertical: 16,
    borderRadius: 12,
  },
  exportButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  collaborateTab: {
    gap: 20,
  },
  inviteSection: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inviteForm: {
    gap: 16,
  },
  emailInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  permissionSelector: {
    gap: 8,
  },
  selectorLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  permissionOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  permissionOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  permissionOptionActive: {
    backgroundColor: '#4285F4',
  },
  permissionOptionText: {
    fontSize: 14,
    color: '#6B7280',
  },
  permissionOptionTextActive: {
    color: '#FFFFFF',
  },
  inviteButton: {
    backgroundColor: '#4285F4',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  inviteButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  collaboratorsSection: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  collaboratorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  collaboratorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4285F4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  collaboratorInfo: {
    flex: 1,
  },
  collaboratorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  collaboratorEmail: {
    fontSize: 14,
    color: '#6B7280',
  },
  permissionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  permissionBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  commentsTab: {
    gap: 20,
  },
  addCommentSection: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  addCommentButton: {
    backgroundColor: '#4285F4',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addCommentButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  commentsSection: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  commentItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#6B7280',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  commentDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  commentText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 4,
  },
  commentDay: {
    fontSize: 12,
    color: '#4285F4',
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
  },
});
