import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { useThemeColors } from '../hooks/useThemeColors';
import { useLocalization } from '../contexts/LocalizationContext';
import { SetupScreen } from '../screens/SetupScreen';
import { SavedTripsScreen } from '../screens/SavedTripsScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { ActivityManagementScreen } from '../screens/ActivityManagementScreen';
import { Trip } from '../services/database';

type TabName = 'Create' | 'Trips' | 'Settings';

export const CustomTabNavigator = () => {
  const { isDark } = useTheme();
  const colors = useThemeColors();
  const { t } = useLocalization();
  const insets = useSafeAreaInsets();
  
  // Colors are now guaranteed to be properly structured by useThemeColors hook
  
  const styles = createStyles(colors);
  const [activeTab, setActiveTab] = useState<TabName>('Trips');
  const [activeTrip, setActiveTrip] = useState<Trip | undefined>(undefined);
  const [showActivities, setShowActivities] = useState(false);

  const navigateToTab = (tabName: TabName) => {
    setActiveTab(tabName);
  };

  const renderScreen = () => {
    switch (activeTab) {
      case 'Create':
        return <SetupScreen onNavigateToTrips={() => navigateToTab('Trips')} />;
      case 'Trips':
        return (
          <SavedTripsScreen
            onNavigateToSetup={() => navigateToTab('Create')}
            onOpenActivities={(trip) => {
              setActiveTrip(trip);
              setShowActivities(true);
            }}
          />
        );
      case 'Settings':
        return <SettingsScreen />;
      default:
        return <SetupScreen onNavigateToTrips={() => navigateToTab('Trips')} />;
    }
  };

  const tabs = useMemo(() => [
    { name: 'Create' as TabName, icon: 'add-circle-outline', activeIcon: 'add-circle', label: t('nav.setup') },
    { name: 'Trips' as TabName, icon: 'map-outline', activeIcon: 'map', label: t('nav.trips') },
    { name: 'Settings' as TabName, icon: 'settings-outline', activeIcon: 'settings', label: t('nav.settings') },
  ], [t]);

  return (
      <View style={[styles.container, { backgroundColor: colors.background.default }]}>
      <View style={styles.screenContainer}>
        {renderScreen()}
      </View>
        <Modal visible={showActivities} animationType="slide" onRequestClose={() => setShowActivities(false)}>
          <ActivityManagementScreen trip={activeTrip} onClose={() => setShowActivities(false)} />
        </Modal>
      <SafeAreaView edges={['bottom']} style={{ backgroundColor: colors.surface.primary }}>
      <View style={[
        styles.tabBar,
        { 
          backgroundColor: colors.surface.primary, 
          borderTopColor: colors.border.light,
        }
      ]}> 
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.name}
            style={[
              styles.tab,
              activeTab === tab.name && [styles.activeTab, { backgroundColor: colors.surface.secondary }]
            ]}
            onPress={() => setActiveTab(tab.name)}
          >
            <Ionicons
              name={activeTab === tab.name ? tab.activeIcon as any : tab.icon as any}
              size={24}
              color={activeTab === tab.name ? colors.primary.main : colors.text.secondary}
              style={styles.tabIcon}
            />
            <Text style={[
              styles.tabLabel,
              { color: activeTab === tab.name ? colors.primary.main : colors.text.secondary },
              activeTab === tab.name && styles.activeTabLabel
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      </SafeAreaView>
    </View>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
  },
  screenContainer: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingBottom: 16,
    paddingTop: 8,
    minHeight: 70,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  activeTab: {
    borderRadius: 8,
    marginHorizontal: 4,
  },
  tabIcon: {
    marginBottom: 2,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 2,
  },
  activeTabLabel: {
    fontWeight: '600',
  },
});
