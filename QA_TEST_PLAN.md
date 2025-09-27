# 🧪 QA Test Plan - Real API Integration

## Test Environment
- **App**: Triply Travel App
- **Features**: Weather Widget + Currency Converter
- **APIs**: OpenWeatherMap + ExchangeRate-API
- **Date**: $(date)

## ✅ Test Cases

### 1. Weather Widget Testing

#### 1.1 Basic Functionality
- [ ] **Test 1.1.1**: Widget displays when destination is selected
- [ ] **Test 1.1.2**: Widget shows placeholder when no destination
- [ ] **Test 1.1.3**: Loading indicator appears during API call
- [ ] **Test 1.1.4**: Refresh button works correctly

#### 1.2 API Integration
- [ ] **Test 1.2.1**: Real weather data loads for valid cities
- [ ] **Test 1.2.2**: Current temperature displays correctly
- [ ] **Test 1.2.3**: Weather condition shows properly
- [ ] **Test 1.2.4**: Humidity and wind speed display
- [ ] **Test 1.2.5**: 5-day forecast loads correctly
- [ ] **Test 1.2.6**: Weather icons map correctly

#### 1.3 Error Handling
- [ ] **Test 1.3.1**: Invalid city name shows error message
- [ ] **Test 1.3.2**: Network error shows appropriate message
- [ ] **Test 1.3.3**: API key missing shows warning
- [ ] **Test 1.3.4**: Retry button works after error

### 2. Currency Converter Testing

#### 2.1 Basic Functionality
- [ ] **Test 2.1.1**: Converter displays when destination is selected
- [ ] **Test 2.1.2**: Converter shows placeholder when no destination
- [ ] **Test 2.1.3**: Loading indicator appears during API call
- [ ] **Test 2.1.4**: Refresh button works correctly

#### 2.2 API Integration
- [ ] **Test 2.2.1**: Real exchange rates load correctly
- [ ] **Test 2.2.2**: Currency conversion calculates accurately
- [ ] **Test 2.2.3**: Multiple currencies supported
- [ ] **Test 2.2.4**: Currency picker modal works
- [ ] **Test 2.2.5**: Swap currencies function works

#### 2.3 Error Handling
- [ ] **Test 2.3.1**: Network error shows appropriate message
- [ ] **Test 2.3.2**: Invalid currency shows error
- [ ] **Test 2.3.3**: Retry button works after error

### 3. Integration Testing

#### 3.1 Destination Selection
- [ ] **Test 3.1.1**: Both widgets update when destination changes
- [ ] **Test 3.1.2**: Currency auto-detects based on destination
- [ ] **Test 3.1.3**: Weather updates for new destination

#### 3.2 Performance
- [ ] **Test 3.2.1**: API calls complete within 3 seconds
- [ ] **Test 3.2.2**: No memory leaks during repeated API calls
- [ ] **Test 3.2.3**: App remains responsive during API calls

### 4. Edge Cases

#### 4.1 Network Issues
- [ ] **Test 4.1.1**: Offline mode shows appropriate messages
- [ ] **Test 4.1.2**: Slow network shows loading states
- [ ] **Test 4.1.3**: Network recovery works correctly

#### 4.2 Invalid Data
- [ ] **Test 4.2.1**: Empty destination string
- [ ] **Test 4.2.2**: Special characters in destination
- [ ] **Test 4.2.3**: Very long destination names

## 🚨 Known Issues to Test

1. **API Key Missing**: Weather widget should show warning
2. **Rate Limiting**: Both APIs have rate limits
3. **Invalid Cities**: Weather API may not find some cities
4. **Currency Support**: Some currencies may not be supported

## 📊 Test Results

### Weather Widget
- **Passed**: 0/12 tests
- **Failed**: 0/12 tests
- **Issues Found**: []

### Currency Converter
- **Passed**: 0/8 tests
- **Failed**: 0/8 tests
- **Issues Found**: []

### Integration
- **Passed**: 0/6 tests
- **Failed**: 0/6 tests
- **Issues Found**: []

## 🔧 Test Commands

```bash
# Start app
npm start

# Check TypeScript
npx tsc --noEmit

# Check linting
npx eslint src/components/WeatherWidget.tsx src/components/CurrencyConverter.tsx

# Test API endpoints
curl "https://api.openweathermap.org/data/2.5/weather?q=London&appid=demo&units=metric"
curl "https://api.exchangerate-api.com/v4/latest/USD"
```

## 📝 Notes

- Weather API requires valid API key
- Currency API works without API key
- Test on both iOS and Android
- Test with different network conditions
