// API Configuration
// Replace these with your actual API keys

export const API_CONFIG = {
  // Get your free API key from: https://openweathermap.org/api
  OPENWEATHERMAP_API_KEY: 'YOUR_OPENWEATHERMAP_API_KEY',
  
  // ExchangeRate-API is free and doesn't require an API key
  // But you can use other services like Fixer.io or CurrencyLayer if needed
  EXCHANGE_RATE_API_URL: 'https://api.exchangerate-api.com/v4/latest',
  
  // Alternative paid APIs (uncomment if you want to use them)
  // FIXER_API_KEY: 'YOUR_FIXER_API_KEY',
  // CURRENCYLAYER_API_KEY: 'YOUR_CURRENCYLAYER_API_KEY',
};

// Helper function to get weather API key
export const getWeatherApiKey = (): string => {
  const key = API_CONFIG.OPENWEATHERMAP_API_KEY;
  if (key === 'YOUR_OPENWEATHERMAP_API_KEY') {
    console.warn('⚠️ Please set your OpenWeatherMap API key in src/config/api.ts');
    return 'demo'; // Fallback for demo purposes
  }
  return key;
};

// Helper function to get exchange rate API URL
export const getExchangeRateApiUrl = (): string => {
  return API_CONFIG.EXCHANGE_RATE_API_URL;
};
