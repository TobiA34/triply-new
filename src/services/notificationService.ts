import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface NotificationData {
  tripId: string;
  tripDestination: string;
  type: 'departure' | 'checkin' | 'checkout' | 'booking' | 'daily';
  scheduledTime: Date;
  message: string;
}

class NotificationService {
  private isInitialized = false;

  async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;

    try {
      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('Notification permissions not granted');
        return false;
      }

      // Configure notification channel for Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('trip-reminders', {
          name: 'Trip Reminders',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#4285F4',
        });
      }

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
      return false;
    }
  }

  async scheduleTripReminder(data: NotificationData): Promise<string | null> {
    try {
      if (!this.isInitialized) {
        const initialized = await this.initialize();
        if (!initialized) return null;
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Trip Reminder',
          body: data.message,
          data: {
            tripId: data.tripId,
            type: data.type,
            destination: data.tripDestination,
          },
          sound: 'default',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: data.scheduledTime,
        },
      });

      return notificationId;
    } catch (error) {
      console.error('Failed to schedule notification:', error);
      return null;
    }
  }

  async scheduleDepartureReminder(tripId: string, destination: string, departureTime: Date): Promise<string | null> {
    const timeBeforeDeparture = new Date(departureTime.getTime() - 2 * 60 * 60 * 1000); // 2 hours before
    
    return this.scheduleTripReminder({
      tripId,
      tripDestination: destination,
      type: 'departure',
      scheduledTime: timeBeforeDeparture,
      message: `Don't forget! Your trip to ${destination} starts in 2 hours. Time to pack and head out!`,
    });
  }

  async scheduleCheckInReminder(tripId: string, destination: string, checkInDate: Date): Promise<string | null> {
    const reminderTime = new Date(checkInDate.getTime() - 24 * 60 * 60 * 1000); // 1 day before
    
    return this.scheduleTripReminder({
      tripId,
      tripDestination: destination,
      type: 'checkin',
      scheduledTime: reminderTime,
      message: `Your trip to ${destination} starts tomorrow! Make sure you're all packed and ready.`,
    });
  }

  async scheduleCheckOutReminder(tripId: string, destination: string, checkOutDate: Date): Promise<string | null> {
    const reminderTime = new Date(checkOutDate.getTime() - 2 * 60 * 60 * 1000); // 2 hours before
    
    return this.scheduleTripReminder({
      tripId,
      tripDestination: destination,
      type: 'checkout',
      scheduledTime: reminderTime,
      message: `Check-out time approaching! Your stay in ${destination} ends in 2 hours.`,
    });
  }

  async scheduleBookingReminder(tripId: string, destination: string, bookingTime: Date, bookingType: string): Promise<string | null> {
    return this.scheduleTripReminder({
      tripId,
      tripDestination: destination,
      type: 'booking',
      scheduledTime: bookingTime,
      message: `Reminder: ${bookingType} booking for ${destination} needs confirmation.`,
    });
  }

  async scheduleDailyReminder(tripId: string, destination: string, time: Date, message: string): Promise<string | null> {
    return this.scheduleTripReminder({
      tripId,
      tripDestination: destination,
      type: 'daily',
      scheduledTime: time,
      message,
    });
  }

  async cancelNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.error('Failed to cancel notification:', error);
    }
  }

  async cancelAllTripNotifications(tripId: string): Promise<void> {
    try {
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      const tripNotifications = scheduledNotifications.filter(
        notification => notification.content.data?.tripId === tripId
      );

      for (const notification of tripNotifications) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
    } catch (error) {
      console.error('Failed to cancel trip notifications:', error);
    }
  }

  async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Failed to get scheduled notifications:', error);
      return [];
    }
  }

  async clearAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Failed to clear all notifications:', error);
    }
  }
}

export const notificationService = new NotificationService();


