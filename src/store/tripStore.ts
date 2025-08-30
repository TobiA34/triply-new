import { create } from 'zustand';

interface TripState {
  destination: string;
  startDate: Date | null;
  endDate: Date | null;
  preferences: string[];
  setDestination: (destination: string) => void;
  setDates: (startDate: Date | null, endDate: Date | null) => void;
  setPreferences: (preferences: string[]) => void;
  reset: () => void;
}

export const useTripStore = create<TripState>((set) => ({
  destination: '',
  startDate: null,
  endDate: null,
  preferences: [],
  
  setDestination: (destination) => set({ destination }),
  setDates: (startDate, endDate) => set({ startDate, endDate }),
  setPreferences: (preferences) => set({ preferences }),
  reset: () => set({
    destination: '',
    startDate: null,
    endDate: null,
    preferences: [],
  }),
}));
