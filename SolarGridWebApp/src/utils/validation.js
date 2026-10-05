/**
 * Simple frontend validation helpers.
 * Real business rules are enforced by the C# API later.
 */

export function required(value, label = 'This field') {
  if (value === null || value === undefined || String(value).trim() === '') {
    return `${label} is required.`;
  }
  return '';
}

export function emailFormat(value) {
  if (!value) return '';
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(value) ? '' : 'Enter a valid email address.';
}

export function isNumeric(value, label = 'Value') {
  if (value === '' || value === null || value === undefined) return '';
  return Number.isFinite(Number(value)) ? '' : `${label} must be a number.`;
}

export function isPositiveNumber(value, label = 'Value') {
  const numErr = isNumeric(value, label);
  if (numErr) return numErr;
  if (value === '' || value === null) return '';
  return Number(value) > 0 ? '' : `${label} must be greater than 0.`;
}

export function latitudeValid(value) {
  if (value === '' || value === null) return '';
  const n = Number(value);
  if (!Number.isFinite(n)) return 'Latitude must be a number.';
  if (n < -90 || n > 90) return 'Latitude must be between -90 and 90.';
  return '';
}

export function longitudeValid(value) {
  if (value === '' || value === null) return '';
  const n = Number(value);
  if (!Number.isFinite(n)) return 'Longitude must be a number.';
  if (n < -180 || n > 180) return 'Longitude must be between -180 and 180.';
  return '';
}

/**
 * UX-only checks for reservation rules (API will enforce for real).
 * Returns an error message string or empty string.
 */
export function reservationWithin7Days(dateStr) {
  if (!dateStr) return '';
  const selected = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  selected.setHours(0, 0, 0, 0);

  const diffDays = Math.ceil((selected - today) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 'Reservation date cannot be in the past.';
  if (diffDays > 7) return 'Reservation must be within 7 days.';
  return '';
}

export function atLeast12HoursNotice(dateStr, timeStr) {
  if (!dateStr || !timeStr) return '';
  const scheduled = new Date(`${dateStr}T${timeStr}`);
  const now = new Date();
  const diffHours = (scheduled - now) / (1000 * 60 * 60);
  if (diffHours < 12) {
    return 'Updates or cancellations require at least 12 hours notice.';
  }
  return '';
}
