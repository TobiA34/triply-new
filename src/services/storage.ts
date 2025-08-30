import AsyncStorage from '@react-native-async-storage/async-storage';
import { TripFormData } from '../utils/validation';

const STORAGE_KEYS = {
  TRIP_DATA: 'triply_trip_data',
  SAVED_TRIPS: 'triply_saved_trips',
};

export const saveTrip = async (tripData: TripFormData): Promise<void> => {
  try {
    // Save current trip data
    await AsyncStorage.setItem(STORAGE_KEYS.TRIP_DATA, JSON.stringify(tripData));

    // Add to saved trips list
    const savedTripsString = await AsyncStorage.getItem(STORAGE_KEYS.SAVED_TRIPS);
    const savedTrips = savedTripsString ? JSON.parse(savedTripsString) : [];
    
    savedTrips.push({
      ...tripData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    });

    await AsyncStorage.setItem(STORAGE_KEYS.SAVED_TRIPS, JSON.stringify(savedTrips));
  } catch (error) {
    console.error('Error saving trip:', error);
    throw new Error('Failed to save trip data');
  }
};

export const loadLastTrip = async (): Promise<TripFormData | null> => {
  try {
    const tripDataString = await AsyncStorage.getItem(STORAGE_KEYS.TRIP_DATA);
    return tripDataString ? JSON.parse(tripDataString) : null;
  } catch (error) {
    console.error('Error loading trip:', error);
    return null;
  }
};

export const getSavedTrips = async () => {
  try {
    const savedTripsString = await AsyncStorage.getItem(STORAGE_KEYS.SAVED_TRIPS);
    return savedTripsString ? JSON.parse(savedTripsString) : [];
  } catch (error) {
    console.error('Error getting saved trips:', error);
    return [];
  }
};
