/**
 * Utility functions for consistent date and time formatting across the app
 */

export const formatDate = (dateString: string): string => {
  if (!dateString || dateString.trim() === '') return 'No date';
  
  const date = new Date(dateString);
  
  // Check if the date is valid
  if (isNaN(date.getTime())) {
    return 'No date';
  }
  
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export const formatTime = (timeString: string): string => {
  if (!timeString || timeString.trim() === '') return 'No time';
  
  // Handle both ISO string and HH:MM format
  let date: Date;
  
  if (timeString.includes('T')) {
    // ISO string format
    date = new Date(timeString);
  } else {
    // Assume HH:MM format, create a date for today with this time
    const [hours, minutes] = timeString.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) return 'No time';
    
    date = new Date();
    date.setHours(hours, minutes, 0, 0);
  }
  
  // Check if the date is valid
  if (isNaN(date.getTime())) {
    return 'No time';
  }
  
  return date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

export const formatDateTime = (dateTimeString: string): string => {
  if (!dateTimeString || dateTimeString.trim() === '') return 'No date/time';
  
  const date = new Date(dateTimeString);
  
  // Check if the date is valid
  if (isNaN(date.getTime())) {
    return 'No date/time';
  }
  
  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

export const formatDateRange = (startDate: string, endDate: string): string => {
  const startFormatted = formatDate(startDate);
  const endFormatted = formatDate(endDate);
  
  if (startFormatted === 'No date' && endFormatted === 'No date') {
    return 'No dates set';
  } else if (startFormatted === 'No date') {
    return `To ${endFormatted}`;
  } else if (endFormatted === 'No date') {
    return `From ${startFormatted}`;
  } else {
    return `${startFormatted} - ${endFormatted}`;
  }
};

export const formatRelativeDate = (dateString: string): string => {
  if (!dateString || dateString.trim() === '') return 'No date';
  
  const date = new Date(dateString);
  
  // Check if the date is valid
  if (isNaN(date.getTime())) {
    return 'No date';
  }
  
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) {
    return 'Today';
  } else if (diffInDays === 1) {
    return 'Yesterday';
  } else if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  } else {
    return formatDate(dateString);
  }
};
