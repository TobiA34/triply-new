import { Platform } from 'react-native';

interface AIServiceConfig {
  apiKey: string;
  baseURL: string;
}

class AIService {
  private config: AIServiceConfig | null = null;

  initialize(config: AIServiceConfig) {
    this.config = config;
  }

  async generateItinerary(prompt: string) {
    if (!this.config) {
      throw new Error('AIService not initialized');
    }

    try {
      const response = await fetch(`${this.config.baseURL}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
          'User-Agent': `Triply/${Platform.OS}`,
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate itinerary');
      }

      return await response.json();
    } catch (error) {
      console.error('Error generating itinerary:', error);
      throw error;
    }
  }
}

export const aiService = new AIService();
