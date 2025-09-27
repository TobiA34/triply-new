import AsyncStorage from '@react-native-async-storage/async-storage';
import { Trip } from './database';

export interface OfflineData {
  trips: Trip[];
  lastSync: string;
  pendingChanges: PendingChange[];
}

export interface PendingChange {
  id: string;
  type: 'create' | 'update' | 'delete';
  data: any;
  timestamp: string;
}

class OfflineService {
  private isOnline = true;
  private syncInProgress = false;

  constructor() {
    // Initialize with basic online state
    this.isOnline = true;
  }

  async isConnected(): Promise<boolean> {
    // For now, assume we're always connected
    // In a real app, you'd use NetInfo here
    return this.isOnline;
  }

  async saveOfflineData(data: OfflineData): Promise<void> {
    try {
      await AsyncStorage.setItem('offline_data', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save offline data:', error);
    }
  }

  async getOfflineData(): Promise<OfflineData | null> {
    try {
      const data = await AsyncStorage.getItem('offline_data');
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to get offline data:', error);
      return null;
    }
  }

  async addPendingChange(change: Omit<PendingChange, 'id' | 'timestamp'>): Promise<void> {
    try {
      const offlineData = await this.getOfflineData() || { trips: [], lastSync: '', pendingChanges: [] };
      
      const newChange: PendingChange = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        ...change,
      };

      offlineData.pendingChanges.push(newChange);
      await this.saveOfflineData(offlineData);
    } catch (error) {
      console.error('Failed to add pending change:', error);
    }
  }

  async getPendingChanges(): Promise<PendingChange[]> {
    try {
      const offlineData = await this.getOfflineData();
      return offlineData?.pendingChanges || [];
    } catch (error) {
      console.error('Failed to get pending changes:', error);
      return [];
    }
  }

  async clearPendingChanges(): Promise<void> {
    try {
      const offlineData = await this.getOfflineData() || { trips: [], lastSync: '', pendingChanges: [] };
      offlineData.pendingChanges = [];
      await this.saveOfflineData(offlineData);
    } catch (error) {
      console.error('Failed to clear pending changes:', error);
    }
  }

  async syncPendingChanges(): Promise<boolean> {
    if (this.syncInProgress || !this.isOnline) {
      return false;
    }

    this.syncInProgress = true;

    try {
      const pendingChanges = await this.getPendingChanges();
      
      if (pendingChanges.length === 0) {
        return true;
      }

      // Process pending changes
      for (const change of pendingChanges) {
        await this.processPendingChange(change);
      }

      // Clear pending changes after successful sync
      await this.clearPendingChanges();
      
      // Update last sync time
      const offlineData = await this.getOfflineData() || { trips: [], lastSync: '', pendingChanges: [] };
      offlineData.lastSync = new Date().toISOString();
      await this.saveOfflineData(offlineData);

      return true;
    } catch (error) {
      console.error('Failed to sync pending changes:', error);
      return false;
    } finally {
      this.syncInProgress = false;
    }
  }

  private async processPendingChange(change: PendingChange): Promise<void> {
    // This would integrate with your actual database service
    // For now, we'll just log the change
    console.log('Processing pending change:', change);
    
    // In a real implementation, you would:
    // 1. Import your database service
    // 2. Apply the change based on type
    // 3. Handle errors appropriately
  }

  async cacheTrips(trips: Trip[]): Promise<void> {
    try {
      const offlineData = await this.getOfflineData() || { trips: [], lastSync: '', pendingChanges: [] };
      offlineData.trips = trips;
      offlineData.lastSync = new Date().toISOString();
      await this.saveOfflineData(offlineData);
    } catch (error) {
      console.error('Failed to cache trips:', error);
    }
  }

  async getCachedTrips(): Promise<Trip[]> {
    try {
      const offlineData = await this.getOfflineData();
      return offlineData?.trips || [];
    } catch (error) {
      console.error('Failed to get cached trips:', error);
      return [];
    }
  }

  async getLastSyncTime(): Promise<string | null> {
    try {
      const offlineData = await this.getOfflineData();
      return offlineData?.lastSync || null;
    } catch (error) {
      console.error('Failed to get last sync time:', error);
      return null;
    }
  }

  async clearCache(): Promise<void> {
    try {
      await AsyncStorage.removeItem('offline_data');
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }

  getConnectionStatus(): boolean {
    return this.isOnline;
  }

  async getOfflineStatus(): Promise<{
    isOnline: boolean;
    lastSync: string | null;
    pendingChanges: number;
  }> {
    const isOnline = await this.isConnected();
    const lastSync = await this.getLastSyncTime();
    const pendingChanges = await this.getPendingChanges();

    return {
      isOnline,
      lastSync,
      pendingChanges: pendingChanges.length,
    };
  }
}

export const offlineService = new OfflineService();
