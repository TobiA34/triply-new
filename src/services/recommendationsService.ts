import { Trip } from './database';

export interface Recommendation {
  id: string;
  type: 'destination' | 'activity' | 'accommodation' | 'budget' | 'timing' | 'transport';
  title: string;
  description: string;
  confidence: number; // 0-100
  priority: 'high' | 'medium' | 'low';
  category: string;
  estimatedCost?: number;
  estimatedSavings?: number;
  tags: string[];
  actionUrl?: string;
  imageUrl?: string;
}

export interface PersonalizedRecommendation extends Recommendation {
  reason: string;
  basedOn: string[];
  alternatives: Recommendation[];
}

export interface RecommendationContext {
  userPreferences: {
    budget: number;
    activityLevel: number;
    groupType: string;
    interests: string[];
    preferredDestinations: string[];
    travelStyle: 'budget' | 'mid-range' | 'luxury';
  };
  tripHistory: Trip[];
  currentSeason: string;
  upcomingTrips: Trip[];
}

class RecommendationsService {
  private destinations = [
    { name: 'Paris', country: 'France', category: 'culture', cost: 'mid-range', bestSeason: 'spring' },
    { name: 'Tokyo', country: 'Japan', category: 'culture', cost: 'mid-range', bestSeason: 'spring' },
    { name: 'Bali', country: 'Indonesia', category: 'beach', cost: 'budget', bestSeason: 'summer' },
    { name: 'New York', country: 'USA', category: 'city', cost: 'mid-range', bestSeason: 'fall' },
    { name: 'Santorini', country: 'Greece', category: 'beach', cost: 'mid-range', bestSeason: 'summer' },
    { name: 'Reykjavik', country: 'Iceland', category: 'adventure', cost: 'mid-range', bestSeason: 'summer' },
    { name: 'Dubai', country: 'UAE', category: 'luxury', cost: 'luxury', bestSeason: 'winter' },
    { name: 'Bangkok', country: 'Thailand', category: 'culture', cost: 'budget', bestSeason: 'winter' },
    { name: 'Rome', country: 'Italy', category: 'culture', cost: 'mid-range', bestSeason: 'spring' },
    { name: 'Sydney', country: 'Australia', category: 'city', cost: 'mid-range', bestSeason: 'summer' },
  ];

  private activities = [
    { name: 'City Walking Tour', category: 'culture', cost: 'free', duration: '2-3 hours' },
    { name: 'Museum Visit', category: 'culture', cost: 'low', duration: '2-4 hours' },
    { name: 'Beach Day', category: 'relaxation', cost: 'free', duration: 'full day' },
    { name: 'Hiking Adventure', category: 'adventure', cost: 'low', duration: 'half day' },
    { name: 'Food Tour', category: 'food', cost: 'mid', duration: '3-4 hours' },
    { name: 'Photography Workshop', category: 'culture', cost: 'mid', duration: '4-6 hours' },
    { name: 'Spa Day', category: 'relaxation', cost: 'high', duration: 'half day' },
    { name: 'Local Market Visit', category: 'culture', cost: 'low', duration: '1-2 hours' },
    { name: 'Sunset Cruise', category: 'relaxation', cost: 'mid', duration: '2-3 hours' },
    { name: 'Cooking Class', category: 'food', cost: 'mid', duration: '3-4 hours' },
  ];

  async generatePersonalizedRecommendations(context: RecommendationContext): Promise<PersonalizedRecommendation[]> {
    const recommendations: PersonalizedRecommendation[] = [];

    // Destination recommendations
    const destinationRecs = await this.generateDestinationRecommendations(context);
    recommendations.push(...destinationRecs);

    // Activity recommendations
    const activityRecs = await this.generateActivityRecommendations(context);
    recommendations.push(...activityRecs);

    // Budget recommendations
    const budgetRecs = await this.generateBudgetRecommendations(context);
    recommendations.push(...budgetRecs);

    // Timing recommendations
    const timingRecs = await this.generateTimingRecommendations(context);
    recommendations.push(...timingRecs);

    // Accommodation recommendations
    const accommodationRecs = await this.generateAccommodationRecommendations(context);
    recommendations.push(...accommodationRecs);

    // Transport recommendations
    const transportRecs = await this.generateTransportRecommendations(context);
    recommendations.push(...transportRecs);

    // Sort by confidence and priority
    return recommendations.sort((a, b) => {
      if (a.priority === 'high' && b.priority !== 'high') return -1;
      if (b.priority === 'high' && a.priority !== 'high') return 1;
      return b.confidence - a.confidence;
    });
  }

  private async generateDestinationRecommendations(context: RecommendationContext): Promise<PersonalizedRecommendation[]> {
    const recommendations: PersonalizedRecommendation[] = [];
    const visitedDestinations = context.tripHistory.map(trip => trip.destination.toLowerCase());
    
    // Find destinations that match user preferences
    const suitableDestinations = this.destinations.filter(dest => {
      const name = dest.name.toLowerCase();
      const isNotVisited = !visitedDestinations.includes(name);
      const matchesBudget = this.matchesBudget(dest.cost, context.userPreferences.budget);
      const matchesInterests = this.matchesInterests(dest.category, context.userPreferences.interests);
      const isGoodSeason = this.isGoodSeason(dest.bestSeason, context.currentSeason);
      
      return isNotVisited && matchesBudget && (matchesInterests || isGoodSeason);
    });

    suitableDestinations.slice(0, 3).forEach((dest, index) => {
      const confidence = this.calculateDestinationConfidence(dest, context);
      const priority = confidence > 80 ? 'high' : confidence > 60 ? 'medium' : 'low';
      
      recommendations.push({
        id: `dest-${dest.name.toLowerCase()}`,
        type: 'destination',
        title: `Visit ${dest.name}, ${dest.country}`,
        description: `Perfect for ${dest.category} enthusiasts with ${dest.cost} budget`,
        confidence,
        priority,
        category: dest.category,
        estimatedCost: this.estimateDestinationCost(dest, context.userPreferences.budget),
        tags: [dest.category, dest.cost, dest.bestSeason],
        reason: this.generateDestinationReason(dest, context),
        basedOn: this.getDestinationBasedOn(dest, context),
        alternatives: this.getDestinationAlternatives(dest, context),
      });
    });

    return recommendations;
  }

  private async generateActivityRecommendations(context: RecommendationContext): Promise<PersonalizedRecommendation[]> {
    const recommendations: PersonalizedRecommendation[] = [];
    
    // Filter activities based on user interests and budget
    const suitableActivities = this.activities.filter(activity => {
      const matchesInterests = this.matchesInterests(activity.category, context.userPreferences.interests);
      const matchesBudget = this.matchesActivityBudget(activity.cost, context.userPreferences.budget);
      return matchesInterests && matchesBudget;
    });

    suitableActivities.slice(0, 5).forEach((activity, index) => {
      const confidence = this.calculateActivityConfidence(activity, context);
      const priority = confidence > 75 ? 'high' : confidence > 50 ? 'medium' : 'low';
      
      recommendations.push({
        id: `activity-${activity.name.toLowerCase().replace(/\s+/g, '-')}`,
        type: 'activity',
        title: activity.name,
        description: `${activity.duration} ${activity.category} activity`,
        confidence,
        priority,
        category: activity.category,
        estimatedCost: this.estimateActivityCost(activity, context.userPreferences.budget),
        tags: [activity.category, activity.cost, activity.duration],
        reason: this.generateActivityReason(activity, context),
        basedOn: this.getActivityBasedOn(activity, context),
        alternatives: this.getActivityAlternatives(activity, context),
      });
    });

    return recommendations;
  }

  private async generateBudgetRecommendations(context: RecommendationContext): Promise<PersonalizedRecommendation[]> {
    const recommendations: PersonalizedRecommendation[] = [];
    const avgSpending = this.calculateAverageSpending(context.tripHistory);
    const budget = context.userPreferences.budget;

    // Budget optimization recommendations
    if (avgSpending > budget * 1.2) {
      recommendations.push({
        id: 'budget-optimization',
        type: 'budget',
        title: 'Optimize Your Travel Budget',
        description: `You're spending ${((avgSpending / budget - 1) * 100).toFixed(0)}% more than planned`,
        confidence: 90,
        priority: 'high',
        category: 'budget',
        estimatedSavings: avgSpending - budget,
        tags: ['budget', 'optimization', 'savings'],
        reason: 'Your recent trips have exceeded your budget significantly',
        basedOn: ['spending history', 'budget analysis'],
        alternatives: [],
      });
    }

    // Money-saving tips
    recommendations.push({
      id: 'budget-tips',
      type: 'budget',
      title: 'Smart Money-Saving Tips',
      description: 'Book flights 2-3 months in advance, use public transport, and look for free activities',
      confidence: 85,
      priority: 'medium',
      category: 'budget',
      estimatedSavings: budget * 0.15,
      tags: ['tips', 'savings', 'planning'],
      reason: 'Based on your budget preferences and travel patterns',
      basedOn: ['budget analysis', 'travel patterns'],
      alternatives: [],
    });

    return recommendations;
  }

  private async generateTimingRecommendations(context: RecommendationContext): Promise<PersonalizedRecommendation[]> {
    const recommendations: PersonalizedRecommendation[] = [];
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();

    // Seasonal recommendations
    const season = this.getSeason(currentMonth);
    const seasonalDestinations = this.destinations.filter(dest => dest.bestSeason === season);

    if (seasonalDestinations.length > 0) {
      recommendations.push({
        id: 'seasonal-timing',
        type: 'timing',
        title: `Perfect Time for ${season.charAt(0).toUpperCase() + season.slice(1)} Travel`,
        description: `Great weather and deals available for ${seasonalDestinations.length} destinations`,
        confidence: 80,
        priority: 'medium',
        category: 'timing',
        tags: ['seasonal', 'timing', 'weather'],
        reason: `Current season (${season}) offers optimal conditions`,
        basedOn: ['seasonal analysis', 'weather patterns'],
        alternatives: [],
      });
    }

    // Off-season recommendations
    recommendations.push({
      id: 'off-season',
      type: 'timing',
      title: 'Consider Off-Season Travel',
      description: 'Save up to 40% on accommodations and avoid crowds',
      confidence: 75,
      priority: 'medium',
      category: 'timing',
      estimatedSavings: context.userPreferences.budget * 0.3,
      tags: ['off-season', 'savings', 'crowds'],
      reason: 'Off-season travel offers better value and fewer crowds',
      basedOn: ['seasonal pricing', 'crowd analysis'],
      alternatives: [],
    });

    return recommendations;
  }

  private async generateAccommodationRecommendations(context: RecommendationContext): Promise<PersonalizedRecommendation[]> {
    const recommendations: PersonalizedRecommendation[] = [];
    const budget = context.userPreferences.budget;
    const groupType = context.userPreferences.groupType;

    // Accommodation type recommendations based on group type
    let accommodationType = 'hotel';
    let description = 'Standard hotel accommodation';
    
    if (groupType === 'Solo') {
      accommodationType = 'hostel';
      description = 'Hostel for budget-conscious solo travelers';
    } else if (groupType === 'Family') {
      accommodationType = 'apartment';
      description = 'Apartment rental for family comfort';
    } else if (groupType === 'Couple') {
      accommodationType = 'boutique hotel';
      description = 'Boutique hotel for romantic getaways';
    }

    recommendations.push({
      id: 'accommodation-type',
      type: 'accommodation',
      title: `Try ${accommodationType.charAt(0).toUpperCase() + accommodationType.slice(1)} Stays`,
      description,
      confidence: 80,
      priority: 'medium',
      category: 'accommodation',
      estimatedCost: this.estimateAccommodationCost(accommodationType, budget),
      tags: [accommodationType, groupType.toLowerCase()],
      reason: `Based on your group type (${groupType}) and travel style`,
      basedOn: ['group analysis', 'accommodation preferences'],
      alternatives: [],
    });

    return recommendations;
  }

  private async generateTransportRecommendations(context: RecommendationContext): Promise<PersonalizedRecommendation[]> {
    const recommendations: PersonalizedRecommendation[] = [];
    const budget = context.userPreferences.budget;

    // Transport recommendations based on budget
    if (budget < 500) {
      recommendations.push({
        id: 'budget-transport',
        type: 'transport',
        title: 'Use Budget Airlines and Public Transport',
        description: 'Save money with budget airlines and local public transport',
        confidence: 85,
        priority: 'high',
        category: 'transport',
        estimatedSavings: budget * 0.2,
        tags: ['budget', 'airlines', 'public transport'],
        reason: 'Your budget suggests preference for cost-effective transport',
        basedOn: ['budget analysis', 'transport costs'],
        alternatives: [],
      });
    } else {
      recommendations.push({
        id: 'comfort-transport',
        type: 'transport',
        title: 'Consider Comfortable Transport Options',
        description: 'Premium airlines and private transfers for a more comfortable journey',
        confidence: 80,
        priority: 'medium',
        category: 'transport',
        estimatedCost: budget * 0.3,
        tags: ['comfort', 'premium', 'convenience'],
        reason: 'Your budget allows for more comfortable transport options',
        basedOn: ['budget analysis', 'comfort preferences'],
        alternatives: [],
      });
    }

    return recommendations;
  }

  // Helper methods
  private matchesBudget(destCost: string, userBudget: number): boolean {
    const costMap = { budget: 300, 'mid-range': 800, luxury: 2000 };
    const destCostValue = costMap[destCost as keyof typeof costMap] || 800;
    return userBudget >= destCostValue * 0.8;
  }

  private matchesInterests(destCategory: string, userInterests: string[]): boolean {
    return userInterests.some(interest => 
      interest.toLowerCase().includes(destCategory) || 
      destCategory.includes(interest.toLowerCase())
    );
  }

  private isGoodSeason(destSeason: string, currentSeason: string): boolean {
    return destSeason === currentSeason;
  }

  private calculateDestinationConfidence(dest: any, context: RecommendationContext): number {
    let confidence = 50;
    
    if (this.matchesBudget(dest.cost, context.userPreferences.budget)) confidence += 20;
    if (this.matchesInterests(dest.category, context.userPreferences.interests)) confidence += 20;
    if (this.isGoodSeason(dest.bestSeason, context.currentSeason)) confidence += 10;
    
    return Math.min(confidence, 100);
  }

  private calculateActivityConfidence(activity: any, context: RecommendationContext): number {
    let confidence = 40;
    
    if (this.matchesInterests(activity.category, context.userPreferences.interests)) confidence += 30;
    if (this.matchesActivityBudget(activity.cost, context.userPreferences.budget)) confidence += 20;
    if (activity.duration.includes('half day') || activity.duration.includes('full day')) confidence += 10;
    
    return Math.min(confidence, 100);
  }

  private matchesActivityBudget(activityCost: string, userBudget: number): boolean {
    const costMap = { free: 0, low: 50, mid: 150, high: 300 };
    const activityCostValue = costMap[activityCost as keyof typeof costMap] || 100;
    return userBudget >= activityCostValue;
  }

  private calculateAverageSpending(trips: Trip[]): number {
    if (trips.length === 0) return 0;
    return trips.reduce((sum, trip) => sum + (trip.budget || 0), 0) / trips.length;
  }

  private getSeason(month: number): string {
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'fall';
    return 'winter';
  }

  private estimateDestinationCost(dest: any, budget: number): number {
    const costMap = { budget: 0.6, 'mid-range': 0.8, luxury: 1.2 };
    const multiplier = costMap[dest.cost as keyof typeof costMap] || 0.8;
    return budget * multiplier;
  }

  private estimateActivityCost(activity: any, budget: number): number {
    const costMap = { free: 0, low: 0.05, mid: 0.1, high: 0.2 };
    const multiplier = costMap[activity.cost as keyof typeof costMap] || 0.1;
    return budget * multiplier;
  }

  private estimateAccommodationCost(type: string, budget: number): number {
    const costMap = { hostel: 0.2, hotel: 0.4, 'boutique hotel': 0.6, apartment: 0.5 };
    const multiplier = costMap[type as keyof typeof costMap] || 0.4;
    return budget * multiplier;
  }

  private generateDestinationReason(dest: any, context: RecommendationContext): string {
    const reasons = [];
    if (this.matchesInterests(dest.category, context.userPreferences.interests)) {
      reasons.push(`matches your interest in ${dest.category}`);
    }
    if (this.isGoodSeason(dest.bestSeason, context.currentSeason)) {
      reasons.push(`perfect for ${context.currentSeason} travel`);
    }
    if (this.matchesBudget(dest.cost, context.userPreferences.budget)) {
      reasons.push(`fits your ${dest.cost} budget`);
    }
    return reasons.join(', ');
  }

  private generateActivityReason(activity: any, context: RecommendationContext): string {
    const reasons = [];
    if (this.matchesInterests(activity.category, context.userPreferences.interests)) {
      reasons.push(`matches your interest in ${activity.category}`);
    }
    if (this.matchesActivityBudget(activity.cost, context.userPreferences.budget)) {
      reasons.push(`fits your budget (${activity.cost})`);
    }
    return reasons.join(', ');
  }

  private getDestinationBasedOn(dest: any, context: RecommendationContext): string[] {
    const basedOn = ['destination analysis'];
    if (this.matchesInterests(dest.category, context.userPreferences.interests)) {
      basedOn.push('your interests');
    }
    if (this.isGoodSeason(dest.bestSeason, context.currentSeason)) {
      basedOn.push('current season');
    }
    return basedOn;
  }

  private getActivityBasedOn(activity: any, context: RecommendationContext): string[] {
    const basedOn = ['activity analysis'];
    if (this.matchesInterests(activity.category, context.userPreferences.interests)) {
      basedOn.push('your interests');
    }
    if (this.matchesActivityBudget(activity.cost, context.userPreferences.budget)) {
      basedOn.push('your budget');
    }
    return basedOn;
  }

  private getDestinationAlternatives(dest: any, context: RecommendationContext): Recommendation[] {
    // Return similar destinations
    return this.destinations
      .filter(d => d.category === dest.category && d.name !== dest.name)
      .slice(0, 2)
      .map(alt => ({
        id: `alt-${alt.name.toLowerCase()}`,
        type: 'destination' as const,
        title: `Visit ${alt.name}, ${alt.country}`,
        description: `Alternative ${alt.category} destination`,
        confidence: 60,
        priority: 'low' as const,
        category: alt.category,
        tags: [alt.category, alt.cost],
      }));
  }

  private getActivityAlternatives(activity: any, context: RecommendationContext): Recommendation[] {
    // Return similar activities
    return this.activities
      .filter(a => a.category === activity.category && a.name !== activity.name)
      .slice(0, 2)
      .map(alt => ({
        id: `alt-${alt.name.toLowerCase().replace(/\s+/g, '-')}`,
        type: 'activity' as const,
        title: alt.name,
        description: `Alternative ${alt.category} activity`,
        confidence: 60,
        priority: 'low' as const,
        category: alt.category,
        tags: [alt.category, alt.cost],
      }));
  }
}

export const recommendationsService = new RecommendationsService();


