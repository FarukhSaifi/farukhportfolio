export const EMAIL_MAX_LENGTH = 254;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function getEmailValidationError(email: string): string | null {
  const trimmed = email.trim();

  if (!trimmed) {
    return "Please enter your email address.";
  }

  if (trimmed.length > EMAIL_MAX_LENGTH) {
    return "Email address is too long.";
  }

  if (!EMAIL_PATTERN.test(trimmed)) {
    return "Please enter a valid email address.";
  }

  return null;
}

export function isValidEmail(email: string): boolean {
  return getEmailValidationError(email) === null;
}
