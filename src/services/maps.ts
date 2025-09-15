import { Platform } from 'react-native';

interface Location {
  latitude: number;
  longitude: number;
  name: string;
}

export const getMapsLink = (location: Location) => {
  const { latitude, longitude, name } = location;
  const encodedName = encodeURIComponent(name);
  
  if (Platform.OS === 'ios') {
    return `maps://maps.apple.com/?q=${encodedName}&ll=${latitude},${longitude}`;
  }
  
  return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
};

export const getStaticMapImage = (location: Location, apiKey: string) => {
  const { latitude, longitude } = location;
  return `https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=15&size=600x300&maptype=roadmap&markers=color:red%7C${latitude},${longitude}&key=${apiKey}`;
};
