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
  dailySpendCap?: number | null;
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
  receiptUri?: string | null;
  bookingStatus?: 'placeholder' | 'booked' | 'canceled' | null;
  bookingReminderISO?: string | null;
  createdAt: string;
  updatedAt: string;
}

// Polls
export interface PollOptionVote {
  option: string;
  score: number; // aggregated score
}

export interface Poll {
  id: string;
  tripId: string;
  day: number; // target day
  time: string; // target time HH:mm
  options: string; // JSON array of strings
  votes: string; // JSON map option->score
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
        dailySpendCap INTEGER,
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
        receiptUri TEXT,
        bookingStatus TEXT,
        bookingReminderISO TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        FOREIGN KEY (tripId) REFERENCES trips (id) ON DELETE CASCADE
      );
    `;

     const createPollsTable = `
       CREATE TABLE IF NOT EXISTS polls (
         id TEXT PRIMARY KEY,
         tripId TEXT NOT NULL,
         day INTEGER NOT NULL,
         time TEXT NOT NULL,
         options TEXT NOT NULL,
         votes TEXT NOT NULL,
         createdAt TEXT NOT NULL,
         updatedAt TEXT NOT NULL,
         FOREIGN KEY (tripId) REFERENCES trips (id) ON DELETE CASCADE
       );
     `;

     const createExpensesTable = `
       CREATE TABLE IF NOT EXISTS expenses (
         id TEXT PRIMARY KEY,
         tripId TEXT NOT NULL,
         activityId TEXT,
         amount REAL NOT NULL,
         description TEXT NOT NULL,
         category TEXT NOT NULL,
         date TEXT NOT NULL,
         receiptUri TEXT,
         location TEXT,
         tags TEXT NOT NULL,
         createdAt TEXT NOT NULL,
         updatedAt TEXT NOT NULL,
         FOREIGN KEY (tripId) REFERENCES trips (id) ON DELETE CASCADE
       );
     `;

     await this.db.execAsync(createTripsTable);
     await this.db.execAsync(createActivitiesTable);
     await this.db.execAsync(createPollsTable);
     await this.db.execAsync(createExpensesTable);

    // best-effort migrations for existing installations (ALTER TABLE will throw if column exists)
    try { await this.db!.execAsync("ALTER TABLE trips ADD COLUMN dailySpendCap INTEGER"); } catch {}
    try { await this.db!.execAsync("ALTER TABLE activities ADD COLUMN receiptUri TEXT"); } catch {}
    try { await this.db!.execAsync("ALTER TABLE activities ADD COLUMN bookingStatus TEXT"); } catch {}
    try { await this.db!.execAsync("ALTER TABLE activities ADD COLUMN bookingReminderISO TEXT"); } catch {}
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
      INSERT INTO trips (id, destination, checkIn, checkOut, budget, activityLevel, groupType, interests, dailySpendCap, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await this.db.runAsync(
      insertQuery,
      [trip.id, trip.destination, trip.checkIn, trip.checkOut, trip.budget, trip.activityLevel, trip.groupType, trip.interests, (trip as any).dailySpendCap ?? null, trip.createdAt, trip.updatedAt]
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
          dailySpendCap = COALESCE(?, dailySpendCap),
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
        (tripData as any).dailySpendCap ?? null,
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
      INSERT INTO activities (id, tripId, name, type, duration, cost, description, location, time, day, receiptUri, bookingStatus, bookingReminderISO, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await this.db.runAsync(
      insertQuery,
      [activity.id, activity.tripId, activity.name, activity.type, activity.duration, activity.cost, activity.description, activity.location, activity.time, activity.day, (activity as any).receiptUri ?? null, (activity as any).bookingStatus ?? null, (activity as any).bookingReminderISO ?? null, activity.createdAt, activity.updatedAt]
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
          receiptUri = COALESCE(?, receiptUri),
          bookingStatus = COALESCE(?, bookingStatus),
          bookingReminderISO = COALESCE(?, bookingReminderISO),
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
        (activityData as any).receiptUri ?? null,
        (activityData as any).bookingStatus ?? null,
        (activityData as any).bookingReminderISO ?? null,
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

  // Poll CRUD
  async savePoll(poll: Omit<Poll, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    if (!this.db) throw new Error('Database not initialized');
    const id = Date.now().toString();
    const now = new Date().toISOString();
    const insertQuery = `
      INSERT INTO polls (id, tripId, day, time, options, votes, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    await this.db.runAsync(insertQuery, [id, poll.tripId, poll.day, poll.time, poll.options, poll.votes, now, now]);
    return id;
  }

  async updatePollVotes(id: string, votes: Record<string, number>): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    const now = new Date().toISOString();
    await this.db.runAsync(
      'UPDATE polls SET votes = ?, updatedAt = ? WHERE id = ?',
      [JSON.stringify(votes), now, id]
    );
  }

  async getLatestPollForTrip(tripId: string): Promise<Poll | null> {
    if (!this.db) throw new Error('Database not initialized');
    const res = await this.db.getFirstAsync('SELECT * FROM polls WHERE tripId = ? ORDER BY createdAt DESC LIMIT 1', [tripId]);
    return res as Poll | null;
  }
}

export const databaseService = new DatabaseService();

// Helper types and utilities for budgeting
export type BookingStatus = 'placeholder' | 'booked' | 'canceled';

export interface SpendByDay {
  day: number;
  total: number;
}

export async function setTripDailyCap(tripId: string, cap: number | null): Promise<void> {
  await databaseService.updateTrip(tripId, { dailySpendCap: cap } as any);
}

export async function getSpendForTripDay(tripId: string, day: number): Promise<number> {
  // Costs stored as TEXT - cast to REAL for summation
  // If any invalid values exist, they will be treated as 0.0 by CAST
  const db = (databaseService as any).db as SQLite.SQLiteDatabase | null;
  if (!db) throw new Error('Database not initialized');
  const row = await db.getFirstAsync(
    'SELECT SUM(CAST(cost AS REAL)) as total FROM activities WHERE tripId = ? AND day = ?',
    [tripId, day]
  );
  const total = (row && (row as any).total != null) ? Number((row as any).total) : 0;
  return total;
}

export async function getSpendByDayForTrip(tripId: string): Promise<SpendByDay[]> {
  const db = (databaseService as any).db as SQLite.SQLiteDatabase | null;
  if (!db) throw new Error('Database not initialized');
  const rows = await db.getAllAsync(
    'SELECT day, SUM(CAST(cost AS REAL)) as total FROM activities WHERE tripId = ? GROUP BY day ORDER BY day ASC',
    [tripId]
  );
  return (rows as any[]).map(r => ({ day: Number(r.day), total: Number(r.total || 0) }));
}
