import { format as formatDate, parseISO } from 'date-fns';

/**
 * Convert peso amount to centavos (integer storage)
 */
export function toCentavos(amount: number): number {
  return Math.round(amount * 100);
}

/**
 * Convert centavos to peso amount
 */
export function fromCentavos(centavos: number): number {
  return centavos / 100;
}

/**
 * Format centavos as PHP currency string
 */
export function formatPHP(centavos: number): string {
  return `₱${fromCentavos(centavos).toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Format date string (YYYY-MM-DD) to readable format
 */
export function formatDateString(dateString: string, formatString: string = 'MMM d, yyyy'): string {
  return formatDate(parseISO(dateString), formatString);
}

/**
 * Get today's date in YYYY-MM-DD format
 */
export function getTodayString(): string {
  return formatDate(new Date(), 'yyyy-MM-dd');
}
