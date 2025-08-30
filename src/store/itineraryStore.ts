import { create } from 'zustand';

interface ItineraryItem {
  id: string;
  title: string;
  description: string;
  location?: {
    latitude: number;
    longitude: number;
    name: string;
  };
  date?: Date;
}

interface ItineraryState {
  items: ItineraryItem[];
  addItem: (item: ItineraryItem) => void;
  removeItem: (id: string) => void;
  updateItem: (id: string, updates: Partial<ItineraryItem>) => void;
  clearItems: () => void;
}

export const useItineraryStore = create<ItineraryState>((set) => ({
  items: [],
  
  addItem: (item) => set((state) => ({
    items: [...state.items, item],
  })),
  
  removeItem: (id) => set((state) => ({
    items: state.items.filter((item) => item.id !== id),
  })),
  
  updateItem: (id, updates) => set((state) => ({
    items: state.items.map((item) =>
      item.id === id ? { ...item, ...updates } : item
    ),
  })),
  
  clearItems: () => set({ items: [] }),
}));
