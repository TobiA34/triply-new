import { databaseService } from './database';
import { getWeatherData } from './weatherService';

export interface PackingItem {
  id: string;
  tripId: string;
  category: string;
  name: string;
  isPacked: boolean;
  isEssential: boolean;
  weatherBased: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PackingCategory {
  id: string;
  name: string;
  icon: string;
  items: PackingItem[];
}

export const packingCategories = [
  { id: 'clothing', name: 'Clothing', icon: '👕' },
  { id: 'toiletries', name: 'Toiletries', icon: '🧴' },
  { id: 'electronics', name: 'Electronics', icon: '📱' },
  { id: 'documents', name: 'Documents', icon: '📄' },
  { id: 'accessories', name: 'Accessories', icon: '🕶️' },
  { id: 'health', name: 'Health & Safety', icon: '🏥' },
  { id: 'entertainment', name: 'Entertainment', icon: '🎮' },
  { id: 'misc', name: 'Miscellaneous', icon: '🎒' },
];

export const essentialItems = {
  clothing: [
    'Underwear (5-7 pairs)',
    'Socks (5-7 pairs)',
    'T-shirts (3-5)',
    'Pants/Jeans (2-3)',
    'Pajamas',
    'Comfortable walking shoes',
  ],
  toiletries: [
    'Toothbrush & toothpaste',
    'Shampoo & conditioner',
    'Body wash/soap',
    'Deodorant',
    'Razor & shaving cream',
    'Hair brush/comb',
  ],
  electronics: [
    'Phone & charger',
    'Power bank',
    'Camera (optional)',
    'Laptop/tablet (if needed)',
    'Universal adapter',
  ],
  documents: [
    'Passport/ID',
    'Travel insurance',
    'Boarding passes',
    'Hotel confirmations',
    'Emergency contacts',
  ],
  accessories: [
    'Sunglasses',
    'Hat/cap',
    'Watch',
    'Jewelry (minimal)',
    'Belt',
  ],
  health: [
    'Prescription medications',
    'First aid kit',
    'Sunscreen',
    'Pain relievers',
    'Band-aids',
  ],
  entertainment: [
    'Books/e-reader',
    'Headphones',
    'Travel games',
    'Notebook & pen',
  ],
  misc: [
    'Luggage locks',
    'Laundry bag',
    'Water bottle',
    'Snacks',
    'Cash & cards',
  ],
};

export const weatherBasedItems = {
  hot: [
    'Lightweight clothing',
    'Sun hat',
    'Sunscreen (SPF 30+)',
    'Cooling towel',
    'Sandals',
    'Swimwear',
  ],
  cold: [
    'Warm jacket/coat',
    'Thermal underwear',
    'Gloves',
    'Scarf',
    'Warm boots',
    'Heavy socks',
  ],
  rainy: [
    'Rain jacket',
    'Umbrella',
    'Waterproof shoes',
    'Quick-dry clothing',
    'Plastic bags',
  ],
  snowy: [
    'Winter coat',
    'Snow boots',
    'Thermal layers',
    'Warm hat',
    'Gloves',
    'Ice cleats',
  ],
};

export async function generatePackingList(tripId: string, destination: string): Promise<PackingItem[]> {
  try {
    // Clear existing packing items for this trip
    try {
      const existingItems = await databaseService.getPackingItemsForTrip(tripId);
      for (const item of existingItems) {
        await databaseService.deletePackingItem(item.id);
      }
    } catch (error) {
      console.warn('Could not clear existing packing items:', error);
    }

    // Get weather data for the destination
    let weatherType = 'mild';
    try {
      const weatherData = await getWeatherData(destination);
      const currentWeather = weatherData.current.condition.toLowerCase();
      
      // Determine weather type
      if (currentWeather.includes('rain') || currentWeather.includes('drizzle')) {
        weatherType = 'rainy';
      } else if (currentWeather.includes('snow')) {
        weatherType = 'snowy';
      } else if (weatherData.current.temperature > 25) {
        weatherType = 'hot';
      } else if (weatherData.current.temperature < 10) {
        weatherType = 'cold';
      }
    } catch (weatherError) {
      console.warn('Weather data unavailable, using default packing list:', weatherError);
      // Continue with default weather type
    }

    const packingItems: Omit<PackingItem, 'id' | 'createdAt' | 'updatedAt'>[] = [];

    // Add essential items
    Object.entries(essentialItems).forEach(([category, items]) => {
      items.forEach(item => {
        packingItems.push({
          tripId,
          category,
          name: item,
          isPacked: false,
          isEssential: true,
          weatherBased: false,
        });
      });
    });

    // Add weather-based items
    if (weatherType !== 'mild' && weatherBasedItems[weatherType as keyof typeof weatherBasedItems]) {
      weatherBasedItems[weatherType as keyof typeof weatherBasedItems].forEach(item => {
        packingItems.push({
          tripId,
          category: 'clothing',
          name: item,
          isPacked: false,
          isEssential: false,
          weatherBased: true,
        });
      });
    }

    // Save items to database
    const savedItems: PackingItem[] = [];
    for (const item of packingItems) {
      try {
        const id = await databaseService.savePackingItem(item);
        savedItems.push({
          ...item,
          id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      } catch (error) {
        console.warn('Failed to save packing item, skipping:', item.name, error);
        // Continue with other items
      }
    }

    return savedItems;
  } catch (error) {
    console.error('Error generating packing list:', error);
    throw new Error('Failed to generate packing list');
  }
}

export async function getPackingList(tripId: string): Promise<PackingItem[]> {
  try {
    const items = await databaseService.getPackingItemsForTrip(tripId);
    return items.map(item => ({
      ...item,
      notes: item.notes || undefined,
    }));
  } catch (error) {
    console.error('Error fetching packing list:', error);
    throw new Error('Failed to fetch packing list');
  }
}

export async function updatePackingItem(itemId: string, updates: Partial<Omit<PackingItem, 'id' | 'tripId' | 'createdAt'>>): Promise<void> {
  try {
    await databaseService.updatePackingItem(itemId, updates);
  } catch (error) {
    console.error('Error updating packing item:', error);
    throw new Error('Failed to update packing item');
  }
}

export async function deletePackingItem(itemId: string): Promise<void> {
  try {
    await databaseService.deletePackingItem(itemId);
  } catch (error) {
    console.error('Error deleting packing item:', error);
    throw new Error('Failed to delete packing item');
  }
}

export async function addCustomPackingItem(
  tripId: string,
  category: string,
  name: string,
  isEssential: boolean = false
): Promise<string> {
  try {
    const item: Omit<PackingItem, 'id' | 'createdAt' | 'updatedAt'> = {
      tripId,
      category,
      name,
      isPacked: false,
      isEssential,
      weatherBased: false,
    };
    return await databaseService.savePackingItem(item);
  } catch (error) {
    console.error('Error adding custom packing item:', error);
    throw new Error('Failed to add custom packing item');
  }
}

export function getPackingProgress(items: PackingItem[]): { packed: number; total: number; percentage: number } {
  const packed = items.filter(item => item.isPacked).length;
  const total = items.length;
  const percentage = total > 0 ? Math.round((packed / total) * 100) : 0;
  
  return { packed, total, percentage };
}

export function getPackingStats(items: PackingItem[]): {
  byCategory: Record<string, { packed: number; total: number }>;
  essential: { packed: number; total: number };
  weatherBased: { packed: number; total: number };
} {
  const byCategory: Record<string, { packed: number; total: number }> = {};
  let essentialPacked = 0;
  let essentialTotal = 0;
  let weatherPacked = 0;
  let weatherTotal = 0;

  items.forEach(item => {
    // Category stats
    if (!byCategory[item.category]) {
      byCategory[item.category] = { packed: 0, total: 0 };
    }
    byCategory[item.category].total++;
    if (item.isPacked) {
      byCategory[item.category].packed++;
    }

    // Essential stats
    if (item.isEssential) {
      essentialTotal++;
      if (item.isPacked) essentialPacked++;
    }

    // Weather-based stats
    if (item.weatherBased) {
      weatherTotal++;
      if (item.isPacked) weatherPacked++;
    }
  });

  return {
    byCategory,
    essential: { packed: essentialPacked, total: essentialTotal },
    weatherBased: { packed: weatherPacked, total: weatherTotal },
  };
}
