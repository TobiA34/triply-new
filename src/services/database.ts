import * as SQLite from 'expo-sqlite';

const DB_NAME = 'Triply';

export interface Trip {
  id: string;
  destination: string;
  checkIn: string;
  checkOut: string;
  budget: number;
  activityLevel: number;
  groupType: string;
  interests: string; // JSON string
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  id: string;
  tripId: string;
  name: string;
  type: string;
  duration: string;
  cost: string;
  description: string;
  location: string;
  time: string;
  day: number;
  createdAt: string;
  updatedAt: string;
}

class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;
  private isInitialized = false;

  async init(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      this.db = await SQLite.openDatabaseAsync(DB_NAME);
      await this.createTables();
      this.isInitialized = true;
    } catch (error) {
      console.error('Error initializing database:', error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const createTripsTable = `
      CREATE TABLE IF NOT EXISTS trips (
        id TEXT PRIMARY KEY,
        destination TEXT NOT NULL,
        checkIn TEXT NOT NULL,
        checkOut TEXT NOT NULL,
        budget INTEGER NOT NULL,
        activityLevel INTEGER NOT NULL,
        groupType TEXT NOT NULL,
        interests TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );
    `;

    const createActivitiesTable = `
      CREATE TABLE IF NOT EXISTS activities (
        id TEXT PRIMARY KEY,
        tripId TEXT NOT NULL,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        duration TEXT,
        cost TEXT,
        description TEXT,
        location TEXT,
        time TEXT,
        day INTEGER NOT NULL,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        FOREIGN KEY (tripId) REFERENCES trips (id) ON DELETE CASCADE
      );
    `;

    await this.db.execAsync(createTripsTable);
    await this.db.execAsync(createActivitiesTable);
  }

  async saveTrip(tripData: Omit<Trip, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    if (!this.db) throw new Error('Database not initialized');

    const id = Date.now().toString();
    const now = new Date().toISOString();
    
    const trip: Trip = {
      ...tripData,
      id,
      createdAt: now,
      updatedAt: now,
    };

    const insertQuery = `
      INSERT INTO trips (id, destination, checkIn, checkOut, budget, activityLevel, groupType, interests, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await this.db.runAsync(
      insertQuery,
      [trip.id, trip.destination, trip.checkIn, trip.checkOut, trip.budget, trip.activityLevel, trip.groupType, trip.interests, trip.createdAt, trip.updatedAt]
    );
    return id;
  }

  async getAllTrips(): Promise<Trip[]> {
    if (!this.db) throw new Error('Database not initialized');

    const selectQuery = 'SELECT * FROM trips ORDER BY createdAt DESC';
    
    const result = await this.db.getAllAsync(selectQuery);
    return result as Trip[];
  }

  async getTripById(id: string): Promise<Trip | null> {
    if (!this.db) throw new Error('Database not initialized');

    const selectQuery = 'SELECT * FROM trips WHERE id = ?';
    
    const result = await this.db.getFirstAsync(selectQuery, [id]);
    return result as Trip | null;
  }

  async updateTrip(id: string, tripData: Partial<Omit<Trip, 'id' | 'createdAt'>>): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const updatedAt = new Date().toISOString();
    const updateQuery = `
      UPDATE trips 
      SET destination = COALESCE(?, destination),
          checkIn = COALESCE(?, checkIn),
          checkOut = COALESCE(?, checkOut),
          budget = COALESCE(?, budget),
          activityLevel = COALESCE(?, activityLevel),
          groupType = COALESCE(?, groupType),
          interests = COALESCE(?, interests),
          updatedAt = ?
      WHERE id = ?
    `;

    await this.db.runAsync(
      updateQuery,
      [
        tripData.destination || null,
        tripData.checkIn || null,
        tripData.checkOut || null,
        tripData.budget || null,
        tripData.activityLevel || null,
        tripData.groupType || null,
        tripData.interests || null,
        updatedAt,
        id
      ]
    );
  }

  async deleteTrip(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const deleteQuery = 'DELETE FROM trips WHERE id = ?';
    
    await this.db.runAsync(deleteQuery, [id]);
  }

  async getLastTrip(): Promise<Trip | null> {
    if (!this.db) throw new Error('Database not initialized');

    const selectQuery = 'SELECT * FROM trips ORDER BY createdAt DESC LIMIT 1';
    
    const result = await this.db.getFirstAsync(selectQuery);
    return result as Trip | null;
  }

  // Activity CRUD methods
  async saveActivity(activityData: Omit<Activity, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    if (!this.db) throw new Error('Database not initialized');

    const id = Date.now().toString();
    const now = new Date().toISOString();
    
    const activity: Activity = {
      ...activityData,
      id,
      createdAt: now,
      updatedAt: now,
    };

    const insertQuery = `
      INSERT INTO activities (id, tripId, name, type, duration, cost, description, location, time, day, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await this.db.runAsync(
      insertQuery,
      [activity.id, activity.tripId, activity.name, activity.type, activity.duration, activity.cost, activity.description, activity.location, activity.time, activity.day, activity.createdAt, activity.updatedAt]
    );
    return id;
  }

  async getActivitiesForTrip(tripId: string): Promise<Activity[]> {
    if (!this.db) throw new Error('Database not initialized');

    const selectQuery = 'SELECT * FROM activities WHERE tripId = ? ORDER BY day ASC, time ASC';
    
    const result = await this.db.getAllAsync(selectQuery, [tripId]);
    return result as Activity[];
  }

  async updateActivity(id: string, activityData: Partial<Omit<Activity, 'id' | 'tripId' | 'createdAt'>>): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const updatedAt = new Date().toISOString();
    const updateQuery = `
      UPDATE activities 
      SET name = COALESCE(?, name),
          type = COALESCE(?, type),
          duration = COALESCE(?, duration),
          cost = COALESCE(?, cost),
          description = COALESCE(?, description),
          location = COALESCE(?, location),
          time = COALESCE(?, time),
          day = COALESCE(?, day),
          updatedAt = ?
      WHERE id = ?
    `;

    await this.db.runAsync(
      updateQuery,
      [
        activityData.name || null,
        activityData.type || null,
        activityData.duration || null,
        activityData.cost || null,
        activityData.description || null,
        activityData.location || null,
        activityData.time || null,
        activityData.day || null,
        updatedAt,
        id
      ]
    );
  }

  async deleteActivity(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const deleteQuery = 'DELETE FROM activities WHERE id = ?';
    
    await this.db.runAsync(deleteQuery, [id]);
  }
}

export const databaseService = new DatabaseService();
