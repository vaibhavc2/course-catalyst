/**
 * Convert expiry time string to seconds or milliseconds (default seconds)
 *
 * @export
 * @param {string} timeStr
 * @param {boolean} [milliseconds=false]
 * @returns {number}
 */
export function convertExpiry(timeStr: string, milliseconds = false): number {
  const unit = timeStr.slice(-1); // last character
  let value = parseInt(timeStr.slice(0, -1), 10); // remove last character and parse to int

  if (milliseconds) {
    value *= 1000; // convert to milliseconds, if specified
  }

  switch (unit) {
    case 's': // seconds
      return value;
    case 'm': // minutes
      return value * 60;
    case 'h': // hours
      return value * 3600;
    case 'd': // days
      return value * 86400;
    default:
      throw new Error('Unsupported time unit');
  }
}
