export interface WeatherData {
  location: string;
  current: {
    temperature: number;
    condition: string;
    description: string;
    humidity: number;
    windSpeed: number;
    icon: string;
  };
  forecast: {
    date: string;
    high: number;
    low: number;
    condition: string;
    icon: string;
    precipitation: number;
  }[];
}

export interface WeatherAlert {
  type: 'warning' | 'info' | 'severe';
  title: string;
  description: string;
  severity: 'low' | 'moderate' | 'high' | 'extreme';
}

// Mock weather service - in production, integrate with OpenWeatherMap, AccuWeather, or similar
export const getWeatherData = async (location: string): Promise<WeatherData> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const weatherConditions = [
    { condition: 'Sunny', description: 'Clear skies', icon: '☀️' },
    { condition: 'Partly Cloudy', description: 'Some clouds', icon: '⛅' },
    { condition: 'Cloudy', description: 'Overcast', icon: '☁️' },
    { condition: 'Rainy', description: 'Light rain', icon: '🌧️' },
    { condition: 'Stormy', description: 'Thunderstorms', icon: '⛈️' },
    { condition: 'Snowy', description: 'Light snow', icon: '❄️' },
    { condition: 'Foggy', description: 'Dense fog', icon: '🌫️' },
  ];
  
  const randomCondition = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];
  const baseTemp = 20 + Math.random() * 15; // 20-35°C
  
  // Generate 5-day forecast
  const forecast = Array.from({ length: 5 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    const dayCondition = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];
    const dayTemp = baseTemp + (Math.random() - 0.5) * 10;
    
    return {
      date: date.toISOString().split('T')[0],
      high: Math.round(dayTemp + Math.random() * 5),
      low: Math.round(dayTemp - Math.random() * 5),
      condition: dayCondition.condition,
      icon: dayCondition.icon,
      precipitation: Math.round(Math.random() * 80),
    };
  });
  
  return {
    location,
    current: {
      temperature: Math.round(baseTemp),
      condition: randomCondition.condition,
      description: randomCondition.description,
      humidity: Math.round(40 + Math.random() * 40),
      windSpeed: Math.round(5 + Math.random() * 15),
      icon: randomCondition.icon,
    },
    forecast,
  };
};

export const getWeatherAlerts = async (location: string): Promise<WeatherAlert[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const alerts: WeatherAlert[] = [];
  
  // Randomly generate weather alerts (20% chance)
  if (Math.random() < 0.2) {
    const alertTypes = [
      {
        type: 'warning' as const,
        title: 'High UV Index',
        description: 'UV index is very high today. Remember to wear sunscreen and protective clothing.',
        severity: 'moderate' as const,
      },
      {
        type: 'info' as const,
        title: 'Temperature Drop Expected',
        description: 'Temperatures will drop significantly tomorrow. Pack warm clothing.',
        severity: 'low' as const,
      },
      {
        type: 'severe' as const,
        title: 'Severe Weather Warning',
        description: 'Heavy rain and strong winds expected. Consider rescheduling outdoor activities.',
        severity: 'high' as const,
      },
    ];
    
    const randomAlert = alertTypes[Math.floor(Math.random() * alertTypes.length)];
    alerts.push(randomAlert);
  }
  
  return alerts;
};

export const getWeatherRecommendations = (weather: WeatherData): string[] => {
  const recommendations: string[] = [];
  const temp = weather.current.temperature;
  const condition = weather.current.condition.toLowerCase();
  
  // Temperature-based recommendations
  if (temp > 30) {
    recommendations.push('🌡️ Hot weather - stay hydrated and seek shade');
    recommendations.push('👕 Wear light, breathable clothing');
  } else if (temp < 10) {
    recommendations.push('🧥 Cold weather - dress in layers');
    recommendations.push('🧤 Bring gloves and warm accessories');
  } else {
    recommendations.push('👔 Comfortable weather - light layers recommended');
  }
  
  // Condition-based recommendations
  if (condition.includes('rain')) {
    recommendations.push('☔ Bring an umbrella or rain jacket');
    recommendations.push('👟 Wear waterproof shoes');
  } else if (condition.includes('sunny')) {
    recommendations.push('🧴 Apply sunscreen regularly');
    recommendations.push('🕶️ Wear sunglasses and a hat');
  } else if (condition.includes('wind')) {
    recommendations.push('🧥 Wear wind-resistant clothing');
  }
  
  // Humidity recommendations
  if (weather.current.humidity > 70) {
    recommendations.push('💧 High humidity - stay hydrated');
  }
  
  return recommendations;
};

export const formatTemperature = (temp: number, unit: 'C' | 'F' = 'C'): string => {
  if (unit === 'F') {
    const fahrenheit = (temp * 9/5) + 32;
    return `${Math.round(fahrenheit)}°F`;
  }
  return `${Math.round(temp)}°C`;
};

export const getWeatherIcon = (condition: string): string => {
  const iconMap: { [key: string]: string } = {
    'sunny': '☀️',
    'clear': '☀️',
    'partly cloudy': '⛅',
    'cloudy': '☁️',
    'overcast': '☁️',
    'rainy': '🌧️',
    'rain': '🌧️',
    'stormy': '⛈️',
    'thunderstorm': '⛈️',
    'snowy': '❄️',
    'snow': '❄️',
    'foggy': '🌫️',
    'fog': '🌫️',
  };
  
  return iconMap[condition.toLowerCase()] || '🌤️';
};
