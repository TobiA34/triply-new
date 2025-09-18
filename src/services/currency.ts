import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'currency_settings_v1';

export interface CurrencySettings {
  currency: string; // ISO 4217 code, e.g., 'GBP', 'USD', 'EUR'
  locale?: string; // optional BCP 47, e.g., 'en-GB'
}

const defaultSettings: CurrencySettings = { currency: 'GBP' };

export async function loadCurrencySettings(): Promise<CurrencySettings> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultSettings;
    const parsed = JSON.parse(raw);
    return { ...defaultSettings, ...parsed } as CurrencySettings;
  } catch {
    return defaultSettings;
  }
}

export async function saveCurrencySettings(settings: CurrencySettings): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {}
}

export async function formatCurrency(amount: number): Promise<string> {
  const s = await loadCurrencySettings();
  try {
    return new Intl.NumberFormat(s.locale || undefined, {
      style: 'currency',
      currency: s.currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    // Fallback simple formatting
    const symbol = getCurrencySymbol(s.currency);
    return `${symbol}${Math.round(amount)}`;
  }
}

export function getCurrencySymbol(code: string): string {
  switch (code) {
    case 'USD': return '$';
    case 'EUR': return '€';
    case 'GBP': return '£';
    case 'JPY': return '¥';
    default: return code + ' ';
  }
}

export function formatWithSettings(amount: number, settings: CurrencySettings): string {
  try {
    return new Intl.NumberFormat(settings.locale || undefined, {
      style: 'currency',
      currency: settings.currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${getCurrencySymbol(settings.currency)}${Math.round(amount)}`;
  }
}


