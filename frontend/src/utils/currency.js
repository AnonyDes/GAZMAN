/**
 * Format price in XAF (FCFA) for Cameroon
 * @param {number} amount - Amount in XAF (integer)
 * @returns {string} Formatted price string (e.g., "12 000 FCFA")
 */
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '0 FCFA';
  }
  
  // Format using fr-CM locale for proper thousands separator
  const formatted = new Intl.NumberFormat('fr-CM', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
  
  return `${formatted} FCFA`;
};

/**
 * Format price without currency symbol
 * @param {number} amount - Amount in XAF (integer)
 * @returns {string} Formatted number (e.g., "12 000")
 */
export const formatNumber = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '0';
  }
  
  return new Intl.NumberFormat('fr-CM', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};
