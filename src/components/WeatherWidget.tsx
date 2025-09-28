import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import { getWeatherApiKey } from '../config/api';

interface WeatherData {
  current: {
    temperature: number;
    condition: string;
    humidity: number;
    windSpeed: number;
    icon: string;
  };
  forecast: Array<{
    date: string;
    day: string;
    high: number;
    low: number;
    condition: string;
    icon: string;
    precipitation: number;
  }>;
}

interface WeatherWidgetProps {
  destination: string;
  onRefresh?: () => void;
  onDismiss?: () => void;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({ destination, onRefresh, onDismiss }) => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Real weather data from OpenWeatherMap API
  const fetchWeatherData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Extract city name from destination (remove country if present)
      const cityName = destination.split(',')[0].trim();
      
      // OpenWeatherMap API call
      const API_KEY = getWeatherApiKey();
      
      // Check if we're in demo mode
      if (API_KEY === 'demo') {
        // Show demo data
        const demoWeatherData: WeatherData = {
          current: {
            temperature: 22,
            condition: 'Clear',
            humidity: 65,
            windSpeed: 12,
            icon: 'sunny',
          },
          forecast: [
            { date: '2024-01-15', day: 'Mon', high: 25, low: 18, condition: 'Clear', icon: 'sunny', precipitation: 0 },
            { date: '2024-01-16', day: 'Tue', high: 23, low: 16, condition: 'Clouds', icon: 'cloudy', precipitation: 20 },
            { date: '2024-01-17', day: 'Wed', high: 20, low: 14, condition: 'Rain', icon: 'rainy', precipitation: 80 },
            { date: '2024-01-18', day: 'Thu', high: 24, low: 17, condition: 'Clear', icon: 'sunny', precipitation: 10 },
            { date: '2024-01-19', day: 'Fri', high: 26, low: 19, condition: 'Clear', icon: 'sunny', precipitation: 0 },
          ],
        };
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setWeatherData(demoWeatherData);
        return;
      }
      
      const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cityName)}&appid=${API_KEY}&units=metric`;
      const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(cityName)}&appid=${API_KEY}&units=metric`;
      
      // Fetch current weather and forecast in parallel
      const [currentResponse, forecastResponse] = await Promise.all([
        fetch(currentWeatherUrl),
        fetch(forecastUrl)
      ]);
      
      if (!currentResponse.ok || !forecastResponse.ok) {
        throw new Error('Weather data not available for this location');
      }
      
      const currentData = await currentResponse.json();
      const forecastData = await forecastResponse.json();
      
      // Transform API data to our format
      const weatherData: WeatherData = {
        current: {
          temperature: Math.round(currentData.main.temp),
          condition: currentData.weather[0].main,
          humidity: currentData.main.humidity,
          windSpeed: Math.round(currentData.wind.speed * 3.6), // Convert m/s to km/h
          icon: getWeatherIconFromCode(currentData.weather[0].icon),
        },
        forecast: processForecastData(forecastData.list),
      };
      
      setWeatherData(weatherData);
    } catch (err) {
      console.error('Weather API Error:', err);
      setError('Failed to fetch weather data. Please check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to map OpenWeatherMap icon codes to our icon names
  const getWeatherIconFromCode = (iconCode: string): string => {
    const iconMap: { [key: string]: string } = {
      '01d': 'sunny',
      '01n': 'moon',
      '02d': 'partly-sunny',
      '02n': 'cloudy-night',
      '03d': 'cloudy',
      '03n': 'cloudy',
      '04d': 'cloudy',
      '04n': 'cloudy',
      '09d': 'rainy',
      '09n': 'rainy',
      '10d': 'rainy',
      '10n': 'rainy',
      '11d': 'thunderstorm',
      '11n': 'thunderstorm',
      '13d': 'snow',
      '13n': 'snow',
      '50d': 'partly-sunny',
      '50n': 'cloudy-night',
    };
    return iconMap[iconCode] || 'sunny';
  };

  // Helper function to process 5-day forecast data
  const processForecastData = (forecastList: any[]): Array<{
    date: string;
    day: string;
    high: number;
    low: number;
    condition: string;
    icon: string;
    precipitation: number;
  }> => {
    const dailyForecasts: { [key: string]: any } = {};
    
    // Group forecasts by date
    forecastList.forEach((item) => {
      const date = item.dt_txt.split(' ')[0];
      if (!dailyForecasts[date]) {
        dailyForecasts[date] = {
          temps: [],
          conditions: [],
          icons: [],
          precipitation: 0,
        };
      }
      
      dailyForecasts[date].temps.push(item.main.temp);
      dailyForecasts[date].conditions.push(item.weather[0].main);
      dailyForecasts[date].icons.push(item.weather[0].icon);
      dailyForecasts[date].precipitation += item.pop * 100; // Convert to percentage
    });
    
    // Process each day
    const processedForecasts = Object.entries(dailyForecasts).slice(0, 5).map(([date, data]) => {
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const dayName = dayNames[new Date(date).getDay()];
      
      return {
        date,
        day: dayName,
        high: Math.round(Math.max(...data.temps)),
        low: Math.round(Math.min(...data.temps)),
        condition: data.conditions[0], // Use first condition of the day
        icon: getWeatherIconFromCode(data.icons[0]),
        precipitation: Math.round(data.precipitation / data.temps.length),
      };
    });
    
    return processedForecasts;
  };

  useEffect(() => {
    if (destination) {
      fetchWeatherData();
    }
  }, [destination]);

  const getWeatherIcon = (iconName: string) => {
    const iconMap: { [key: string]: keyof typeof Ionicons.glyphMap } = {
      sunny: 'sunny',
      moon: 'moon',
      'partly-sunny': 'partly-sunny',
      'cloudy-night': 'cloudy-night',
      cloudy: 'cloudy',
      rainy: 'rainy',
      thunderstorm: 'thunderstorm',
      snow: 'snow',
    };
    return iconMap[iconName] || 'sunny';
  };

  const formatTemperature = (temp: number) => `${temp}°C`;

  if (!destination) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Ionicons name="partly-sunny" size={24} color={colors.text.secondary} />
          <Text style={styles.title}>Weather Forecast</Text>
        </View>
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>Select a destination to see weather</Text>
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Ionicons name="partly-sunny" size={24} color={colors.primary.main} />
          <Text style={styles.title}>Weather Forecast</Text>
          <TouchableOpacity onPress={fetchWeatherData} style={styles.refreshButton}>
            <Ionicons name="refresh" size={20} color={colors.primary.main} />
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.main} />
          <Text style={styles.loadingText}>Loading weather data...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Ionicons name="partly-sunny" size={24} color={colors.status.error} />
          <Text style={styles.title}>Weather Forecast</Text>
          <TouchableOpacity onPress={fetchWeatherData} style={styles.refreshButton}>
            <Ionicons name="refresh" size={20} color={colors.primary.main} />
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="warning" size={32} color={colors.status.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={fetchWeatherData} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!weatherData) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="partly-sunny" size={24} color={colors.primary.main} />
        <Text style={styles.title}>Weather Forecast</Text>
        {getWeatherApiKey() === 'demo' && (
          <View style={styles.demoBadge}>
            <Text style={styles.demoText}>DEMO</Text>
          </View>
        )}
        <View style={styles.headerButtons}>
          <TouchableOpacity onPress={fetchWeatherData} style={styles.refreshButton}>
            <Ionicons name="refresh" size={20} color={colors.primary.main} />
          </TouchableOpacity>
          {onDismiss && (
            <TouchableOpacity onPress={onDismiss} style={styles.dismissButton}>
              <Ionicons name="close" size={20} color={colors.text.secondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Current Weather */}
      <View style={styles.currentWeather}>
        <View style={styles.currentMain}>
          <View style={styles.temperatureContainer}>
            <Text style={styles.temperature}>{formatTemperature(weatherData.current.temperature)}</Text>
            <Text style={styles.condition}>{weatherData.current.condition}</Text>
          </View>
          <Ionicons 
            name={getWeatherIcon(weatherData.current.icon)} 
            size={48} 
            color={colors.primary.main} 
          />
        </View>
        
        <View style={styles.currentDetails}>
          <View style={styles.detailItem}>
            <Ionicons name="water" size={16} color={colors.text.secondary} />
            <Text style={styles.detailText}>{weatherData.current.humidity}%</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="leaf" size={16} color={colors.text.secondary} />
            <Text style={styles.detailText}>{weatherData.current.windSpeed} km/h</Text>
          </View>
        </View>
      </View>

      {/* 5-Day Forecast */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.forecastContainer}>
        {weatherData.forecast.map((day, index) => (
          <View key={index} style={styles.forecastDay}>
            <Text style={styles.forecastDayName}>{day.day}</Text>
            <Ionicons 
              name={getWeatherIcon(day.icon)} 
              size={24} 
              color={colors.text.primary} 
            />
            <Text style={styles.forecastHigh}>{formatTemperature(day.high)}</Text>
            <Text style={styles.forecastLow}>{formatTemperature(day.low)}</Text>
            <View style={styles.precipitationContainer}>
              <Ionicons name="rainy" size={12} color={colors.text.secondary} />
              <Text style={styles.precipitationText}>{day.precipitation}%</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography?.fontSize?.lg || 18,
      fontFamily: typography?.fontFamily?.semibold || 'System',
    color: colors.text.primary,
    marginLeft: spacing.sm,
    flex: 1,
  },
  refreshButton: {
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface.secondary,
  },
  placeholder: {
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
  },
  placeholderText: {
    fontSize: typography?.fontSize?.base || 16,
      fontFamily: typography?.fontFamily?.regular || 'System',
    color: colors.text.secondary,
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
  },
  loadingText: {
    fontSize: typography?.fontSize?.base || 16,
      fontFamily: typography?.fontFamily?.regular || 'System',
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
  },
  errorText: {
    fontSize: typography?.fontSize?.base || 16,
      fontFamily: typography?.fontFamily?.regular || 'System',
    color: colors.status.error,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  retryButton: {
    backgroundColor: colors.primary.main,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  retryButtonText: {
    fontSize: typography?.fontSize?.sm || 14,
      fontFamily: typography?.fontFamily?.semibold || 'System',
    color: colors.primary.contrastText,
  },
  currentWeather: {
    marginBottom: spacing.lg,
  },
  currentMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  temperatureContainer: {
    flex: 1,
  },
  temperature: {
    fontSize: typography?.fontSize?.['4xl'] || 32,
      fontFamily: typography?.fontFamily?.bold || 'System',
    color: colors.text.primary,
    lineHeight: typography?.lineHeight?.['4xl'] || 40,
  },
  condition: {
    fontSize: typography?.fontSize?.base || 16,
      fontFamily: typography?.fontFamily?.regular || 'System',
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  currentDetails: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  detailText: {
    fontSize: typography?.fontSize?.sm || 14,
      fontFamily: typography?.fontFamily?.medium || 'System',
    color: colors.text.secondary,
  },
  forecastContainer: {
    marginTop: spacing.sm,
  },
  forecastDay: {
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface.secondary,
    borderRadius: borderRadius.md,
    marginRight: spacing.sm,
    minWidth: 80,
  },
  forecastDayName: {
    fontSize: typography?.fontSize?.sm || 14,
      fontFamily: typography?.fontFamily?.semibold || 'System',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  forecastHigh: {
    fontSize: typography?.fontSize?.sm || 14,
      fontFamily: typography?.fontFamily?.semibold || 'System',
    color: colors.text.primary,
    marginTop: spacing.xs,
  },
  forecastLow: {
    fontSize: typography?.fontSize?.xs || 12,
      fontFamily: typography?.fontFamily?.regular || 'System',
    color: colors.text.secondary,
  },
  precipitationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  precipitationText: {
    fontSize: typography?.fontSize?.xs || 12,
      fontFamily: typography?.fontFamily?.regular || 'System',
    color: colors.text.secondary,
  },
  demoBadge: {
    backgroundColor: colors.accent.orange,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    marginLeft: spacing.sm,
  },
  demoText: {
    fontSize: typography?.fontSize?.xs || 10,
    fontFamily: typography?.fontFamily?.bold || 'System',
    color: colors.white,
    fontWeight: '700',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dismissButton: {
    padding: spacing.xs,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surface.secondary,
  },
});