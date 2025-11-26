/**
 * Generates a unique ID with a prefix and a random 6-digit number
 * @param prefix - The string to prefix the ID with (default: 'CAT')
 * @returns A string in the format "#{prefix}######" (e.g., "#CAT123456")
 */
export const generateUniqueId = (prefix: string = "CAT"): string => {
  // Generate a random 6-digit number between 100000 and 999999
  const randomSixDigitNumber = Math.floor(100000 + Math.random() * 900000);

  // Return the formatted string with the prefix and random number
  return `#${prefix}${randomSixDigitNumber}`;
};

/**
 * Generates a unique category ID with a random 6-digit number
 * @returns A string in the format "#CAT######" (e.g., "#CAT123456")
 */
export const generateCategoryId = (): string => generateUniqueId("CAT");

// You can add more specific ID generators for different entities if needed
// Example:
// export const generateUserId = (): string => generateUniqueId('USR');
// export const generateOrderId = (): string => generateUniqueId('ORD');
