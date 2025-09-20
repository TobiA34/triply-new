// API Configuration
// Set your OpenWeatherMap API key here
// Get your free API key from: https://openweathermap.org/api

export const getWeatherApiKey = (): string => {
  // For demo purposes, return 'demo' to use mock data
  // Replace with your actual OpenWeatherMap API key for real weather data
  return 'demo';
  
  // Example with real API key:
  // return 'your_openweathermap_api_key_here';
};

// Exchange rate API configuration
export const getExchangeRateApiUrl = (): string => {
  // Using ExchangeRate-API (free tier: 1500 requests/month)
  // Get your free API key from: https://exchangerate-api.com/
  return 'https://api.exchangerate-api.com/v4/latest';
  
  // Alternative: Fixer.io (requires API key)
  // return 'https://api.fixer.io/latest';
};

// Other API configurations can be added here
export const API_ENDPOINTS = {
  WEATHER: 'https://api.openweathermap.org/data/2.5',
  EXCHANGE_RATE: 'https://api.exchangerate-api.com/v4/latest',
  // Add other API endpoints as needed
} as const;