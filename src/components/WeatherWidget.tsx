import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WeatherData, WeatherAlert, getWeatherData, getWeatherAlerts, getWeatherRecommendations, formatTemperature } from '../services/weatherService';

interface WeatherWidgetProps {
  location: string;
  compact?: boolean;
  onPress?: () => void;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({ location, compact = false, onPress }) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadWeatherData();
  }, [location]);

  const loadWeatherData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [weatherData, weatherAlerts] = await Promise.all([
        getWeatherData(location),
        getWeatherAlerts(location),
      ]);
      
      setWeather(weatherData);
      setAlerts(weatherAlerts);
      setRecommendations(getWeatherRecommendations(weatherData));
    } catch (err) {
      setError('Failed to load weather data');
      console.error('Weather loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning': return '⚠️';
      case 'danger': return '🚨';
      case 'severe': return '⛈️';
      default: return 'ℹ️';
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'warning': return '#F59E0B';
      case 'danger': return '#EF4444';
      case 'severe': return '#DC2626';
      default: return '#3B82F6';
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, compact && styles.compactContainer]}>
        <ActivityIndicator size="small" color="#4285F4" />
        <Text style={styles.loadingText}>Loading weather...</Text>
      </View>
    );
  }

  if (error || !weather) {
    return (
      <View style={[styles.container, compact && styles.compactContainer]}>
        <Ionicons name="cloud-offline" size={20} color="#9CA3AF" />
        <Text style={styles.errorText}>Weather unavailable</Text>
      </View>
    );
  }

  if (compact) {
    return (
      <TouchableOpacity style={styles.compactContainer} onPress={onPress}>
        <Text style={styles.compactIcon}>{weather.current.icon}</Text>
        <Text style={styles.compactTemp}>{formatTemperature(weather.current.temperature)}</Text>
        <Text style={styles.compactCondition}>{weather.current.condition}</Text>
        {alerts.length > 0 && (
          <View style={styles.alertBadge}>
            <Text style={styles.alertBadgeText}>{alerts.length}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.locationContainer}>
          <Ionicons name="location" size={16} color="#6B7280" />
          <Text style={styles.locationText}>{weather.location}</Text>
        </View>
        <TouchableOpacity onPress={loadWeatherData}>
          <Ionicons name="refresh" size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <View style={styles.currentWeather}>
        <View style={styles.temperatureContainer}>
          <Text style={styles.temperature}>{formatTemperature(weather.current.temperature)}</Text>
          <Text style={styles.condition}>{weather.current.condition}</Text>
          <Text style={styles.description}>{weather.current.description}</Text>
        </View>
        <Text style={styles.weatherIcon}>{weather.current.icon}</Text>
      </View>

      <View style={styles.details}>
        <View style={styles.detailItem}>
          <Ionicons name="water" size={16} color="#3B82F6" />
          <Text style={styles.detailText}>{weather.current.humidity}%</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="leaf" size={16} color="#10B981" />
          <Text style={styles.detailText}>{weather.current.windSpeed} km/h</Text>
        </View>
      </View>

      {alerts.length > 0 && (
        <View style={styles.alertsContainer}>
          <Text style={styles.alertsTitle}>Weather Alerts</Text>
          {alerts.map((alert, index) => (
            <View key={index} style={[styles.alert, { borderLeftColor: getAlertColor(alert.type) }]}>
              <Text style={styles.alertIcon}>{getAlertIcon(alert.type)}</Text>
              <View style={styles.alertContent}>
                <Text style={styles.alertTitle}>{alert.title}</Text>
                <Text style={styles.alertDescription}>{alert.description}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {recommendations.length > 0 && (
        <View style={styles.recommendationsContainer}>
          <Text style={styles.recommendationsTitle}>Recommendations</Text>
          {recommendations.map((rec, index) => (
            <Text key={index} style={styles.recommendationText}>{rec}</Text>
          ))}
        </View>
      )}

      <View style={styles.forecastContainer}>
        <Text style={styles.forecastTitle}>5-Day Forecast</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {weather.forecast.map((day, index) => (
            <View key={index} style={styles.forecastDay}>
              <Text style={styles.forecastDate}>
                {new Date(day.date).toLocaleDateString('en-GB', { weekday: 'short' })}
              </Text>
              <Text style={styles.forecastIcon}>{day.icon}</Text>
              <Text style={styles.forecastHigh}>{formatTemperature(day.high)}</Text>
              <Text style={styles.forecastLow}>{formatTemperature(day.low)}</Text>
              {day.precipitation > 30 && (
                <Text style={styles.forecastRain}>💧 {day.precipitation}%</Text>
              )}
            </View>
          ))}
        </ScrollView>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 8,
    borderRadius: 8,
    marginVertical: 4,
    position: 'relative',
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#6B7280',
  },
  errorText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#EF4444',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  currentWeather: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  temperatureContainer: {
    flex: 1,
  },
  temperature: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
  },
  condition: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '600',
    marginTop: 4,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  weatherIcon: {
    fontSize: 48,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  alertsContainer: {
    marginBottom: 16,
  },
  alertsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  alert: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
  },
  alertIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 2,
  },
  alertDescription: {
    fontSize: 12,
    color: '#A16207',
    lineHeight: 16,
  },
  alertBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  recommendationsContainer: {
    marginBottom: 16,
  },
  recommendationsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  recommendationText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
    lineHeight: 20,
  },
  forecastContainer: {
    marginTop: 8,
  },
  forecastTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  forecastDay: {
    alignItems: 'center',
    padding: 12,
    marginRight: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    minWidth: 80,
  },
  forecastDate: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 4,
  },
  forecastIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  forecastHigh: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  forecastLow: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  forecastRain: {
    fontSize: 10,
    color: '#3B82F6',
    marginTop: 2,
  },
  compactIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  compactTemp: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginRight: 8,
  },
  compactCondition: {
    fontSize: 12,
    color: '#6B7280',
    flex: 1,
  },
});
