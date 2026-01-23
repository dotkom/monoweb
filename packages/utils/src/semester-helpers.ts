import { TZDate } from "@date-fns/tz"
import { addYears, isBefore, subYears } from "date-fns"
import { getCurrentUTC } from "./utc"

const JANUARY = 0
const AUGUST = 7

/**
 * Get the start of the academic year, which is by our convention January 1st.
 * `January 1st -- <year>-01-01T00:00:00.000Z`
 */
export const getSpringSemesterStart = (date: TZDate | Date = getCurrentUTC()) => {
  return new TZDate(date.getFullYear(), JANUARY, 1, "UTC")
}

/**
 * Get the start of the academic year, which is by our convention August 1st.
 * `August 1st -- <year>-08-01T00:00:00.000Z`
 */
export const getAutumnSemesterStart = (date: TZDate | Date = getCurrentUTC()) => {
  return new TZDate(date.getFullYear(), AUGUST, 1, "UTC")
}

/** Is the given date or 0-indexed semester value representing a Spring semester? */
export const isSpringSemester = (nowOrSemester: TZDate | Date | number = getCurrentUTC()): boolean => {
  if (typeof nowOrSemester === "number") {
    return nowOrSemester % 2 !== 0
  }

  return isBefore(nowOrSemester, getAutumnSemesterStart(nowOrSemester))
}

/** Is the given date or 0-indexed semester value representing an Autumn semester? */
export const isAutumnSemester = (nowOrSemester: TZDate | Date | number = getCurrentUTC()): boolean => {
  return !isSpringSemester(nowOrSemester)
}

export function getNextAutumnSemesterStart(now: TZDate | Date = getCurrentUTC()): TZDate {
  const autumnStart = getAutumnSemesterStart(now)

  if (isBefore(now, autumnStart)) {
    return autumnStart
  }

  return addYears(autumnStart, 1)
}

export function getNextSpringSemesterStart(now: TZDate | Date = getCurrentUTC()): TZDate {
  const springStart = getSpringSemesterStart(now)

  if (isBefore(now, springStart)) {
    return springStart
  }

  return addYears(springStart, 1)
}

export function getPreviousAutumnSemesterStart(now: TZDate | Date = getCurrentUTC()): TZDate {
  const autumnStart = getAutumnSemesterStart(now)

  if (isBefore(now, autumnStart)) {
    return subYears(autumnStart, 1)
  }

  return autumnStart
}

export function getPreviousSpringSemesterStart(now: TZDate | Date = getCurrentUTC()): TZDate {
  const springStart = getSpringSemesterStart(now)

  if (isBefore(now, springStart)) {
    return subYears(springStart, 1)
  }

  return springStart
}

export function getCurrentSemesterStart(): TZDate {
  const now = getCurrentUTC()

  if (isSpringSemester(now)) {
    return getSpringSemesterStart(now)
  }

  return getAutumnSemesterStart(now)
}

export function getNextSemesterStart(now: TZDate | Date = getCurrentUTC()): TZDate {
  if (isSpringSemester(now)) {
    return getAutumnSemesterStart(now)
  }

  return getSpringSemesterStart(addYears(now, 1))
}

export function getPreviousSemesterStart(now: TZDate | Date = getCurrentUTC()): TZDate {
  if (isSpringSemester(now)) {
    return getAutumnSemesterStart(addYears(now, -1))
  }

  return getSpringSemesterStart(now)
}

export function isMembershipActiveUntilNextSemesterStart(membershipEnd: TZDate | Date): boolean {
  return membershipEnd.getTime() === getNextSemesterStart().getTime()
}

/**
 * Subtract a number of semesters from the semester start for the input date.
 * @return The start date of the resulting semester.
 */
export function subSemesters(date: TZDate | Date, semesters: number): TZDate {
  const isSpring = isSpringSemester(date)
  const yearsToSubtract = isSpring ? Math.floor(semesters / 2) : Math.ceil(semesters / 2)
  const shouldSubtractSemester = semesters % 2 !== 0

  const yearResult = subYears(new TZDate(date), yearsToSubtract)

  if (!shouldSubtractSemester) {
    return yearResult
  }

  if (isSpring) {
    return getAutumnSemesterStart(subYears(yearResult, 1))
  }

  return getSpringSemesterStart(yearResult)
}

/**
 * Add a number of semesters to the semester start for the input date.
 * @return The start date of the resulting semester.
 */
export function addSemesters(date: TZDate | Date, semesters: number): TZDate {
  const isSpring = isSpringSemester(date)
  const yearsToAdd = isSpring ? Math.ceil(semesters / 2) : Math.floor(semesters / 2)
  const shouldAddSemester = semesters % 2 !== 0

  const yearResult = addYears(new TZDate(date), yearsToAdd)

  if (!shouldAddSemester) {
    return yearResult
  }

  if (isSpring) {
    return getAutumnSemesterStart(yearResult)
  }

  return getSpringSemesterStart(addYears(yearResult, 1))
}

export function getSemesterDifference(start: TZDate | Date, end: TZDate | Date): number {
  const startIsSpring = isSpringSemester(start)
  const endIsSpring = isSpringSemester(end)

  const yearDifference = end.getFullYear() - start.getFullYear()
  const semesterDifference = yearDifference * 2

  if (startIsSpring && !endIsSpring) {
    return semesterDifference + 1
  }

  if (!startIsSpring && endIsSpring) {
    return semesterDifference - 1
  }

  return semesterDifference
}

export function getStudyGrade(semester: number): number {
  // A school year consists of two semesters (Autumn and Spring). So this formula will give us the year:
  //   Year 1 autumn (value 0): floor(0 / 2) + 1 = 1 (Year 1)
  //   Year 1 spring (value 1): floor(1 / 2) + 1 = 1 (Year 1)
  //   Year 2 autumn (value 2): floor(2 / 2) + 1 = 2 (Year 2)
  //   Year 2 spring (value 3): floor(3 / 2) + 1 = 2 (Year 2)
  //   Year 3 autumn (value 4): floor(4 / 2) + 1 = 3 (Year 3)
  //   ...
  return Math.floor(semester / 2) + 1
}
