import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SetupScreen } from '../screens/SetupScreen';
import { SavedTripsScreen } from '../screens/SavedTripsScreen';
import { ItineraryScreen } from '../screens/ItineraryScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

type TabName = 'Create' | 'Trips' | 'AI' | 'Settings';

export const CustomTabNavigator = () => {
  const [activeTab, setActiveTab] = useState<TabName>('Create');

  const renderScreen = () => {
    switch (activeTab) {
      case 'Create':
        return <SetupScreen />;
      case 'Trips':
        return <SavedTripsScreen />;
      case 'AI':
        return <ItineraryScreen />;
      case 'Settings':
        return <SettingsScreen />;
      default:
        return <SetupScreen />;
    }
  };

  const tabs = [
    { name: 'Create' as TabName, icon: 'add-circle-outline', activeIcon: 'add-circle', label: 'Create' },
    { name: 'Trips' as TabName, icon: 'map-outline', activeIcon: 'map', label: 'Trips' },
    { name: 'AI' as TabName, icon: 'chatbubble-outline', activeIcon: 'chatbubble', label: 'AI' },
    { name: 'Settings' as TabName, icon: 'settings-outline', activeIcon: 'settings', label: 'Settings' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.screenContainer}>
        {renderScreen()}
      </View>
      <View style={styles.tabBar}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.name}
            style={[
              styles.tab,
              activeTab === tab.name && styles.activeTab
            ]}
            onPress={() => setActiveTab(tab.name)}
          >
            <Ionicons
              name={activeTab === tab.name ? tab.activeIcon as any : tab.icon as any}
              size={24}
              color={activeTab === tab.name ? '#4285F4' : '#6B7280'}
              style={styles.tabIcon}
            />
            <Text style={[
              styles.tabLabel,
              activeTab === tab.name && styles.activeTabLabel
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  screenContainer: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingBottom: 8,
    paddingTop: 8,
    height: 60,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  activeTab: {
    backgroundColor: '#F0F7FF',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  tabIcon: {
    marginBottom: 2,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeTabLabel: {
    color: '#4285F4',
    fontWeight: '600',
  },
});
