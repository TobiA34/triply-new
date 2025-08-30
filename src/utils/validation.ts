export interface ValidationError {
  field: string;
  message: string;
}

export interface TripFormData {
  destination: string;
  checkIn: string;
  checkOut: string;
  budget: number;
  activityLevel: number;
  groupType: string;
  interests: string[];
}

export const validateTripForm = (data: TripFormData): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Validate destination
  if (!data.destination.trim()) {
    errors.push({
      field: 'destination',
      message: 'Please enter a destination',
    });
  }

  // Validate dates
  const dateRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[012])\/(20)\d\d$/;
  
  if (!data.checkIn) {
    errors.push({
      field: 'checkIn',
      message: 'Please enter a check-in date',
    });
  } else if (!dateRegex.test(data.checkIn)) {
    errors.push({
      field: 'checkIn',
      message: 'Please enter a valid date (dd/mm/yyyy)',
    });
  }

  if (!data.checkOut) {
    errors.push({
      field: 'checkOut',
      message: 'Please enter a check-out date',
    });
  } else if (!dateRegex.test(data.checkOut)) {
    errors.push({
      field: 'checkOut',
      message: 'Please enter a valid date (dd/mm/yyyy)',
    });
  }

  // Validate date range if both dates are valid
  if (dateRegex.test(data.checkIn) && dateRegex.test(data.checkOut)) {
    const checkIn = new Date(data.checkIn.split('/').reverse().join('-'));
    const checkOut = new Date(data.checkOut.split('/').reverse().join('-'));
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkIn < today) {
      errors.push({
        field: 'checkIn',
        message: 'Check-in date cannot be in the past',
      });
    }

    if (checkOut <= checkIn) {
      errors.push({
        field: 'checkOut',
        message: 'Check-out date must be after check-in date',
      });
    }
  }

  // Validate interests
  if (data.interests.length === 0) {
    errors.push({
      field: 'interests',
      message: 'Please select at least one interest',
    });
  }

  return errors;
};