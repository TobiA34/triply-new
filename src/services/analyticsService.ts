import { Trip } from './database';

export interface TripAnalytics {
  totalTrips: number;
  totalSpent: number;
  averageSpentPerTrip: number;
  averageTripDuration: number;
  mostVisitedDestination: string;
  mostExpensiveTrip: Trip | null;
  cheapestTrip: Trip | null;
  monthlySpending: { month: string; amount: number }[];
  destinationStats: { destination: string; count: number; totalSpent: number }[];
  spendingTrends: { period: string; amount: number }[];
  budgetEfficiency: number; // Percentage of trips within budget
  seasonalPatterns: { season: string; tripCount: number; averageSpent: number }[];
}

export interface SpendingCategory {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

export interface TripInsights {
  savings: {
    potentialSavings: number;
    recommendations: string[];
  };
  patterns: {
    spendingPatterns: string[];
    travelPatterns: string[];
  };
  goals: {
    budgetGoals: string[];
    travelGoals: string[];
  };
}

class AnalyticsService {
  async generateTripAnalytics(trips: Trip[]): Promise<TripAnalytics> {
    if (trips.length === 0) {
      return this.getEmptyAnalytics();
    }

    const totalTrips = trips.length;
    const totalSpent = trips.reduce((sum, trip) => sum + (trip.budget || 0), 0);
    const averageSpentPerTrip = totalSpent / totalTrips;
    
    const averageTripDuration = trips.reduce((sum, trip) => {
      const checkIn = new Date(trip.checkIn);
      const checkOut = new Date(trip.checkOut);
      const duration = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24);
      return sum + duration;
    }, 0) / totalTrips;

    // Most visited destination
    const destinationCounts = trips.reduce((acc, trip) => {
      acc[trip.destination] = (acc[trip.destination] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const mostVisitedDestination = Object.entries(destinationCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A';

    // Most expensive and cheapest trips
    const mostExpensiveTrip = trips.reduce((max, trip) => 
      (trip.budget || 0) > (max.budget || 0) ? trip : max
    );
    const cheapestTrip = trips.reduce((min, trip) => 
      (trip.budget || 0) < (min.budget || 0) ? trip : min
    );

    // Monthly spending
    const monthlySpending = this.calculateMonthlySpending(trips);

    // Destination stats
    const destinationStats = this.calculateDestinationStats(trips);

    // Spending trends (last 6 months)
    const spendingTrends = this.calculateSpendingTrends(trips);

    // Budget efficiency
    const budgetEfficiency = this.calculateBudgetEfficiency(trips);

    // Seasonal patterns
    const seasonalPatterns = this.calculateSeasonalPatterns(trips);

    return {
      totalTrips,
      totalSpent,
      averageSpentPerTrip,
      averageTripDuration,
      mostVisitedDestination,
      mostExpensiveTrip,
      cheapestTrip,
      monthlySpending,
      destinationStats,
      spendingTrends,
      budgetEfficiency,
      seasonalPatterns,
    };
  }

  async generateSpendingCategories(trips: Trip[]): Promise<SpendingCategory[]> {
    // Mock spending categories - in a real app, this would come from expense data
    const categories = [
      { category: 'Accommodation', amount: 0, percentage: 0, color: '#FF6B6B' },
      { category: 'Food & Dining', amount: 0, percentage: 0, color: '#4ECDC4' },
      { category: 'Transportation', amount: 0, percentage: 0, color: '#45B7D1' },
      { category: 'Activities', amount: 0, percentage: 0, color: '#96CEB4' },
      { category: 'Shopping', amount: 0, percentage: 0, color: '#FFEAA7' },
      { category: 'Other', amount: 0, percentage: 0, color: '#DDA0DD' },
    ];

    // Calculate mock percentages based on trip budgets
    const totalBudget = trips.reduce((sum, trip) => sum + (trip.budget || 0), 0);
    
    if (totalBudget > 0) {
      categories.forEach((category, index) => {
        const percentage = (30 + index * 10) % 100; // Mock distribution
        category.amount = (totalBudget * percentage) / 100;
        category.percentage = percentage;
      });
    }

    return categories;
  }

  async generateTripInsights(trips: Trip[]): Promise<TripInsights> {
    const analytics = await this.generateTripAnalytics(trips);
    
    const potentialSavings = this.calculatePotentialSavings(trips);
    const recommendations = this.generateSavingsRecommendations(trips);
    
    const spendingPatterns = this.analyzeSpendingPatterns(trips);
    const travelPatterns = this.analyzeTravelPatterns(trips);
    
    const budgetGoals = this.generateBudgetGoals(analytics);
    const travelGoals = this.generateTravelGoals(analytics);

    return {
      savings: {
        potentialSavings,
        recommendations,
      },
      patterns: {
        spendingPatterns,
        travelPatterns,
      },
      goals: {
        budgetGoals,
        travelGoals,
      },
    };
  }

  private getEmptyAnalytics(): TripAnalytics {
    return {
      totalTrips: 0,
      totalSpent: 0,
      averageSpentPerTrip: 0,
      averageTripDuration: 0,
      mostVisitedDestination: 'N/A',
      mostExpensiveTrip: null,
      cheapestTrip: null,
      monthlySpending: [],
      destinationStats: [],
      spendingTrends: [],
      budgetEfficiency: 0,
      seasonalPatterns: [],
    };
  }

  private calculateMonthlySpending(trips: Trip[]): { month: string; amount: number }[] {
    const monthlyData: Record<string, number> = {};
    
    trips.forEach(trip => {
      const date = new Date(trip.checkIn);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + (trip.budget || 0);
    });

    return Object.entries(monthlyData)
      .map(([month, amount]) => ({ month, amount }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }

  private calculateDestinationStats(trips: Trip[]): { destination: string; count: number; totalSpent: number }[] {
    const destinationData: Record<string, { count: number; totalSpent: number }> = {};
    
    trips.forEach(trip => {
      if (!destinationData[trip.destination]) {
        destinationData[trip.destination] = { count: 0, totalSpent: 0 };
      }
      destinationData[trip.destination].count++;
      destinationData[trip.destination].totalSpent += (trip.budget || 0);
    });

    return Object.entries(destinationData)
      .map(([destination, data]) => ({
        destination,
        count: data.count,
        totalSpent: data.totalSpent,
      }))
      .sort((a, b) => b.totalSpent - a.totalSpent);
  }

  private calculateSpendingTrends(trips: Trip[]): { period: string; amount: number }[] {
    const now = new Date();
    const trends = [];
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      const monthTrips = trips.filter(trip => {
        const tripDate = new Date(trip.checkIn);
        return tripDate.getFullYear() === date.getFullYear() && 
               tripDate.getMonth() === date.getMonth();
      });
      
      const amount = monthTrips.reduce((sum, trip) => sum + (trip.budget || 0), 0);
      trends.push({
        period: monthKey,
        amount,
      });
    }
    
    return trends;
  }

  private calculateBudgetEfficiency(trips: Trip[]): number {
    // Mock calculation - in a real app, this would compare actual vs planned spending
    return Math.random() * 40 + 60; // 60-100% efficiency
  }

  private calculateSeasonalPatterns(trips: Trip[]): { season: string; tripCount: number; averageSpent: number }[] {
    const seasons = ['Spring', 'Summer', 'Fall', 'Winter'];
    const seasonalData = seasons.map(season => {
      const seasonTrips = trips.filter(trip => {
        const month = new Date(trip.checkIn).getMonth();
        const seasonMonths = this.getSeasonMonths(season);
        return seasonMonths.includes(month);
      });
      
      const tripCount = seasonTrips.length;
      const averageSpent = tripCount > 0 
        ? seasonTrips.reduce((sum, trip) => sum + (trip.budget || 0), 0) / tripCount
        : 0;
      
      return { season, tripCount, averageSpent };
    });
    
    return seasonalData;
  }

  private getSeasonMonths(season: string): number[] {
    switch (season) {
      case 'Spring': return [2, 3, 4]; // Mar, Apr, May
      case 'Summer': return [5, 6, 7]; // Jun, Jul, Aug
      case 'Fall': return [8, 9, 10]; // Sep, Oct, Nov
      case 'Winter': return [11, 0, 1]; // Dec, Jan, Feb
      default: return [];
    }
  }

  private calculatePotentialSavings(trips: Trip[]): number {
    // Mock calculation - in a real app, this would analyze spending patterns
    const totalSpent = trips.reduce((sum, trip) => sum + (trip.budget || 0), 0);
    return totalSpent * 0.15; // Assume 15% potential savings
  }

  private generateSavingsRecommendations(trips: Trip[]): string[] {
    return [
      'Book flights 2-3 months in advance for better deals',
      'Consider staying in hostels or shared accommodations',
      'Use public transportation instead of taxis',
      'Look for free walking tours and activities',
      'Pack light to avoid baggage fees',
    ];
  }

  private analyzeSpendingPatterns(trips: Trip[]): string[] {
    const patterns = [];
    
    if (trips.length > 3) {
      patterns.push('You tend to take multiple trips per year');
    }
    
    const avgBudget = trips.reduce((sum, trip) => sum + (trip.budget || 0), 0) / trips.length;
    if (avgBudget > 1000) {
      patterns.push('You prefer higher-budget trips');
    } else if (avgBudget < 500) {
      patterns.push('You are a budget-conscious traveler');
    }
    
    return patterns;
  }

  private analyzeTravelPatterns(trips: Trip[]): string[] {
    const patterns = [];
    
    const destinations = trips.map(trip => trip.destination);
    const uniqueDestinations = new Set(destinations);
    
    if (uniqueDestinations.size === destinations.length) {
      patterns.push('You love exploring new destinations');
    } else {
      patterns.push('You have favorite destinations you return to');
    }
    
    return patterns;
  }

  private generateBudgetGoals(analytics: TripAnalytics): string[] {
    const goals = [];
    
    if (analytics.budgetEfficiency < 80) {
      goals.push('Improve budget planning to stay within limits');
    }
    
    if (analytics.averageSpentPerTrip > 1000) {
      goals.push('Find ways to reduce average trip costs');
    }
    
    goals.push('Set a monthly travel budget limit');
    goals.push('Track expenses more closely');
    
    return goals;
  }

  private generateTravelGoals(analytics: TripAnalytics): string[] {
    const goals = [];
    
    if (analytics.totalTrips < 3) {
      goals.push('Plan more frequent trips');
    }
    
    if (analytics.destinationStats.length < 3) {
      goals.push('Explore more diverse destinations');
    }
    
    goals.push('Try a new type of accommodation');
    goals.push('Plan a solo trip');
    
    return goals;
  }
}

export const analyticsService = new AnalyticsService();


