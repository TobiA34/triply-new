import { databaseService, Trip } from './database';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

export interface TripShare {
  id: string;
  tripId: string;
  sharedWith: string; // email or phone
  permission: 'view' | 'edit' | 'admin';
  status: 'pending' | 'accepted' | 'declined';
  invitedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface TripCollaborator {
  id: string;
  tripId: string;
  userId: string;
  name: string;
  email: string;
  avatar?: string;
  permission: 'view' | 'edit' | 'admin';
  joinedAt: string;
}

export interface TripComment {
  id: string;
  tripId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  comment: string;
  day?: number; // Optional: comment on specific day
  activityId?: string; // Optional: comment on specific activity
  createdAt: string;
  updatedAt: string;
}

export interface TripLike {
  id: string;
  tripId: string;
  userId: string;
  createdAt: string;
}

export const shareMethods = [
  { id: 'email', name: 'Email', icon: '📧', description: 'Send trip details via email' },
  { id: 'sms', name: 'SMS', icon: '💬', description: 'Share via text message' },
  { id: 'social', name: 'Social Media', icon: '📱', description: 'Share on social platforms' },
  { id: 'link', name: 'Share Link', icon: '🔗', description: 'Generate shareable link' },
  { id: 'qr', name: 'QR Code', icon: '📱', description: 'Generate QR code for easy sharing' },
];

export async function shareTrip(
  tripId: string,
  method: string,
  recipients: string[],
  message?: string
): Promise<void> {
  try {
    const trip = await databaseService.getTripById(tripId);
    if (!trip) {
      throw new Error('Trip not found');
    }

    const shareData = await generateTripShareData(trip);

    switch (method) {
      case 'email':
        await shareViaEmail(shareData, recipients, message);
        break;
      case 'sms':
        await shareViaSMS(shareData, recipients, message);
        break;
      case 'social':
        await shareViaSocial(shareData, message);
        break;
      case 'link':
        await shareViaLink(shareData, recipients);
        break;
      case 'qr':
        await shareViaQR(shareData);
        break;
      default:
        throw new Error('Invalid share method');
    }
  } catch (error) {
    console.error('Error sharing trip:', error);
    throw new Error('Failed to share trip');
  }
}

export async function generateTripShareData(trip: Trip): Promise<{
  title: string;
  description: string;
  details: string;
  itinerary: string;
  shareableText: string;
  shareableUrl: string;
}> {
  const interests = JSON.parse(trip.interests);
  const checkInDate = new Date(trip.checkIn).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  const checkOutDate = new Date(trip.checkOut).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const title = `Trip to ${trip.destination}`;
  const description = `Join me on this amazing trip to ${trip.destination}!`;
  
  const details = `
📍 Destination: ${trip.destination}
📅 Dates: ${checkInDate} - ${checkOutDate}
👥 Group: ${trip.groupType}
💰 Budget: £${trip.budget}/day
⚡ Activity Level: ${trip.activityLevel}%
🎯 Interests: ${interests.join(', ')}
  `.trim();

  const itinerary = `
🗓️ Trip Itinerary:
• Day 1: Arrival and city exploration
• Day 2: Local attractions and activities
• Day 3: Cultural experiences and dining
• Day 4: Adventure activities and sightseeing
• Day 5: Shopping and departure

💡 This trip was planned with Triply - the smart travel planning app!
  `.trim();

  const shareableText = `${title}\n\n${description}\n\n${details}\n\n${itinerary}`;
  const shareableUrl = `https://triply.app/trip/${trip.id}`;

  return {
    title,
    description,
    details,
    itinerary,
    shareableText,
    shareableUrl,
  };
}

async function shareViaEmail(shareData: any, recipients: string[], message?: string): Promise<void> {
  const subject = `Trip Invitation: ${shareData.title}`;
  const body = `${message || 'Check out this amazing trip I planned!'}\n\n${shareData.shareableText}`;
  
  const emailUrl = `mailto:${recipients.join(',')}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  
  if (await Sharing.isAvailableAsync()) {
    // For now, we'll use the system's default email app
    // In a real app, you'd integrate with an email service
    console.log('Email sharing:', { recipients, subject, body });
  }
}

async function shareViaSMS(shareData: any, recipients: string[], message?: string): Promise<void> {
  const text = `${message || 'Check out this trip!'}\n\n${shareData.shareableUrl}`;
  
  // For now, we'll use the system's default SMS app
  // In a real app, you'd integrate with an SMS service
  console.log('SMS sharing:', { recipients, text });
}

async function shareViaSocial(shareData: any, message?: string): Promise<void> {
  const text = `${message || shareData.description}\n\n${shareData.shareableUrl}`;
  
  // For now, we'll use the system's default sharing
  // In a real app, you'd integrate with social media APIs
  console.log('Social sharing:', { text });
}

async function shareViaLink(shareData: any, recipients: string[]): Promise<void> {
  // Generate a shareable link and copy to clipboard
  // In a real app, you'd create a unique shareable link
  console.log('Link sharing:', { url: shareData.shareableUrl, recipients });
}

async function shareViaQR(shareData: any): Promise<void> {
  // Generate QR code for the trip
  // In a real app, you'd generate an actual QR code
  console.log('QR sharing:', { url: shareData.shareableUrl });
}

export async function inviteCollaborator(
  tripId: string,
  email: string,
  permission: 'view' | 'edit' | 'admin' = 'view'
): Promise<string> {
  try {
    // In a real app, you'd save this to the database and send an invitation
    const invitationId = Date.now().toString();
    console.log('Inviting collaborator:', { tripId, email, permission, invitationId });
    return invitationId;
  } catch (error) {
    console.error('Error inviting collaborator:', error);
    throw new Error('Failed to invite collaborator');
  }
}

export async function getTripCollaborators(tripId: string): Promise<TripCollaborator[]> {
  try {
    // In a real app, you'd fetch from the database
    return [];
  } catch (error) {
    console.error('Error fetching collaborators:', error);
    throw new Error('Failed to fetch collaborators');
  }
}

export async function addTripComment(
  tripId: string,
  userId: string,
  userName: string,
  comment: string,
  day?: number,
  activityId?: string
): Promise<string> {
  try {
    // In a real app, you'd save to the database
    const commentId = Date.now().toString();
    console.log('Adding comment:', { tripId, userId, userName, comment, day, activityId, commentId });
    return commentId;
  } catch (error) {
    console.error('Error adding comment:', error);
    throw new Error('Failed to add comment');
  }
}

export async function getTripComments(tripId: string): Promise<TripComment[]> {
  try {
    // In a real app, you'd fetch from the database
    return [];
  } catch (error) {
    console.error('Error fetching comments:', error);
    throw new Error('Failed to fetch comments');
  }
}

export async function likeTrip(tripId: string, userId: string): Promise<void> {
  try {
    // In a real app, you'd save to the database
    console.log('Liking trip:', { tripId, userId });
  } catch (error) {
    console.error('Error liking trip:', error);
    throw new Error('Failed to like trip');
  }
}

export async function getTripLikes(tripId: string): Promise<number> {
  try {
    // In a real app, you'd fetch from the database
    return Math.floor(Math.random() * 50); // Mock data
  } catch (error) {
    console.error('Error fetching likes:', error);
    throw new Error('Failed to fetch likes');
  }
}

export async function exportTripAsPDF(tripId: string): Promise<string> {
  try {
    const trip = await databaseService.getTripById(tripId);
    if (!trip) {
      throw new Error('Trip not found');
    }

    const shareData = await generateTripShareData(trip);
    
    // In a real app, you'd generate an actual PDF
    const pdfContent = `
      <html>
        <head>
          <title>${shareData.title}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .section { margin-bottom: 20px; }
            .label { font-weight: bold; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${shareData.title}</h1>
            <p>${shareData.description}</p>
          </div>
          <div class="section">
            <h2>Trip Details</h2>
            <pre>${shareData.details}</pre>
          </div>
          <div class="section">
            <h2>Itinerary</h2>
            <pre>${shareData.itinerary}</pre>
          </div>
        </body>
      </html>
    `;

    const fileName = `trip-${trip.destination.replace(/\s+/g, '-').toLowerCase()}.html`;
    const fileUri = `${FileSystem.documentDirectory}${fileName}`;
    
    await FileSystem.writeAsStringAsync(fileUri, pdfContent);
    
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri);
    }
    
    return fileUri;
  } catch (error) {
    console.error('Error exporting trip:', error);
    throw new Error('Failed to export trip');
  }
}
