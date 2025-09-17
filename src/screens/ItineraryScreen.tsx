import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { databaseService, Trip } from '../services/database';
import { Section } from '../components/Section';
import { Chip } from '../components/Chip';
import { formatTime } from '../utils/dateFormatting';

interface Activity {
  id: string;
  name: string;
  type: string;
  duration: string;
  cost: string;
  description: string;
  location: string;
  time: string;
}

interface DayPlan {
  day: number;
  date: string;
  activities: Activity[];
}

export const ItineraryScreen = () => {
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [itinerary, setItinerary] = useState<DayPlan[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [userMessage, setUserMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{id: string, type: 'user' | 'ai', message: string}>>([]);

  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    try {
      await databaseService.init();
      const savedTrips = await databaseService.getAllTrips();
      setTrips(savedTrips);
      if (savedTrips.length > 0 && !selectedTrip) {
        setSelectedTrip(savedTrips[0]);
      }
    } catch (error) {
      console.error('Error loading trips:', error);
    }
  };

  const generateItinerary = async () => {
    if (!selectedTrip) {
      Alert.alert('No Trip Selected', 'Please select a trip first');
      return;
    }

    setIsGenerating(true);
    
    try {
      // Simulate AI itinerary generation
      const mockItinerary = generateMockItinerary(selectedTrip);
      setItinerary(mockItinerary);
      
      // Add AI message to chat
      const aiMessage = {
        id: Date.now().toString(),
        type: 'ai' as const,
        message: `I've created a personalized itinerary for your ${selectedTrip.destination} trip! The plan includes activities based on your interests: ${JSON.parse(selectedTrip.interests).join(', ')}. Check out the detailed schedule below.`
      };
      setChatMessages(prev => [...prev, aiMessage]);
      
    } catch (error) {
      console.error('Error generating itinerary:', error);
      Alert.alert('Error', 'Failed to generate itinerary');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateMockItinerary = (trip: Trip): DayPlan[] => {
    const interests = JSON.parse(trip.interests);
    const days = Math.ceil((new Date(trip.checkOut).getTime() - new Date(trip.checkIn).getTime()) / (1000 * 60 * 60 * 24));
    
    const activitiesByInterest: { [key: string]: Activity[] } = {
      adventure: [
        { id: '1', name: 'Hiking Trail', type: 'Adventure', duration: '3-4 hours', cost: '$0-20', description: 'Explore scenic hiking trails', location: 'Mountain Park', time: '9:00 AM' },
        { id: '2', name: 'Rock Climbing', type: 'Adventure', duration: '2-3 hours', cost: '$50-80', description: 'Indoor or outdoor rock climbing', location: 'Climbing Gym', time: '2:00 PM' },
        { id: '3', name: 'Kayaking', type: 'Adventure', duration: '2-4 hours', cost: '$30-60', description: 'Water adventure on local rivers', location: 'Water Sports Center', time: '10:00 AM' }
      ],
      culture: [
        { id: '4', name: 'Museum Visit', type: 'Culture', duration: '2-3 hours', cost: '$10-25', description: 'Explore local history and art', location: 'City Museum', time: '10:00 AM' },
        { id: '5', name: 'Cultural District', type: 'Culture', duration: '3-4 hours', cost: '$0-30', description: 'Walking tour of historic areas', location: 'Historic District', time: '2:00 PM' },
        { id: '6', name: 'Local Festival', type: 'Culture', duration: '4-6 hours', cost: '$20-50', description: 'Experience local traditions', location: 'City Center', time: '6:00 PM' }
      ],
      food: [
        { id: '7', name: 'Food Tour', type: 'Food', duration: '3-4 hours', cost: '$60-100', description: 'Guided culinary experience', location: 'Various Restaurants', time: '12:00 PM' },
        { id: '8', name: 'Cooking Class', type: 'Food', duration: '2-3 hours', cost: '$40-80', description: 'Learn local cooking techniques', location: 'Cooking School', time: '6:00 PM' },
        { id: '9', name: 'Market Visit', type: 'Food', duration: '1-2 hours', cost: '$10-30', description: 'Explore local food markets', location: 'Central Market', time: '9:00 AM' }
      ],
      nature: [
        { id: '10', name: 'Nature Reserve', type: 'Nature', duration: '4-6 hours', cost: '$0-15', description: 'Wildlife and nature observation', location: 'Nature Reserve', time: '8:00 AM' },
        { id: '11', name: 'Botanical Garden', type: 'Nature', duration: '2-3 hours', cost: '$5-20', description: 'Explore diverse plant collections', location: 'Botanical Garden', time: '2:00 PM' },
        { id: '12', name: 'Sunset Viewpoint', type: 'Nature', duration: '1-2 hours', cost: '$0-10', description: 'Scenic sunset viewing', location: 'Mountain Peak', time: '6:00 PM' }
      ],
      nightlife: [
        { id: '13', name: 'Rooftop Bar', type: 'Nightlife', duration: '2-3 hours', cost: '$30-60', description: 'Drinks with city views', location: 'Rooftop Bar', time: '8:00 PM' },
        { id: '14', name: 'Live Music Venue', type: 'Nightlife', duration: '3-4 hours', cost: '$20-50', description: 'Local music and entertainment', location: 'Music Hall', time: '9:00 PM' },
        { id: '15', name: 'Night Market', type: 'Nightlife', duration: '2-3 hours', cost: '$15-40', description: 'Evening food and shopping', location: 'Night Market', time: '7:00 PM' }
      ]
    };

    const dayPlans: DayPlan[] = [];
    
    for (let i = 0; i < days; i++) {
      const date = new Date(trip.checkIn);
      date.setDate(date.getDate() + i);
      
      const dayActivities: Activity[] = [];
      
      // Select 2-3 activities per day based on interests
      const selectedInterests = interests.slice(0, 2);
      selectedInterests.forEach((interest: string) => {
        if (activitiesByInterest[interest]) {
          const randomActivity = activitiesByInterest[interest][Math.floor(Math.random() * activitiesByInterest[interest].length)];
          dayActivities.push({ ...randomActivity, id: `${i}-${randomActivity.id}` });
        }
      });
      
      // Add a general activity if we have space
      if (dayActivities.length < 3) {
        const generalActivities = [
          { id: '16', name: 'City Walking Tour', type: 'General', duration: '2-3 hours', cost: '$15-30', description: 'Explore the city on foot', location: 'City Center', time: '10:00 AM' },
          { id: '17', name: 'Shopping District', type: 'General', duration: '2-3 hours', cost: '$20-100', description: 'Browse local shops and boutiques', location: 'Shopping District', time: '3:00 PM' },
          { id: '18', name: 'Relaxation Time', type: 'General', duration: '1-2 hours', cost: '$0-30', description: 'Rest and recharge', location: 'Hotel/Park', time: '4:00 PM' }
        ];
        const randomGeneral = generalActivities[Math.floor(Math.random() * generalActivities.length)];
        dayActivities.push({ ...randomGeneral, id: `${i}-${randomGeneral.id}` });
      }
      
      dayPlans.push({
        day: i + 1,
        date: date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }),
        activities: dayActivities.sort((a, b) => a.time.localeCompare(b.time))
      });
    }
    
    return dayPlans;
  };

  const sendMessage = () => {
    if (!userMessage.trim()) return;
    
    const userMsg = {
      id: Date.now().toString(),
      type: 'user' as const,
      message: userMessage
    };
    
    setChatMessages(prev => [...prev, userMsg]);
    setUserMessage('');
    
    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: (Date.now() + 1).toString(),
        type: 'ai' as const,
        message: `I understand you're asking about "${userMessage}". Based on your trip to ${selectedTrip?.destination || 'your destination'}, I'd recommend checking the itinerary I've generated or asking me about specific activities, restaurants, or attractions you're interested in!`
      };
      setChatMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const parseInterests = (interestsString: string): string[] => {
    try {
      return JSON.parse(interestsString);
    } catch {
      return [];
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>🤖 AI Travel Companion</Text>
          <Text style={styles.subtitle}>Get personalized recommendations and itinerary</Text>
        </View>

        {trips.length > 0 && (
          <Section title="Select Your Trip">
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tripSelector}>
              {trips.map((trip) => (
                <TouchableOpacity
                  key={trip.id}
                  style={[
                    styles.tripCard,
                    selectedTrip?.id === trip.id && styles.selectedTripCard
                  ]}
                  onPress={() => setSelectedTrip(trip)}
                >
                  <Text style={[
                    styles.tripCardTitle,
                    selectedTrip?.id === trip.id && styles.selectedTripCardTitle
                  ]}>
                    {trip.destination}
                  </Text>
                  <Text style={styles.tripCardDate}>
                    {new Date(trip.checkIn).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' })} - 
                    {new Date(trip.checkOut).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' })}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Section>
        )}

        {selectedTrip && (
          <Section title="Trip Details">
            <View style={styles.tripDetails}>
              <Text style={styles.tripDetailText}>📍 {selectedTrip.destination}</Text>
              <Text style={styles.tripDetailText}>👥 {selectedTrip.groupType}</Text>
              <Text style={styles.tripDetailText}>💰 ${selectedTrip.budget}/day</Text>
              <Text style={styles.tripDetailText}>⚡ {selectedTrip.activityLevel}% activity</Text>
              <View style={styles.interestsContainer}>
                {parseInterests(selectedTrip.interests).map((interest, index) => (
                  <Chip
                    key={index}
                    label={interest}
                    selected={true}
                    onPress={() => {}}
                  />
                ))}
              </View>
            </View>
          </Section>
        )}

        <Section title="Generate Itinerary">
          <TouchableOpacity
            style={[styles.generateButton, isGenerating && styles.generateButtonDisabled]}
            onPress={generateItinerary}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.generateButtonText}>🎯 Generate AI Itinerary</Text>
            )}
          </TouchableOpacity>
        </Section>

        {itinerary.length > 0 && (
          <Section title="Your Itinerary">
            {itinerary.map((dayPlan) => (
              <View key={dayPlan.day} style={styles.dayPlan}>
                <Text style={styles.dayTitle}>Day {dayPlan.day} - {dayPlan.date}</Text>
                {dayPlan.activities.map((activity) => (
                  <View key={activity.id} style={styles.activityCard}>
                    <View style={styles.activityHeader}>
                      <Text style={styles.activityName}>{activity.name}</Text>
                      <Text style={styles.activityTime}>{formatTime(activity.time)}</Text>
                    </View>
                    <Text style={styles.activityType}>{activity.type}</Text>
                    <Text style={styles.activityDescription}>{activity.description}</Text>
                    <View style={styles.activityDetails}>
                      <Text style={styles.activityDetail}>📍 {activity.location}</Text>
                      <Text style={styles.activityDetail}>⏱️ {activity.duration}</Text>
                      <Text style={styles.activityDetail}>💰 {activity.cost}</Text>
                    </View>
                  </View>
                ))}
              </View>
            ))}
          </Section>
        )}

        <Section title="Chat with AI">
          <View style={styles.chatContainer}>
            <ScrollView style={styles.chatMessages} showsVerticalScrollIndicator={false}>
              {chatMessages.map((message) => (
                <View key={message.id} style={[
                  styles.messageBubble,
                  message.type === 'user' ? styles.userMessage : styles.aiMessage
                ]}>
                  <Text style={[
                    styles.messageText,
                    message.type === 'user' ? styles.userMessageText : styles.aiMessageText
                  ]}>
                    {message.message}
                  </Text>
                </View>
              ))}
            </ScrollView>
            <View style={styles.chatInput}>
              <TextInput
                style={styles.textInput}
                placeholder="Ask me about activities, restaurants, or attractions..."
                value={userMessage}
                onChangeText={setUserMessage}
                multiline
              />
              <TouchableOpacity
                style={styles.sendButton}
                onPress={sendMessage}
                disabled={!userMessage.trim()}
              >
                <Text style={styles.sendButtonText}>Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  tripSelector: {
    marginBottom: 8,
  },
  tripCard: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    marginRight: 12,
    minWidth: 120,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedTripCard: {
    borderColor: '#4285F4',
    backgroundColor: '#F0F7FF',
  },
  tripCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  selectedTripCardTitle: {
    color: '#4285F4',
  },
  tripCardDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  tripDetails: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
  },
  tripDetailText: {
    fontSize: 14,
    color: '#111827',
    marginBottom: 8,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  generateButton: {
    backgroundColor: '#4285F4',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  generateButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  dayPlan: {
    marginBottom: 24,
  },
  dayTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  activityCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  activityName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  activityTime: {
    fontSize: 14,
    color: '#4285F4',
    fontWeight: '500',
  },
  activityType: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  activityDescription: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 12,
    lineHeight: 20,
  },
  activityDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  activityDetail: {
    fontSize: 12,
    color: '#6B7280',
  },
  chatContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    height: 300,
  },
  chatMessages: {
    flex: 1,
    padding: 16,
  },
  messageBubble: {
    marginBottom: 12,
    maxWidth: '80%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#4285F4',
    padding: 12,
    borderRadius: 16,
    borderBottomRightRadius: 4,
  },
  aiMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  aiMessageText: {
    color: '#111827',
  },
  chatInput: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    maxHeight: 80,
  },
  sendButton: {
    backgroundColor: '#4285F4',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    justifyContent: 'center',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});