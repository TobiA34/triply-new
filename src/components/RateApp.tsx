import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../hooks/useThemeColors';
import { useLocalization } from '../contexts/LocalizationContext';

interface RateAppProps {
  visible: boolean;
  onClose: () => void;
}

export const RateApp: React.FC<RateAppProps> = ({ visible, onClose }) => {
  const colors = useThemeColors();
  const { t } = useLocalization();
  const [rating, setRating] = useState(0);
  const [hasRated, setHasRated] = useState(false);

  const styles = useMemo(() => createStyles(colors), [colors]);

  const handleStarPress = (starRating: number) => {
    setRating(starRating);
  };

  const handleRateNow = async () => {
    if (rating < 4) {
      // Low rating - show feedback form
      Alert.alert(
        'We\'re Sorry to Hear That',
        'We\'d love to hear your feedback to help us improve. Would you like to share your thoughts?',
        [
          { text: 'Maybe Later', onPress: onClose },
          { 
            text: 'Give Feedback', 
            onPress: () => {
              // In a real app, this would open a feedback form
              Alert.alert('Feedback', 'Thank you for your feedback! We\'ll use it to improve the app.');
              onClose();
            }
          }
        ]
      );
    } else {
      // High rating - direct to app store
      try {
        await Linking.openURL('https://apps.apple.com/app/triply');
        setHasRated(true);
      } catch (error) {
        Alert.alert('Error', 'Could not open App Store');
      }
    }
  };

  const handleMaybeLater = () => {
    Alert.alert(
      'No Problem!',
      'You can rate us anytime in the future. We hope you continue to enjoy using Triply!',
      [{ text: 'OK', onPress: onClose }]
    );
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, index) => {
      const starNumber = index + 1;
      const isFilled = starNumber <= rating;
      
      return (
        <TouchableOpacity
          key={index}
          onPress={() => handleStarPress(starNumber)}
          style={styles.starButton}
        >
          <Ionicons
            name={isFilled ? "star" : "star-outline"}
            size={40}
            color={isFilled ? colors.warning.main : colors.text.secondary}
          />
        </TouchableOpacity>
      );
    });
  };

  const getRatingMessage = () => {
    if (rating === 0) return "How would you rate Triply?";
    if (rating <= 2) return "We're sorry to hear that. How can we improve?";
    if (rating === 3) return "Thanks for the feedback! We're working to make it better.";
    if (rating === 4) return "Great! We're glad you're enjoying Triply!";
    if (rating === 5) return "Amazing! You love Triply! 🎉";
    return "";
  };

  const getRatingColor = () => {
    if (rating <= 2) return colors.error.main;
    if (rating === 3) return colors.warning.main;
    if (rating >= 4) return colors.success.main;
    return colors.text.primary;
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.surface.primary }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text.primary }]}>
              {t('settings.rateApp')}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <Ionicons name="heart" size={48} color={colors.primary.main} />
            </View>

            <Text style={[styles.message, { color: getRatingColor() }]}>
              {getRatingMessage()}
            </Text>

            <View style={styles.starsContainer}>
              {renderStars()}
            </View>

            {rating > 0 && (
              <View style={styles.ratingTextContainer}>
                <Text style={[styles.ratingText, { color: colors.text.secondary }]}>
                  {rating} out of 5 stars
                </Text>
              </View>
            )}

            {hasRated ? (
              <View style={styles.thankYouContainer}>
                <Ionicons name="checkmark-circle" size={48} color={colors.success.main} />
                <Text style={[styles.thankYouText, { color: colors.text.primary }]}>
                  Thank you for rating Triply!
                </Text>
                <Text style={[styles.thankYouSubtext, { color: colors.text.secondary }]}>
                  Your feedback helps us improve the app for everyone.
                </Text>
              </View>
            ) : (
              <View style={styles.buttonContainer}>
                {rating > 0 && (
                  <TouchableOpacity
                    style={[styles.rateButton, { backgroundColor: colors.primary.main }]}
                    onPress={handleRateNow}
                  >
                    <Text style={[styles.rateButtonText, { color: colors.surface.primary }]}>
                      {rating >= 4 ? 'Rate on App Store' : 'Give Feedback'}
                    </Text>
                  </TouchableOpacity>
                )}
                
                <TouchableOpacity
                  style={[styles.laterButton, { backgroundColor: colors.surface.secondary }]}
                  onPress={handleMaybeLater}
                >
                  <Text style={[styles.laterButtonText, { color: colors.text.secondary }]}>
                    Maybe Later
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.text.tertiary }]}>
              Your rating helps other travelers discover Triply
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    padding: 8,
  },
  content: {
    padding: 24,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 16,
  },
  message: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 24,
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  starButton: {
    padding: 8,
  },
  ratingTextContainer: {
    marginBottom: 24,
  },
  ratingText: {
    fontSize: 16,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  rateButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  rateButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  laterButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  laterButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  thankYouContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  thankYouText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  thankYouSubtext: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
});
