/**
 * Date and time utility functions for the trading system
 */

/**
 * Check if the current time is within market hours (9:15 AM to 3:30 PM IST)
 * @returns Boolean indicating if it's market hours
 */
export const isMarketHours = (): boolean => {
  const now = new Date();
  const day = now.getDay();
  const hour = now.getHours();
  const minute = now.getMinutes();

  // Check if it's a weekend (0 = Sunday, 6 = Saturday)
  if (day === 0 || day === 6) {
    return false;
  }

  // Check if it's outside market hours (9:15 AM to 3:30 PM)
  if (hour < 9 || (hour === 9 && minute < 15) || hour > 15 || (hour === 15 && minute > 30)) {
    return false;
  }

  return true;
};

/**
 * Check if it's the market opening time (9:15 AM IST)
 * @param toleranceMinutes Minutes of tolerance (optional)
 * @returns Boolean indicating if it's market opening time
 */
export const isMarketOpeningTime = (toleranceMinutes = 5): boolean => {
  const now = new Date();
  const day = now.getDay();
  const hour = now.getHours();
  const minute = now.getMinutes();

  // Check if it's a weekend (0 = Sunday, 6 = Saturday)
  if (day === 0 || day === 6) {
    return false;
  }

  // Check if it's market opening time with tolerance
  return hour === 9 && minute >= 15 && minute <= 15 + toleranceMinutes;
};

/**
 * Check if it's the market closing time (3:15 PM to 3:30 PM IST)
 * @returns Boolean indicating if it's market closing time
 */
export const isMarketClosingTime = (): boolean => {
  const now = new Date();
  const day = now.getDay();
  const hour = now.getHours();
  const minute = now.getMinutes();

  // Check if it's a weekend (0 = Sunday, 6 = Saturday)
  if (day === 0 || day === 6) {
    return false;
  }

  // Check if it's within 15 minutes of market close
  return hour === 15 && minute >= 15 && minute <= 30;
};

/**
 * Get the next market day (skip weekends)
 * @param date Starting date (optional, defaults to today)
 * @returns Date object for the next market day
 */
export const getNextMarketDay = (date: Date = new Date()): Date => {
  const nextDay = new Date(date);
  nextDay.setDate(nextDay.getDate() + 1);

  // Skip weekend
  if (nextDay.getDay() === 0) { // Sunday
    nextDay.setDate(nextDay.getDate() + 1);
  } else if (nextDay.getDay() === 6) { // Saturday
    nextDay.setDate(nextDay.getDate() + 2);
  }

  return nextDay;
};

/**
 * Format a date to Indian format (DD-MM-YYYY)
 * @param date Date to format
 * @returns Formatted date string
 */
export const formatIndianDate = (date: Date): string => {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
};

/**
 * Format a time in 24-hour format (HH:MM:SS)
 * @param date Date to format
 * @returns Formatted time string
 */
export const formatTime = (date: Date): string => {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');

  return `${hours}:${minutes}:${seconds}`;
};

/**
 * Format a date and time for API requests (YYYY-MM-DD HH:MM:SS)
 * @param date Date to format
 * @returns Formatted date and time string
 */
export const formatAPIDateTime = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

/**
 * Get the start of day for a given date
 * @param date Date to get start of day for
 * @returns Date object set to start of day (00:00:00)
 */
export const getStartOfDay = (date: Date): Date => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  return startOfDay;
};

/**
 * Get the end of day for a given date
 * @param date Date to get end of day for
 * @returns Date object set to end of day (23:59:59.999)
 */
export const getEndOfDay = (date: Date): Date => {
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  return endOfDay;
};

/**
 * Get the start of the week for a given date
 * @param date Date to get start of week for
 * @returns Date object set to start of week (Monday 00:00:00)
 */
export const getStartOfWeek = (date: Date): Date => {
  const startOfWeek = new Date(date);
  const day = startOfWeek.getDay();
  const diff = (day === 0 ? 6 : day - 1); // Adjust for Sunday
  startOfWeek.setDate(startOfWeek.getDate() - diff);
  startOfWeek.setHours(0, 0, 0, 0);
  return startOfWeek;
};

/**
 * Get the end of the week for a given date
 * @param date Date to get end of week for
 * @returns Date object set to end of week (Sunday 23:59:59.999)
 */
export const getEndOfWeek = (date: Date): Date => {
  const endOfWeek = getStartOfWeek(date);
  endOfWeek.setDate(endOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  return endOfWeek;
};

/**
 * Get the start of the month for a given date
 * @param date Date to get start of month for
 * @returns Date object set to start of month (1st day 00:00:00)
 */
export const getStartOfMonth = (date: Date): Date => {
  const startOfMonth = new Date(date);
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  return startOfMonth;
};

/**
 * Get the end of the month for a given date
 * @param date Date to get end of month for
 * @returns Date object set to end of month (last day 23:59:59.999)
 */
export const getEndOfMonth = (date: Date): Date => {
  const endOfMonth = new Date(date);
  endOfMonth.setMonth(endOfMonth.getMonth() + 1);
  endOfMonth.setDate(0);
  endOfMonth.setHours(23, 59, 59, 999);
  return endOfMonth;
};

/**
 * Generate a date string key for weekly analytics
 * @param date Date to generate key for
 * @returns String in format "WEEK-YYYY-WW"
 */
export const getWeekKey = (date: Date): string => {
  const year = date.getFullYear();
  const startOfYear = new Date(year, 0, 1);
  const dayOfYear = Math.floor((date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
  const weekNumber = Math.ceil((dayOfYear + startOfYear.getDay() + 1) / 7);

  return `WEEK-${year}-${weekNumber.toString().padStart(2, '0')}`;
};

/**
 * Generate a date string key for monthly analytics
 * @param date Date to generate key for
 * @returns String in format "MONTH-YYYY-MM"
 */
export const getMonthKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;

  return `MONTH-${year}-${month.toString().padStart(2, '0')}`;
};
