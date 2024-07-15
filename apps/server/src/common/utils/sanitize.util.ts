export function sanitize(value: string): string {
  // Implement sanitization logic here. This is a basic example that removes
  // special characters. Adjust according to your needs.
  return value.replace(/[^a-zA-Z0-9-_]/g, '');
}

/**
 * Sanitizes a parameter to be used in a Redis key to prevent injection attacks.
 * This is a basic implementation and might need to be adjusted based on your security requirements.
 *
 * @param params The parameters to sanitize.
 * @returns The sanitized parameters.
 */
export function sanitizeParams(params: string[]): string[] {
  return params.map((str) => sanitize(str));
}
