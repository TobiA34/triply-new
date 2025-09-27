import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Switch,
  Alert,
} from 'react-native';
import { useCurrency, CURRENCIES, Currency, CurrencyInfo } from '../contexts/CurrencyContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLocalization } from '../contexts/LocalizationContext';
import { useCompactMode } from '../contexts/CompactModeContext';
import { useThemeColors } from '../hooks/useThemeColors';
import { notificationService } from '../services/notificationService';
import { offlineService } from '../services/offlineService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { HelpCenter } from '../components/HelpCenter';
import { FAQ } from '../components/FAQ';
import { ContactSupport } from '../components/ContactSupport';
import { BugReport } from '../components/BugReport';
import { FeatureRequest } from '../components/FeatureRequest';
import { RateApp } from '../components/RateApp';

export const SettingsScreen = () => {
  const currencyContext = useCurrency();
  const { currency, setCurrency, getCurrencyInfo } = currencyContext || { 
    currency: 'USD' as Currency, 
    setCurrency: () => {}, 
    getCurrencyInfo: (curr: Currency) => CURRENCIES[0] 
  };
  const { theme, toggleTheme, isDark } = useTheme();
  const { language, setLanguage, t } = useLocalization();
  const { isCompactMode, toggleCompactMode } = useCompactMode();
  const colors = useThemeColors();
  
  // Debug logging
  console.log('SettingsScreen render - theme:', theme, 'isDark:', isDark);
  console.log('SettingsScreen render - language:', language);
  console.log('SettingsScreen render - darkMode translation:', t('settings.darkMode'));
  console.log('SettingsScreen render - language translation:', t('settings.language'));
  
  // Colors are now guaranteed to be properly structured by useThemeColors hook
  
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyInfo>(getCurrencyInfo(currency));
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [offlineMode, setOfflineMode] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [pendingChanges, setPendingChanges] = useState(0);
  
  // Support feature states
  const [showHelpCenter, setShowHelpCenter] = useState(false);
  const [showFAQ, setShowFAQ] = useState(false);
  const [showContactSupport, setShowContactSupport] = useState(false);
  const [showBugReport, setShowBugReport] = useState(false);
  const [showFeatureRequest, setShowFeatureRequest] = useState(false);
  const [showRateApp, setShowRateApp] = useState(false);

  useEffect(() => {
    loadSettings();
    loadOfflineStatus();
  }, []);

  const loadSettings = async () => {
    try {
      // Load notification settings
      const notificationSettings = await AsyncStorage.getItem('notification_settings');
      if (notificationSettings) {
        setNotificationsEnabled(JSON.parse(notificationSettings));
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const loadOfflineStatus = async () => {
    try {
      const status = await offlineService.getOfflineStatus();
      setLastSync(status.lastSync);
      setPendingChanges(status.pendingChanges);
    } catch (error) {
      console.error('Failed to load offline status:', error);
    }
  };

  const handleSave = () => {
    setCurrency(selectedCurrency.code);
  };

  const handleNotificationToggle = async (value: boolean) => {
    try {
      setNotificationsEnabled(value);
      await AsyncStorage.setItem('notification_settings', JSON.stringify(value));
      
      if (value) {
        const initialized = await notificationService.initialize();
        if (!initialized) {
          Alert.alert(
            t('alert.permissionRequired'),
            t('alert.notificationPermissionMessage'),
            [{ text: t('common.ok') }]
          );
          setNotificationsEnabled(false);
        }
      }
    } catch (error) {
      console.error('Failed to update notification settings:', error);
    }
  };

  const handleOfflineModeToggle = async (value: boolean) => {
    setOfflineMode(value);
    if (value) {
      await offlineService.syncPendingChanges();
      loadOfflineStatus();
    }
  };

  const handleSyncNow = async () => {
    try {
      const success = await offlineService.syncPendingChanges();
      if (success) {
        Alert.alert(t('common.success'), t('alert.dataSynced'));
        loadOfflineStatus();
      } else {
        Alert.alert(t('alert.syncFailed'), t('alert.syncFailed'));
      }
    } catch (error) {
      Alert.alert(t('common.error'), t('alert.syncError'));
    }
  };

  const handleClearCache = () => {
    Alert.alert(
      t('alert.clearCache'),
      t('alert.clearCacheConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.clear'),
          style: 'destructive',
          onPress: async () => {
            await offlineService.clearCache();
            loadOfflineStatus();
            Alert.alert(t('common.success'), t('alert.cacheCleared'));
          },
        },
      ]
    );
  };

  // Support feature handlers
  const handleHelpCenter = () => {
    setShowHelpCenter(true);
  };

  const handleFAQ = () => {
    setShowFAQ(true);
  };

  // Removed Video Tutorials feature

  const handleContactSupport = () => {
    setShowContactSupport(true);
  };

  const handleBugReport = () => {
    setShowBugReport(true);
  };

  const handleFeatureRequest = () => {
    setShowFeatureRequest(true);
  };

  const handleRateApp = () => {
    setShowRateApp(true);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.default }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={[styles.header, { backgroundColor: colors.background.default }]}>
          <Text style={[styles.title, { color: colors.text.primary }]}>⚙️ {t('settings.title')}</Text>
          <Text style={[styles.subtitle, { color: colors.text.secondary }]}>{t('settings.subtitle')}</Text>
        </View>

        {/* Theme Settings */}
        <View style={[styles.section, { backgroundColor: colors.surface.primary }]}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>🎨 {t('settings.theme')}</Text>
          <Text style={[styles.sectionDescription, { color: colors.text.secondary }]}>
            {t('settings.theme.description')}
          </Text>
          
          <View style={[styles.settingRow, { backgroundColor: colors.surface.secondary, borderColor: colors.border.light }]}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: colors.text.primary }]}>
                {t('settings.darkMode')}
              </Text>
              <Text style={[styles.settingDescription, { color: colors.text.secondary }]}>
                {t('settings.darkMode.description')}
              </Text>
            </View>
            <Switch
              key={`dark-mode-switch-${isDark}`}
              value={isDark}
              onValueChange={() => {
                console.log('Dark mode toggle pressed, current isDark:', isDark);
                toggleTheme();
              }}
              trackColor={{ false: colors.border.light, true: colors.primary.main }}
              thumbColor={isDark ? colors.primary.contrastText : colors.surface.primary}
              ios_backgroundColor={colors.border.light}
            />
          </View>

          <View style={[styles.settingRow, { backgroundColor: colors.surface.secondary, borderColor: colors.border.light }]}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: colors.text.primary }]}>{t('settings.compactMode')}</Text>
              <Text style={[styles.settingDescription, { color: colors.text.secondary }]}>
                {t('settings.compactMode.description')}
              </Text>
            </View>
            <Switch
              value={isCompactMode}
              onValueChange={toggleCompactMode}
              trackColor={{ false: colors.border.light, true: colors.primary.main }}
              thumbColor={colors.surface.primary}
            />
          </View>
        </View>

        {/* Language Settings */}
        <View style={[styles.section, { backgroundColor: colors.surface.primary }]}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>🌍 {t('settings.language')}</Text>
          <Text style={[styles.sectionDescription, { color: colors.text.secondary }]}>
            {t('settings.language.description')}
          </Text>
          
          <TouchableOpacity 
            style={[styles.settingButton, { backgroundColor: colors.surface.secondary, borderColor: colors.border.light }]}
            onPress={() => {
              Alert.alert(
                t('settings.language'),
                t('settings.language.description'),
                [
                  { text: t('settings.language.english'), onPress: () => setLanguage('en') },
                  { text: t('settings.language.spanish'), onPress: () => setLanguage('es') },
                  { text: t('settings.language.french'), onPress: () => setLanguage('fr') },
                  { text: t('settings.language.german'), onPress: () => setLanguage('de') },
                  { text: t('settings.language.italian'), onPress: () => setLanguage('it') },
                  { text: t('settings.language.portuguese'), onPress: () => setLanguage('pt') },
                  { text: t('settings.language.japanese'), onPress: () => setLanguage('ja') },
                  { text: t('settings.language.korean'), onPress: () => setLanguage('ko') },
                  { text: t('settings.language.chinese'), onPress: () => setLanguage('zh') },
                  { text: t('common.cancel'), style: 'cancel' },
                ]
              );
            }}
          >
            <Text style={[styles.settingButtonTitle, { color: colors.text.primary }]}>{t('settings.language.current')}</Text>
            <Text style={[styles.settingButtonDescription, { color: colors.text.secondary }]}>
              {language === 'en' ? t('settings.language.english') : 
               language === 'es' ? t('settings.language.spanish') : 
               language === 'fr' ? t('settings.language.french') : 
               language === 'de' ? t('settings.language.german') : 
               language === 'it' ? t('settings.language.italian') : 
               language === 'pt' ? t('settings.language.portuguese') : 
               language === 'ja' ? t('settings.language.japanese') : 
               language === 'ko' ? t('settings.language.korean') : 
               language === 'zh' ? t('settings.language.chinese') : 
               t('settings.language.english')}
            </Text>
          </TouchableOpacity>
        </View>





        <View style={[styles.section, { backgroundColor: colors.surface.primary }]}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>💰 {t('settings.currency')}</Text>
          <Text style={[styles.sectionDescription, { color: colors.text.secondary }]}>
            {t('settings.currency.description')}
          </Text>
          
          <View style={[styles.currentCurrency, { backgroundColor: colors.surface.secondary, borderColor: colors.border.light }]}>
            <Text style={[styles.currentCurrencyLabel, { color: colors.text.secondary }]}>{t('settings.currency.current')}</Text>
            <View style={styles.currentCurrencyDisplay}>
              <Text style={[styles.currentCurrencySymbol, { color: colors.text.primary }]}>{getCurrencyInfo(currency).symbol}</Text>
              <View style={styles.currentCurrencyInfo}>
                <Text style={[styles.currentCurrencyCode, { color: colors.text.primary }]}>{getCurrencyInfo(currency).code}</Text>
                <Text style={[styles.currentCurrencyName, { color: colors.text.secondary }]}>{getCurrencyInfo(currency).name}</Text>
              </View>
            </View>
          </View>

          <View style={styles.currencyGrid}>
            {CURRENCIES.map((curr) => (
              <TouchableOpacity
                key={curr.code}
                style={[
                  styles.currencyCard,
                  { backgroundColor: colors.surface.secondary, borderColor: colors.border.light },
                  selectedCurrency.code === curr.code && [styles.selectedCurrencyCard, { borderColor: colors.primary.main, backgroundColor: colors.primary.light + '20' }]
                ]}
                onPress={() => setSelectedCurrency(curr)}
              >
                <Text style={[styles.currencyCardSymbol, { color: colors.text.primary }]}>{curr.symbol}</Text>
                <Text style={[styles.currencyCardCode, { color: colors.text.primary }]}>{curr.code}</Text>
                <Text style={[styles.currencyCardName, { color: colors.text.secondary }]}>{curr.name}</Text>
                {selectedCurrency.code === curr.code && (
                  <View style={[styles.checkmarkContainer, { backgroundColor: colors.primary.main }]}>
                    <Text style={[styles.checkmark, { color: colors.primary.contrastText }]}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[
              styles.saveButton,
              { backgroundColor: colors.primary.main },
              selectedCurrency.code === currency && [styles.saveButtonDisabled, { backgroundColor: colors.border.light }]
            ]}
            onPress={handleSave}
            disabled={selectedCurrency.code === currency}
          >
            <Text style={[
              styles.saveButtonText,
              { color: colors.primary.contrastText },
              selectedCurrency.code === currency && [styles.saveButtonTextDisabled, { color: colors.text.disabled }]
            ]}>
              {selectedCurrency.code === currency ? t('common.noChanges') : t('common.save')}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.section, { backgroundColor: colors.surface.primary }]}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>🔔 {t('settings.notifications')}</Text>
          <Text style={[styles.sectionDescription, { color: colors.text.secondary }]}>
            {t('settings.notifications.description')}
          </Text>
          
          <View style={[styles.settingRow, { backgroundColor: colors.surface.secondary, borderColor: colors.border.light }]}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: colors.text.primary }]}>{t('settings.pushNotifications')}</Text>
              <Text style={[styles.settingDescription, { color: colors.text.secondary }]}>
                {t('settings.pushNotifications.description')}
              </Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={handleNotificationToggle}
              trackColor={{ false: colors.border.light, true: colors.primary.main }}
              thumbColor={colors.surface.primary}
            />
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: colors.surface.primary }]}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>📱 {t('settings.offlineMode')}</Text>
          <Text style={[styles.sectionDescription, { color: colors.text.secondary }]}>
            {t('settings.offlineMode.description')}
          </Text>
          
          <View style={[styles.settingRow, { backgroundColor: colors.surface.secondary, borderColor: colors.border.light }]}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: colors.text.primary }]}>{t('settings.enableOfflineMode')}</Text>
              <Text style={[styles.settingDescription, { color: colors.text.secondary }]}>
                {t('settings.enableOfflineMode.description')}
              </Text>
            </View>
            <Switch
              value={offlineMode}
              onValueChange={handleOfflineModeToggle}
              trackColor={{ false: colors.border.light, true: colors.primary.main }}
              thumbColor={colors.surface.primary}
            />
          </View>

          {offlineMode && (
            <View style={[styles.offlineStatus, { backgroundColor: colors.surface.secondary, borderColor: colors.border.light }]}>
              <View style={styles.statusRow}>
                <Text style={[styles.statusLabel, { color: colors.text.secondary }]}>{t('settings.lastSync')}</Text>
                <Text style={[styles.statusValue, { color: colors.text.primary }]}>
                  {lastSync ? new Date(lastSync).toLocaleString() : t('common.never')}
                </Text>
              </View>
              <View style={styles.statusRow}>
                <Text style={[styles.statusLabel, { color: colors.text.secondary }]}>{t('settings.pendingChanges')}</Text>
                <Text style={[styles.statusValue, { color: colors.text.primary }]}>{pendingChanges}</Text>
              </View>
              
              <View style={styles.offlineActions}>
                <TouchableOpacity style={[styles.syncButton, { backgroundColor: colors.primary.main }]} onPress={handleSyncNow}>
                  <Text style={[styles.syncButtonText, { color: colors.primary.contrastText }]}>{t('settings.syncNow')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.clearButton, { backgroundColor: colors.surface.tertiary }]} onPress={handleClearCache}>
                  <Text style={[styles.clearButtonText, { color: colors.text.secondary }]}>{t('settings.clearCache')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Data & Privacy section removed as requested */}

        <View style={[styles.section, { backgroundColor: colors.surface.primary }]}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>🆘 {t('settings.support')}</Text>
          <Text style={[styles.sectionDescription, { color: colors.text.secondary }]}>
            {t('settings.support.description')}
          </Text>
          
          <TouchableOpacity 
            style={[styles.settingButton, { backgroundColor: colors.surface.secondary, borderColor: colors.border.light }]}
            onPress={handleHelpCenter}
          >
            <Text style={[styles.settingButtonTitle, { color: colors.text.primary }]}>{t('settings.helpCenter')}</Text>
            <Text style={[styles.settingButtonDescription, { color: colors.text.secondary }]}>{t('settings.helpCenter.description')}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.settingButton, { backgroundColor: colors.surface.secondary, borderColor: colors.border.light }]}
            onPress={handleFAQ}
          >
            <Text style={[styles.settingButtonTitle, { color: colors.text.primary }]}>{t('settings.faq')}</Text>
            <Text style={[styles.settingButtonDescription, { color: colors.text.secondary }]}>{t('settings.faq.description')}</Text>
          </TouchableOpacity>
          
          {/* Video Tutorials entry removed */}
          
          <TouchableOpacity 
            style={[styles.settingButton, { backgroundColor: colors.surface.secondary, borderColor: colors.border.light }]}
            onPress={handleContactSupport}
          >
            <Text style={[styles.settingButtonTitle, { color: colors.text.primary }]}>{t('settings.contactSupport')}</Text>
            <Text style={[styles.settingButtonDescription, { color: colors.text.secondary }]}>{t('settings.contactSupport.description')}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.settingButton, { backgroundColor: colors.surface.secondary, borderColor: colors.border.light }]}
            onPress={handleBugReport}
          >
            <Text style={[styles.settingButtonTitle, { color: colors.text.primary }]}>{t('settings.bugReport')}</Text>
            <Text style={[styles.settingButtonDescription, { color: colors.text.secondary }]}>{t('settings.bugReport.description')}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.settingButton, { backgroundColor: colors.surface.secondary, borderColor: colors.border.light }]}
            onPress={handleFeatureRequest}
          >
            <Text style={[styles.settingButtonTitle, { color: colors.text.primary }]}>{t('settings.featureRequest')}</Text>
            <Text style={[styles.settingButtonDescription, { color: colors.text.secondary }]}>{t('settings.featureRequest.description')}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.settingButton, { backgroundColor: colors.surface.secondary, borderColor: colors.border.light }]}
            onPress={handleRateApp}
          >
            <Text style={[styles.settingButtonTitle, { color: colors.text.primary }]}>{t('settings.rateApp')}</Text>
            <Text style={[styles.settingButtonDescription, { color: colors.text.secondary }]}>{t('settings.rateApp.description')}</Text>
          </TouchableOpacity>
        </View>


        {/* App Information */}
        <View style={[styles.section, { backgroundColor: colors.surface.primary }]}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>ℹ️ {t('settings.appInformation')}</Text>
          <Text style={[styles.sectionDescription, { color: colors.text.secondary }]}>
            {t('settings.appInformation.description')}
          </Text>
          
          <View style={[styles.infoRow, { backgroundColor: colors.surface.secondary, borderColor: colors.border.light }]}>
            <Text style={[styles.infoLabel, { color: colors.text.primary }]}>{t('settings.appVersion')}</Text>
            <Text style={[styles.infoValue, { color: colors.text.primary }]}>1.0.0</Text>
          </View>
          
          <View style={[styles.infoRow, { backgroundColor: colors.surface.secondary, borderColor: colors.border.light }]}>
            <Text style={[styles.infoLabel, { color: colors.text.primary }]}>{t('settings.buildNumber')}</Text>
            <Text style={[styles.infoValue, { color: colors.text.primary }]}>100</Text>
          </View>
          
          <View style={[styles.infoRow, { backgroundColor: colors.surface.secondary, borderColor: colors.border.light }]}>
            <Text style={[styles.infoLabel, { color: colors.text.primary }]}>{t('settings.lastUpdated')}</Text>
            <Text style={[styles.infoValue, { color: colors.text.primary }]}>September 20, 2024</Text>
          </View>
          
          <View style={[styles.infoRow, { backgroundColor: colors.surface.secondary, borderColor: colors.border.light }]}>
            <Text style={[styles.infoLabel, { color: colors.text.primary }]}>{t('settings.deviceStorage')}</Text>
            <Text style={[styles.infoValue, { color: colors.text.primary }]}>12.5 MB used</Text>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: colors.surface.primary }]}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>{t('settings.about')}</Text>
          <Text style={[styles.sectionDescription, { color: colors.text.secondary }]}>
            {t('settings.about.description')}
          </Text>
          <Text style={[styles.versionText, { color: colors.text.tertiary }]}>{t('settings.version')} 1.0.0</Text>
        </View>
      </ScrollView>

      {/* Support Feature Modals */}
      <HelpCenter
        visible={showHelpCenter}
        onClose={() => setShowHelpCenter(false)}
      />
      
      <FAQ
        visible={showFAQ}
        onClose={() => setShowFAQ(false)}
      />
      
      {/* VideoTutorials removed */}
      
      <ContactSupport
        visible={showContactSupport}
        onClose={() => setShowContactSupport(false)}
      />
      
      <BugReport
        visible={showBugReport}
        onClose={() => setShowBugReport(false)}
      />
      
      <FeatureRequest
        visible={showFeatureRequest}
        onClose={() => setShowFeatureRequest(false)}
      />
      
      <RateApp
        visible={showRateApp}
        onClose={() => setShowRateApp(false)}
      />
    </SafeAreaView>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
  },
  section: {
    marginBottom: 32,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
  },
  currentCurrency: {
    backgroundColor: colors.surface.primary,
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  currentCurrencyLabel: {
    fontSize: 16,
    color: colors.text.secondary,
    marginBottom: 12,
    fontWeight: '500',
  },
  currentCurrencyDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currentCurrencySymbol: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text.primary,
    marginRight: 16,
  },
  currentCurrencyInfo: {
    flex: 1,
  },
  currentCurrencyCode: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  currentCurrencyName: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  currencyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  currencyCard: {
    backgroundColor: colors.surface.primary,
    padding: 16,
    borderRadius: 12,
    width: '30%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.light,
    position: 'relative',
  },
  selectedCurrencyCard: {
    borderColor: colors.primary.main,
    backgroundColor: colors.primary.light + '20',
  },
  currencyCardSymbol: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 8,
  },
  currencyCardCode: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  currencyCardName: {
    fontSize: 12,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  checkmarkContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: colors.primary.main,
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    color: colors.primary.contrastText,
    fontSize: 12,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: colors.primary.main,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: colors.border.light,
  },
  saveButtonText: {
    color: colors.primary.contrastText,
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonTextDisabled: {
    color: colors.text.disabled,
  },
  versionText: {
    fontSize: 14,
    color: colors.text.disabled,
    textAlign: 'center',
    marginTop: 8,
  },
  // New settings styles
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  offlineStatus: {
    backgroundColor: colors.surface.secondary,
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 14,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  statusValue: {
    fontSize: 14,
    color: colors.text.primary,
    fontWeight: '600',
  },
  offlineActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  syncButton: {
    backgroundColor: colors.primary.main,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  syncButtonText: {
    color: colors.primary.contrastText,
    fontSize: 14,
    fontWeight: '600',
  },
  clearButton: {
    backgroundColor: colors.surface.secondary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  clearButtonText: {
    color: colors.text.secondary,
    fontSize: 14,
    fontWeight: '600',
  },
  settingButton: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  settingButtonTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingButtonDescription: {
    fontSize: 14,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
  },
});
