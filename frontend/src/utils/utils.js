/**
 * Format date string into a friendly localized display
 * @param {string|Date} date - Date representation
 * @returns {string} Friendly date (e.g. Jun 17, 2026, 8:48 PM)
 */
export const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Format raw file bytes into human readable MB/KB string
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted string
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Capitalize first letter of string
 * @param {string} str - Input
 * @returns {string} Capitalized output
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};
