import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColors } from '../hooks/useThemeColors';
import { useAccessibility } from '../hooks/useAccessibility';
import { useLocalization } from '../contexts/LocalizationContext';
import { designSystem, professionalSpacing, professionalShadows, professionalBorderRadius } from '../theme/designSystem';
import { formatDateRange } from '../utils/dateFormatting';

const { width: screenWidth } = Dimensions.get('window');
const cardWidth = screenWidth - professionalSpacing[4];

interface TripCardProps {
  trip: any;
  isCompactMode?: boolean;
  onPress: () => void;
  onWeatherPress: () => void;
  onExpensePress: () => void;
  onPackingPress: () => void;
  onSocialPress: () => void;
  onEditPress: () => void;
  onDeletePress: () => void;
  onAddActivityPress: () => void;
  onTimelinePress: () => void;
  onPhotosPress: () => void;
  onNotesPress: () => void;
  onChecklistPress: () => void;
  onMapPress: () => void;
  onAnalyticsPress: () => void;
  totalSpend?: number;
  overCapCount?: number;
  formatAmount: (amount: number) => string;
}

export const TripCard: React.FC<TripCardProps> = ({
  trip,
  isCompactMode = false,
  onPress,
  onWeatherPress,
  onExpensePress,
  onPackingPress,
  onSocialPress,
  onEditPress,
  onDeletePress,
  onAddActivityPress,
  onTimelinePress,
  onPhotosPress,
  onNotesPress,
  onChecklistPress,
  onMapPress,
  onAnalyticsPress,
  totalSpend,
  overCapCount,
  formatAmount,
}) => {
  const colors = useThemeColors();
  const { getButtonProps, getTextProps } = useAccessibility();
  const { t } = useLocalization();
  
  // Animation refs
  const cardScale = useRef(new Animated.Value(1)).current;
  const deleteButtonScale = useRef(new Animated.Value(1)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  
  // Colors are now guaranteed to be properly structured by useThemeColors hook
  
  const styles = createStyles(colors, isCompactMode);

  // Animation functions
  const animatePress = (scaleValue: Animated.Value, callback?: () => void) => {
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (callback) callback();
    });
  };

  const animateDeletePress = () => {
    Animated.sequence([
      Animated.timing(deleteButtonScale, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(deleteButtonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDeletePress();
    });
  };

  const getGroupTypeIcon = (groupType: string) => {
    switch (groupType.toLowerCase()) {
      case 'solo': return '👤';
      case 'couple': return '💑';
      case 'family': return '👨‍👩‍👧‍👦';
      case 'friends': return '👫';
      case 'group': return '👥';
      default: return '👥';
    }
  };

  const getStatusColor = () => {
    const today = new Date();
    const checkIn = new Date(trip.checkIn);
    const checkOut = new Date(trip.checkOut);
    
    if (today < checkIn) return colors.status.info; // Upcoming
    if (today >= checkIn && today <= checkOut) return colors.status.success; // Current
    return colors.grey[500]; // Past
  };

  const getStatusText = () => {
    const today = new Date();
    const checkIn = new Date(trip.checkIn);
    const checkOut = new Date(trip.checkOut);
    
    if (today < checkIn) return t('trip.status.upcoming');
    if (today >= checkIn && today <= checkOut) return t('trip.status.current');
    return t('trip.status.completed');
  };

  return (
    <Animated.View style={{ transform: [{ scale: cardScale }] }}>
      <TouchableOpacity
        style={[styles.card, isCompactMode && styles.cardCompact]}
        onPress={() => animatePress(cardScale, onPress)}
        activeOpacity={0.95}
        {...getButtonProps(
          `Trip to ${trip.destination}, ${formatDateRange(trip.checkIn, trip.checkOut)}`,
          'Double tap to view trip details and manage activities'
        )}
      >
      {/* Card Header with Gradient */}
      <LinearGradient
        colors={[colors.primary.main, colors.primary.dark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardHeader}
      >
        <View style={styles.headerContent}>
          <View style={styles.destinationContainer}>
            <Text
              style={[styles.destination, isCompactMode && styles.destinationCompact]}
              {...getTextProps(trip.destination, 'header')}
            >
              {trip.destination}
            </Text>
            <Text
              style={[styles.dateRange, isCompactMode && styles.dateRangeCompact]}
              {...getTextProps(formatDateRange(trip.checkIn, trip.checkOut))}
            >
              {formatDateRange(trip.checkIn, trip.checkOut)}
            </Text>
          </View>
          
          {/* Status Badge and Delete Button */}
          <View style={styles.statusContainer}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
              <Text style={styles.statusText}>
                {getStatusText()}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.deleteButton, { backgroundColor: colors.error.light }]}
              onPress={onDeletePress}
              {...getButtonProps(
                `Delete trip to ${trip.destination}`,
                'Double tap to delete this trip'
              )}
            >
              <Ionicons name="trash-outline" size={12} color={colors.error.main} />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* Card Body */}
      <View style={[styles.cardBody, isCompactMode && styles.cardBodyCompact]}>
        {/* Trip Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <View style={styles.statIconContainer}>
              <Ionicons name="cash-outline" size={18} color={colors.primary.main} />
            </View>
            <View style={styles.statContent}>
              <Text style={[styles.statLabel, { color: colors.text.secondary }]}>
                {t('trip.budget')}
              </Text>
              <Text style={[styles.statValue, { color: colors.text.primary }]}>
                {formatAmount(trip.budget)}/day
              </Text>
            </View>
          </View>
          
          {totalSpend !== undefined && (
            <View style={styles.statItem}>
              <View style={styles.statIconContainer}>
                <Ionicons name="receipt-outline" size={18} color={colors.success.main} />
              </View>
              <View style={styles.statContent}>
                <Text style={[styles.statLabel, { color: colors.text.secondary }]}>
                  {t('trip.spent')}
                </Text>
                <Text style={[styles.statValue, { color: colors.text.primary }]}>
                  {formatAmount(Math.round(totalSpend))}
                </Text>
              </View>
            </View>
          )}
          
          <View style={styles.statItem}>
            <View style={styles.statIconContainer}>
              <Ionicons name="speedometer-outline" size={18} color={colors.warning.main} />
            </View>
            <View style={styles.statContent}>
              <Text style={[styles.statLabel, { color: colors.text.secondary }]}>
                {t('trip.activity')}
              </Text>
              <Text style={[styles.statValue, { color: colors.text.primary }]}>
                {trip.activityLevel}%
              </Text>
            </View>
          </View>
        </View>

        {/* Group Type & Budget Info */}
        <View style={styles.infoRow}>
          <View style={styles.groupInfo}>
            <Text style={styles.groupIcon}>
              {getGroupTypeIcon(trip.groupType)}
            </Text>
            <Text style={[styles.groupText, { color: colors.text.secondary }]}>
              {t(`trip.groupType.${trip.groupType.toLowerCase()}`)}
            </Text>
          </View>
          
          {overCapCount && Number(overCapCount) > 0 ? (
            <View style={styles.overCapWarning}>
              <Ionicons name="warning-outline" size={16} color={colors.error.main} />
              <Text style={[styles.overCapText, { color: colors.error.main }]}>
                {`${overCapCount || 0} over-cap day${(overCapCount || 0) > 1 ? 's' : ''}`}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Primary Action Buttons */}
        <View style={styles.primaryActions}>
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: colors.primary.main }]}
            onPress={onWeatherPress}
            {...getButtonProps(
              `Weather for ${trip.destination}`,
              'Double tap to view weather information'
            )}
          >
            <Ionicons name="partly-sunny-outline" size={20} color={colors.surface.primary} />
            <Text style={[styles.primaryButtonText, { color: colors.surface.primary }]}>
              {t('trip.weather')}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: colors.success.main }]}
            onPress={onExpensePress}
            {...getButtonProps(
              `Expenses for ${trip.destination}`,
              'Double tap to manage trip expenses'
            )}
          >
            <Ionicons name="card-outline" size={20} color={colors.surface.primary} />
            <Text style={[styles.primaryButtonText, { color: colors.surface.primary }]}>
              {t('trip.expenses')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Secondary Actions */}
        <View style={styles.secondaryActions}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={onPackingPress}
            {...getButtonProps(
              `Packing list for ${trip.destination}`,
              'Double tap to manage packing list'
            )}
          >
            <Ionicons name="bag-outline" size={18} color={colors.text.secondary} />
            <Text style={[styles.secondaryButtonText, { color: colors.text.secondary }]}>
              {t('trip.packing')}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={onSocialPress}
            {...getButtonProps(
              `Share trip to ${trip.destination}`,
              'Double tap to share trip with others'
            )}
          >
            <Ionicons name="share-outline" size={18} color={colors.text.secondary} />
            <Text style={[styles.secondaryButtonText, { color: colors.text.secondary }]}>
              {t('trip.share')}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={onEditPress}
            {...getButtonProps(
              `Edit trip to ${trip.destination}`,
              'Double tap to edit trip details'
            )}
          >
            <Ionicons name="create-outline" size={18} color={colors.text.secondary} />
            <Text style={[styles.secondaryButtonText, { color: colors.text.secondary }]}>
              {t('trip.edit')}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={onPhotosPress}
            {...getButtonProps(
              `Photos for ${trip.destination}`,
              'Double tap to view trip photos'
            )}
          >
            <Ionicons name="camera-outline" size={18} color={colors.text.secondary} />
            <Text style={[styles.secondaryButtonText, { color: colors.text.secondary }]}>
              {t('trip.photos')}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={onAddActivityPress}
            {...getButtonProps(
              `Activities for ${trip.destination}`,
              'Double tap to manage activities'
            )}
          >
            <Ionicons name="calendar-outline" size={18} color={colors.text.secondary} />
            <Text style={[styles.secondaryButtonText, { color: colors.text.secondary }]}>
              {t('trip.activities')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
    </Animated.View>
  );
};

const createStyles = (colors: any, isCompactMode: boolean) => StyleSheet.create({
  card: {
    width: cardWidth,
    backgroundColor: colors.surface.primary,
    borderRadius: professionalBorderRadius.xl,
    marginBottom: professionalSpacing[4],
    ...professionalShadows.lg,
    overflow: 'hidden',
  },
  cardCompact: {
    marginBottom: professionalSpacing[3],
  },
  cardHeader: {
    padding: professionalSpacing[4],
    paddingBottom: professionalSpacing[3],
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  destinationContainer: {
    flex: 1,
  },
  destination: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.surface.primary,
    marginBottom: professionalSpacing[1],
  },
  destinationCompact: {
    fontSize: 20,
  },
  dateRange: {
    fontSize: 16,
    color: colors.surface.primary,
    opacity: 0.9,
  },
  dateRangeCompact: {
    fontSize: 14,
  },
  statusContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: professionalSpacing[1],
  },
  statusBadge: {
    paddingHorizontal: professionalSpacing[2],
    paddingVertical: professionalSpacing[1],
    borderRadius: professionalBorderRadius.full,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.surface.primary,
  },
  deleteButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardBody: {
    padding: professionalSpacing[4],
  },
  cardBodyCompact: {
    padding: professionalSpacing[3],
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: professionalSpacing[4],
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: professionalBorderRadius.full,
    backgroundColor: colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: professionalSpacing[2],
  },
  statContent: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: professionalSpacing[1],
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: professionalSpacing[4],
    paddingVertical: professionalSpacing[2],
    paddingHorizontal: professionalSpacing[3],
    backgroundColor: colors.background.secondary,
    borderRadius: professionalBorderRadius.lg,
  },
  groupInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  groupIcon: {
    fontSize: 16,
    marginRight: professionalSpacing[2],
  },
  groupText: {
    fontSize: 14,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  overCapWarning: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  overCapText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: professionalSpacing[1],
  },
  primaryActions: {
    flexDirection: 'row',
    gap: professionalSpacing[3],
    marginBottom: professionalSpacing[3],
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: professionalSpacing[3],
    paddingHorizontal: professionalSpacing[4],
    borderRadius: professionalBorderRadius.lg,
    gap: professionalSpacing[2],
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: professionalSpacing[2],
    paddingTop: professionalSpacing[2],
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: professionalSpacing[1],
    paddingHorizontal: professionalSpacing[2],
    borderRadius: professionalBorderRadius.sm,
    gap: professionalSpacing[1],
    flexGrow: 1,
    flexBasis: '48%',
    minWidth: 120,
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
});