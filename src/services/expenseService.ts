import * as ImagePicker from 'expo-image-picker';
import { extractAmountFromImage } from './ocr';
import { databaseService } from './database';

export interface Expense {
  id: string;
  tripId: string;
  activityId?: string;
  amount: number;
  description: string;
  category: 'food' | 'transport' | 'accommodation' | 'entertainment' | 'shopping' | 'other';
  date: string;
  receiptUri?: string;
  location?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseSummary {
  totalSpent: number;
  dailyAverage: number;
  categoryBreakdown: { [category: string]: number };
  overBudgetDays: number;
  topCategories: { category: string; amount: number; percentage: number }[];
}

export interface BudgetAlert {
  type: 'warning' | 'danger' | 'info';
  message: string;
  amount?: number;
  threshold?: number;
}

class ExpenseService {
  async captureReceipt(): Promise<string | null> {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      if (permissionResult.granted === false) {
        throw new Error('Camera permission not granted');
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        return result.assets[0].uri;
      }
      
      return null;
    } catch (error) {
      console.error('Error capturing receipt:', error);
      throw error;
    }
  }

  async selectReceiptFromGallery(): Promise<string | null> {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        throw new Error('Media library permission not granted');
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        return result.assets[0].uri;
      }
      
      return null;
    } catch (error) {
      console.error('Error selecting receipt:', error);
      throw error;
    }
  }

  async processReceipt(receiptUri: string): Promise<{ amount: number | null; description: string }> {
    try {
      // Extract amount using OCR
      const amount = await extractAmountFromImage(receiptUri);
      
      // Generate description based on amount and context
      let description = 'Receipt expense';
      if (amount) {
        if (amount < 20) {
          description = 'Small purchase (coffee, snack)';
        } else if (amount < 50) {
          description = 'Meal or small item';
        } else if (amount < 100) {
          description = 'Restaurant or shopping';
        } else {
          description = 'Major purchase or activity';
        }
      }
      
      return { amount, description };
    } catch (error) {
      console.error('Error processing receipt:', error);
      return { amount: null, description: 'Receipt processing failed' };
    }
  }

  async saveExpense(expenseData: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      await databaseService.init();
      
      const id = Date.now().toString();
      const now = new Date().toISOString();
      
      const expense: Expense = {
        ...expenseData,
        id,
        createdAt: now,
        updatedAt: now,
      };

      // Save to database (you'll need to add this table to your database schema)
      const insertQuery = `
        INSERT INTO expenses (id, tripId, activityId, amount, description, category, date, receiptUri, location, tags, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      await (databaseService as any).db.runAsync(
        insertQuery,
        [
          expense.id,
          expense.tripId,
          expense.activityId || null,
          expense.amount,
          expense.description,
          expense.category,
          expense.date,
          expense.receiptUri || null,
          expense.location || null,
          JSON.stringify(expense.tags),
          expense.createdAt,
          expense.updatedAt,
        ]
      );
      
      return id;
    } catch (error) {
      console.error('Error saving expense:', error);
      throw error;
    }
  }

  async getExpensesForTrip(tripId: string): Promise<Expense[]> {
    try {
      await databaseService.init();
      
      const selectQuery = 'SELECT * FROM expenses WHERE tripId = ? ORDER BY date DESC, createdAt DESC';
      const result = await (databaseService as any).db.getAllAsync(selectQuery, [tripId]);
      
      return result.map((row: any) => ({
        ...row,
        tags: JSON.parse(row.tags || '[]'),
      }));
    } catch (error) {
      console.error('Error fetching expenses:', error);
      return [];
    }
  }

  async getExpenseSummary(tripId: string): Promise<ExpenseSummary> {
    try {
      const expenses = await this.getExpensesForTrip(tripId);
      
      const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
      
      // Calculate daily average
      const uniqueDays = new Set(expenses.map(e => e.date)).size;
      const dailyAverage = uniqueDays > 0 ? totalSpent / uniqueDays : 0;
      
      // Category breakdown
      const categoryBreakdown: { [category: string]: number } = {};
      expenses.forEach(expense => {
        categoryBreakdown[expense.category] = (categoryBreakdown[expense.category] || 0) + expense.amount;
      });
      
      // Top categories
      const topCategories = Object.entries(categoryBreakdown)
        .map(([category, amount]) => ({
          category,
          amount,
          percentage: (amount / totalSpent) * 100,
        }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5);
      
      // Count over-budget days (assuming daily budget is stored in trip)
      const trip = await databaseService.getTripById(tripId);
      const dailyBudget = (trip as any)?.dailySpendCap;
      let overBudgetDays = 0;
      
      if (dailyBudget) {
        const dailySpending: { [date: string]: number } = {};
        expenses.forEach(expense => {
          dailySpending[expense.date] = (dailySpending[expense.date] || 0) + expense.amount;
        });
        
        overBudgetDays = Object.values(dailySpending).filter(amount => amount > dailyBudget).length;
      }
      
      return {
        totalSpent,
        dailyAverage,
        categoryBreakdown,
        overBudgetDays,
        topCategories,
      };
    } catch (error) {
      console.error('Error calculating expense summary:', error);
      return {
        totalSpent: 0,
        dailyAverage: 0,
        categoryBreakdown: {},
        overBudgetDays: 0,
        topCategories: [],
      };
    }
  }

  async generateBudgetAlerts(tripId: string): Promise<BudgetAlert[]> {
    try {
      const summary = await this.getExpenseSummary(tripId);
      const trip = await databaseService.getTripById(tripId);
      const dailyBudget = (trip as any)?.dailySpendCap;
      
      const alerts: BudgetAlert[] = [];
      
      if (dailyBudget) {
        // Daily average over budget
        if (summary.dailyAverage > dailyBudget * 1.2) {
          alerts.push({
            type: 'danger',
            message: `You're spending ${Math.round(((summary.dailyAverage / dailyBudget) - 1) * 100)}% over your daily budget`,
            amount: summary.dailyAverage,
            threshold: dailyBudget,
          });
        } else if (summary.dailyAverage > dailyBudget) {
          alerts.push({
            type: 'warning',
            message: `You're ${Math.round(((summary.dailyAverage / dailyBudget) - 1) * 100)}% over your daily budget`,
            amount: summary.dailyAverage,
            threshold: dailyBudget,
          });
        }
        
        // Over-budget days
        if (summary.overBudgetDays > 0) {
          alerts.push({
            type: 'warning',
            message: `${summary.overBudgetDays} day${summary.overBudgetDays > 1 ? 's' : ''} exceeded budget`,
          });
        }
      }
      
      // High spending in specific categories
      const highSpendingCategories = summary.topCategories.filter(cat => cat.percentage > 50);
      if (highSpendingCategories.length > 0) {
        alerts.push({
          type: 'info',
          message: `Most spending on ${highSpendingCategories[0].category} (${Math.round(highSpendingCategories[0].percentage)}%)`,
        });
      }
      
      return alerts;
    } catch (error) {
      console.error('Error generating budget alerts:', error);
      return [];
    }
  }

  async deleteExpense(expenseId: string): Promise<void> {
    try {
      await databaseService.init();
      
      const deleteQuery = 'DELETE FROM expenses WHERE id = ?';
      await (databaseService as any).db.runAsync(deleteQuery, [expenseId]);
    } catch (error) {
      console.error('Error deleting expense:', error);
      throw error;
    }
  }

  async updateExpense(expenseId: string, updates: Partial<Expense>): Promise<void> {
    try {
      await databaseService.init();
      
      const updatedAt = new Date().toISOString();
      const updateQuery = `
        UPDATE expenses 
        SET amount = COALESCE(?, amount),
            description = COALESCE(?, description),
            category = COALESCE(?, category),
            location = COALESCE(?, location),
            tags = COALESCE(?, tags),
            updatedAt = ?
        WHERE id = ?
      `;
      
      await (databaseService as any).db.runAsync(
        updateQuery,
        [
          updates.amount || null,
          updates.description || null,
          updates.category || null,
          updates.location || null,
          updates.tags ? JSON.stringify(updates.tags) : null,
          updatedAt,
          expenseId,
        ]
      );
    } catch (error) {
      console.error('Error updating expense:', error);
      throw error;
    }
  }
}

export const expenseService = new ExpenseService();

// Helper functions
export const getCategoryIcon = (category: string): string => {
  const icons: { [key: string]: string } = {
    food: '🍽️',
    transport: '🚗',
    accommodation: '🏨',
    entertainment: '🎭',
    shopping: '🛍️',
    other: '💳',
  };
  return icons[category] || '💳';
};

export const getCategoryColor = (category: string): string => {
  const colors: { [key: string]: string } = {
    food: '#FF6B6B',
    transport: '#4ECDC4',
    accommodation: '#45B7D1',
    entertainment: '#96CEB4',
    shopping: '#FFEAA7',
    other: '#DDA0DD',
  };
  return colors[category] || '#DDA0DD';
};

export const formatCurrency = (amount: number): string => {
  return `£${amount.toFixed(2)}`;
};
