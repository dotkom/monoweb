import { DateFns } from "./"

// Arbitrarily chosen
const MIDDLE_OF_JULY = (year: number) => new Date(year, 6, 15)

/**
 * Get the academic year for a given date.
 * 
 * * - After July 15th of the current year, the academic year is the current calendar year.
 * * - On or before July 15th, the academic year is the previous calendar year.
 * 
 * 
 * @param date - The date to determine the academic year for. Defaults to the current date.
 * @returns The academic year as a number.
 */
export const getAcademicYear = (date: Date = new Date()): number => {
  const year = DateFns.getYear(date);
  
  if (DateFns.isAfter(date, MIDDLE_OF_JULY(year))) {
    return year;
  }

  const previousYear = DateFns.subYears(year, 1)

  return DateFns.getYear(previousYear);
}
