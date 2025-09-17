import AsyncStorage from '@react-native-async-storage/async-storage';
import { TravelMode, TravelSettings } from './travelTime';

const KEY = 'triply_travel_settings_v1';
const TRIP_KEY = (tripId: string) => `triply_travel_settings_v1_trip_${tripId}`;

export interface StoredTravelSettings {
  mode: TravelMode;
  settings: TravelSettings;
}

const DEFAULTS: StoredTravelSettings = {
  mode: 'walk',
  settings: { walkingSpeedKmh: 4.5, defaultBufferMin: 5 },
};

export const loadTravelSettings = async (): Promise<StoredTravelSettings> => {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw);
    return {
      mode: (parsed.mode as TravelMode) || DEFAULTS.mode,
      settings: {
        walkingSpeedKmh: Number(parsed.settings?.walkingSpeedKmh ?? DEFAULTS.settings.walkingSpeedKmh),
        defaultBufferMin: Number(parsed.settings?.defaultBufferMin ?? DEFAULTS.settings.defaultBufferMin),
      },
    };
  } catch (e) {
    return DEFAULTS;
  }
};

export const saveTravelSettings = async (s: StoredTravelSettings): Promise<void> => {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(s));
  } catch (e) {
    // ignore
  }
};

export const loadTravelSettingsForTrip = async (tripId: string): Promise<StoredTravelSettings | null> => {
  try {
    const raw = await AsyncStorage.getItem(TRIP_KEY(tripId));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return {
      mode: (parsed.mode as TravelMode) || 'walk',
      settings: {
        walkingSpeedKmh: Number(parsed.settings?.walkingSpeedKmh ?? 4.5),
        defaultBufferMin: Number(parsed.settings?.defaultBufferMin ?? 5),
      },
    };
  } catch (e) {
    return null;
  }
};

export const saveTravelSettingsForTrip = async (tripId: string, s: StoredTravelSettings): Promise<void> => {
  try {
    await AsyncStorage.setItem(TRIP_KEY(tripId), JSON.stringify(s));
  } catch (e) {
    // ignore
  }
};


