// Regular expressions for validation
export const REGEX = {
  // Time validation: HH:MM format (00:00 to 23:59)
  TIME: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,

  // Currency code: 3 uppercase letters (USD, EUR, GBP, etc.)
  CURRENCY_CODE: /^[A-Z]{3}$/,

  // Phone number: international format
  PHONE: /^\+?[1-9]\d{1,14}$/,
};

// Valid day names
export const VALID_DAYS = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
];

// Validation error messages
export const VALIDATION_MESSAGES = {
  TIME: 'startTime and endTime must be in HH:MM format (00:00 to 23:59)',
  CURRENCY_CODE: 'Currency code must be exactly 3 uppercase letters (e.g., USD, EUR, GBP)',
  PHONE: 'Phone must be a valid international phone number',
  VALID_DAY: 'Each day must be a valid day name (MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY)',
};
