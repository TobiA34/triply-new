import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import { Location, searchLocations } from '../data/locations';

interface LocationSearchInputProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
  onLocationSelect?: (location: Location) => void;
  error?: string;
  label?: string;
}

export const LocationSearchInput: React.FC<LocationSearchInputProps> = ({
  placeholder,
  value,
  onChangeText,
  onBlur,
  onLocationSelect,
  error,
  label,
}) => {
  const [suggestions, setSuggestions] = useState<Location[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<TextInput>(null);

  // Debounced search function
  const debouncedSearch = (query: string) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Clear suggestions immediately when query is too short
    if (query.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      setIsSearching(false);
      return;
    }

    // Show loading state
    setIsSearching(true);

    debounceTimeoutRef.current = setTimeout(() => {
      const results = searchLocations(query, 8);
      setSuggestions(results);
      setShowSuggestions(true);
      setIsSearching(false);
    }, 300); // 300ms debounce delay
  };

  useEffect(() => {
    debouncedSearch(value);
    
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [value]);

  const handleTextChange = (text: string) => {
    onChangeText(text);
    // Don't show suggestions immediately - let debouncing handle it
    if (text.trim().length < 2) {
      setShowSuggestions(false);
    }
  };

  const handleLocationSelect = (location: Location) => {
    // Show both city and country in the input field
    const displayText = location.type === 'city' 
      ? `${location.name}, ${location.country}`
      : location.name;
    
    onChangeText(displayText);
    setShowSuggestions(false);
    onLocationSelect?.(location);
    inputRef.current?.blur();
  };

  const handleBlur = () => {
    // Delay hiding suggestions to allow for selection
    setTimeout(() => {
      setShowSuggestions(false);
      onBlur?.();
    }, 150);
  };

  const handleFocus = () => {
    if (value.trim().length >= 2) {
      setShowSuggestions(true);
    }
  };

  const renderSuggestion = ({ item }: { item: Location }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => handleLocationSelect(item)}
    >
      <View style={styles.suggestionContent}>
        <View style={styles.suggestionIcon}>
          <Ionicons
            name={item.type === 'city' ? 'location' : 'globe'}
            size={16}
            color={colors.text.secondary}
          />
        </View>
        <View style={styles.suggestionText}>
          <Text style={styles.suggestionName}>{item.name}</Text>
          <Text style={styles.suggestionCountry}>{item.country}</Text>
        </View>
        <View style={styles.suggestionBadge}>
          <Text style={styles.suggestionBadgeText}>
            {item.type === 'city' ? 'City' : 'Country'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputContainer, error && styles.inputError]}>
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder={placeholder}
          value={value}
          onChangeText={handleTextChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholderTextColor={colors.text.tertiary}
          autoCorrect={false}
          autoCapitalize="words"
        />
        {isSearching && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={colors.primary.main} />
          </View>
        )}
        {value.length > 0 && !isSearching && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => {
              onChangeText('');
              setSuggestions([]);
              setShowSuggestions(false);
            }}
          >
            <Ionicons name="close-circle" size={20} color={colors.text.tertiary} />
          </TouchableOpacity>
        )}
      </View>
      
      {showSuggestions && suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <View style={styles.suggestionsList}>
            {suggestions.map((item) => (
              <View key={item.id}>
                {renderSuggestion({ item })}
              </View>
            ))}
          </View>
        </View>
      )}
      
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
    width: '100%',
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    lineHeight: typography.lineHeight.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface.primary,
    width: '100%',
    minHeight: 48,
  },
  input: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.primary,
    lineHeight: typography.lineHeight.base,
  },
  loadingContainer: {
    paddingRight: spacing.lg,
  },
  clearButton: {
    paddingRight: spacing.lg,
    paddingLeft: spacing.sm,
  },
  inputError: {
    borderColor: colors.status.error,
    borderWidth: 2,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 48,
    left: 0,
    right: 0,
    backgroundColor: colors.surface.primary,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
    maxHeight: 200,
    zIndex: 1000,
    ...shadows.lg,
  },
  suggestionsList: {
    maxHeight: 200,
  },
  suggestionItem: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  suggestionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  suggestionIcon: {
    marginRight: spacing.md,
  },
  suggestionText: {
    flex: 1,
  },
  suggestionName: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.primary,
    lineHeight: typography.lineHeight.base,
  },
  suggestionCountry: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
    lineHeight: typography.lineHeight.sm,
    marginTop: 2,
  },
  suggestionBadge: {
    backgroundColor: colors.surface.secondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  suggestionBadgeText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: typography.letterSpacing.wide,
  },
  errorText: {
    color: colors.status.error,
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.medium,
    marginTop: spacing.xs,
    lineHeight: typography.lineHeight.xs,
  },
});
