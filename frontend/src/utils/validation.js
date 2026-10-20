/** Strip all non-digits and truncate to 10 characters. Safe for typing, pasting, and autofill. */
export function sanitizePhone(value) {
  return String(value).replace(/\D/g, '').slice(0, 10);
}

export function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validatePhone(phone) {
  return /^[6-9]\d{9}$/.test(phone.replace(/\s/g, ''));
}

export function validatePassword(password) {
  return password.length >= 8;
}

export function validateRequired(value) {
  return value !== null && value !== undefined && String(value).trim().length > 0;
}

export function validateRegistration({ name, email, mobile, password, confirmPassword }) {
  const errors = {};
  if (!validateRequired(name)) errors.name = 'Name is required';
  if (!validateRequired(email)) errors.email = 'Email is required';
  else if (!validateEmail(email)) errors.email = 'Enter a valid email address';
  if (!validateRequired(mobile)) errors.mobile = 'Mobile number is required';
  else if (!validatePhone(mobile)) errors.mobile = 'Enter a valid 10-digit mobile number';
  if (!validateRequired(password)) errors.password = 'Password is required';
  else if (!validatePassword(password)) errors.password = 'Password must be at least 8 characters';
  if (!validateRequired(confirmPassword)) errors.confirmPassword = 'Please confirm your password';
  else if (password !== confirmPassword) errors.confirmPassword = 'Passwords do not match';
  return errors;
}

export function validateLogin({ email, password }) {
  const errors = {};
  if (!validateRequired(email)) errors.email = 'Email is required';
  else if (!validateEmail(email)) errors.email = 'Enter a valid email address';
  if (!validateRequired(password)) errors.password = 'Password is required';
  return errors;
}

export function validateEnquiry({ name, mobile, email, message }) {
  const errors = {};
  if (!validateRequired(name)) errors.name = 'Name is required';
  if (!validateRequired(mobile)) errors.mobile = 'Mobile number is required';
  else if (!validatePhone(mobile)) errors.mobile = 'Enter a valid 10-digit mobile number';
  if (email && !validateEmail(email)) errors.email = 'Enter a valid email address';
  if (!validateRequired(message)) errors.message = 'Message is required';
  return errors;
}
