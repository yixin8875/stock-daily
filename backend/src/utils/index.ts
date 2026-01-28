/**
 * Format date to YYYY-MM-DD string
 */
export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

/**
 * Parse date string to Date object (start of day)
 */
export const parseDate = (dateString: string): Date => {
  const date = new Date(dateString);
  date.setHours(0, 0, 0, 0);
  return date;
};

/**
 * Get start and end of day for a given date
 */
export const getDayRange = (date: Date): { start: Date; end: Date } => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

/**
 * Calculate percentage change
 */
export const calculatePercentChange = (
  oldValue: number,
  newValue: number
): number => {
  if (oldValue === 0) return 0;
  return ((newValue - oldValue) / oldValue) * 100;
};

/**
 * Async wrapper for route handlers
 */
export const asyncHandler = (fn: Function) => {
  return (req: any, res: any, next: any) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export * from './errorCodes';
export * from './retry';
export * from './response';
