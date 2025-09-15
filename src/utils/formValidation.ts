export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | undefined;
}

export interface ValidationErrors {
  [key: string]: string;
}

export const validateField = (value: any, rules: ValidationRule): string | undefined => {
  if (rules.required && (!value || (typeof value === 'string' && value.trim().length === 0))) {
    return 'This field is required';
  }

  if (value && typeof value === 'string') {
    if (rules.minLength && value.length < rules.minLength) {
      return `Must be at least ${rules.minLength} characters`;
    }

    if (rules.maxLength && value.length > rules.maxLength) {
      return `Must be no more than ${rules.maxLength} characters`;
    }

    if (rules.pattern && !rules.pattern.test(value)) {
      return 'Invalid format';
    }
  }

  if (rules.custom) {
    return rules.custom(value);
  }

  return undefined;
};

export const validateForm = (data: Record<string, any>, rules: Record<string, ValidationRule>): ValidationErrors => {
  const errors: ValidationErrors = {};

  Object.keys(rules).forEach(field => {
    const error = validateField(data[field], rules[field]);
    if (error) {
      errors[field] = error;
    }
  });

  return errors;
};

// Common validation rules
export const commonRules = {
  required: { required: true },
  name: { required: true, minLength: 2, maxLength: 50 },
  description: { maxLength: 200 },
  cost: { 
    pattern: /^\d+(\.\d{1,2})?$/,
    custom: (value: string) => {
      if (value && parseFloat(value) < 0) {
        return 'Cost cannot be negative';
      }
      return undefined;
    }
  },
  day: {
    custom: (value: number) => {
      if (value < 1) {
        return 'Day must be at least 1';
      }
      return undefined;
    }
  },
  date: {
    required: true,
    custom: (value: string) => {
      if (!value || value.trim() === '') {
        return 'Date is required';
      }
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        return 'Invalid date format';
      }
      return undefined;
    }
  }
};
