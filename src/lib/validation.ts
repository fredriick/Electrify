export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Email validation
export const validateEmail = (email: string): string | null => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return 'Email is required';
  if (!emailRegex.test(email)) return 'Please enter a valid email address';
  return null;
};

// Phone validation
export const validatePhone = (phone: string): string | null => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  if (!phone) return null; // Phone is optional
  if (!phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))) {
    return 'Please enter a valid phone number';
  }
  return null;
};

// Required field validation
export const validateRequired = (value: string, fieldName: string): string | null => {
  if (!value || value.trim() === '') {
    return `${fieldName} is required`;
  }
  return null;
};

// URL validation
export const validateUrl = (url: string): string | null => {
  if (!url) return null; // URL is optional
  try {
    new URL(url.startsWith('http') ? url : `https://${url}`);
    return null;
  } catch {
    return 'Please enter a valid URL';
  }
};

// Tax ID validation (international format - must contain hyphen)
export const validateTaxId = (taxId: string): string | null => {
  if (!taxId) return null; // Tax ID is optional
  if (!taxId.includes('-')) {
    return 'Tax ID must contain a hyphen (-)';
  }
  return null;
};

// Bank account number validation
export const validateAccountNumber = (accountNumber: string): string | null => {
  if (!accountNumber) return 'Account number is required';
  if (accountNumber.length < 4) {
    return 'Account number must be at least 4 digits';
  }
  return null;
};

// Routing number validation (US format)
export const validateRoutingNumber = (routingNumber: string): string | null => {
  if (!routingNumber) return 'Routing number is required';
  const routingRegex = /^\d{9}$/;
  if (!routingRegex.test(routingNumber)) {
    return 'Routing number must be 9 digits';
  }
  return null;
};

// File validation
export const validateFile = (file: File | null, maxSizeMB: number = 5): string | null => {
  if (!file) return null; // File is optional
  if (file.size > maxSizeMB * 1024 * 1024) {
    return `File size must be less than ${maxSizeMB}MB`;
  }
  return null;
};

// Validate form section
export const validateFormSection = (data: Record<string, any>, rules: Record<string, (value: any) => string | null>): ValidationResult => {
  const errors: ValidationError[] = [];
  
  Object.entries(rules).forEach(([field, validator]) => {
    const error = validator(data[field]);
    if (error) {
      errors.push({ field, message: error });
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
}; 