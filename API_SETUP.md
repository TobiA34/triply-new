# 🌐 API Setup Guide

This app now uses real APIs for weather and currency data. Follow these steps to set up the APIs:

## 🌤️ Weather API Setup (OpenWeatherMap)

1. **Get a free API key:**
   - Go to [OpenWeatherMap](https://openweathermap.org/api)
   - Sign up for a free account
   - Get your API key from the dashboard

2. **Configure the API key:**
   - Open `src/config/api.ts`
   - Replace `YOUR_OPENWEATHERMAP_API_KEY` with your actual API key
   ```typescript
   OPENWEATHERMAP_API_KEY: 'your_actual_api_key_here',
   ```

3. **API Limits:**
   - Free tier: 1,000 calls/day
   - Perfect for development and small apps

## 💱 Currency API Setup (ExchangeRate-API)

**Good news!** The currency converter uses ExchangeRate-API which is completely free and doesn't require an API key.

- **No setup required** - works out of the box
- **Free tier:** 1,500 requests/month
- **Real-time rates** updated daily

## 🚀 Alternative APIs (Optional)

If you need higher limits or different features, you can use these paid alternatives:

### Weather APIs:
- **AccuWeather** - More detailed forecasts
- **WeatherAPI** - Higher limits
- **Climacell** - Hyperlocal weather

### Currency APIs:
- **Fixer.io** - Professional currency data
- **CurrencyLayer** - Real-time rates
- **Alpha Vantage** - Financial data

To use these, update the configuration in `src/config/api.ts`.

## 🔧 Configuration

All API settings are in `src/config/api.ts`:

```typescript
export const API_CONFIG = {
  OPENWEATHERMAP_API_KEY: 'your_key_here',
  EXCHANGE_RATE_API_URL: 'https://api.exchangerate-api.com/v4/latest',
};
```

## 🐛 Troubleshooting

### Weather API Issues:
- **401 Unauthorized:** Check your API key
- **404 Not Found:** City name not recognized
- **429 Too Many Requests:** Rate limit exceeded

### Currency API Issues:
- **Network Error:** Check internet connection
- **Invalid Currency:** Currency code not supported

## 📱 Testing

1. **Weather Widget:**
   - Enter a city name (e.g., "Paris, France")
   - Weather data should load automatically
   - Check console for any API errors

2. **Currency Converter:**
   - Select different currencies
   - Enter amounts to convert
   - Rates should update in real-time

## 🔒 Security Notes

- **Never commit API keys** to version control
- **Use environment variables** in production
- **Implement rate limiting** for production apps
- **Add error handling** for API failures

## 📊 API Usage Monitoring

Monitor your API usage:
- **OpenWeatherMap:** Check your dashboard
- **ExchangeRate-API:** Check response headers for remaining requests

---

**Need help?** Check the API documentation or contact support for the respective services.
