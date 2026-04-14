import { getCurrentUTC } from "@dotkomonline/utils"
import { secondsToMilliseconds } from "date-fns"
import pRetry, { AbortError } from "p-retry"
import type { CourseCode } from "../../modules/course/course-types"
import { parseNtnuCoursePage, type Locale, type NtnuCourse } from "./ntnu-course-parser"

const FETCH_TIMEOUT = secondsToMilliseconds(10)
const RETRYABLE_STATUS_CODES = new Set([429, 500, 502, 503, 504])

export async function scrapeNtnuCourse(
  courseCode: CourseCode,
  oldestYearCheckedForNtnuData?: number
): Promise<{
  no: NtnuCourse
  en: NtnuCourse | null
} | null> {
  const yearsToTry = getYearsToTry(oldestYearCheckedForNtnuData)

  for (const year of yearsToTry) {
    const ntnuCourseData = await scrapeCourseForYear(courseCode, year)
    if (ntnuCourseData) {
      return ntnuCourseData
    }
  }

  return null
}

async function scrapeCourseForYear(courseCode: CourseCode, year: number | null) {
  const noHtml = await fetchNtnuCoursePage(courseCode, year, "no")
  const parsedNo = parseNtnuCoursePage(noHtml, courseCode, "no")

  // Assuming that if there's no data in norwegian, there won't be any in english either.
  // So we only scrape the english page if we find data for the norwegian page.
  if (parsedNo === null) {
    return null
  }

  const enHtml = await fetchNtnuCoursePage(courseCode, year, "en")
  const parsedEn = parseNtnuCoursePage(enHtml, courseCode, "en")

  return {
    no: parsedNo,
    en: parsedEn,
  }
}

async function fetchNtnuCoursePage(courseCode: CourseCode, year: number | null, locale: Locale): Promise<string> {
  const baseUrl = locale === "en" ? "https://www.ntnu.edu/studies/courses" : "https://www.ntnu.no/studier/emner"
  let url = `${baseUrl}/${courseCode}`

  if (year !== null) {
    url += `/${year}`
  }

  // Using pRetry to handle retries and exponential backoff in case of errors or rate limiting.
  return pRetry(
    async () => {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(FETCH_TIMEOUT),
      })

      if (response.status === 404) {
        throw new AbortError(`Not found: ${url}`)
      }

      if (RETRYABLE_STATUS_CODES.has(response.status)) {
        throw new Error(`Retryable status: ${response.status}`)
      }

      if (!response.ok) {
        throw new AbortError(`Non-retryable status: ${response.status}`)
      }

      return response.text()
    },
    {
      retries: 2,
      factor: 2,
      minTimeout: 500,
      maxTimeout: 2000,
      randomize: true,
    }
  )
}

function getYearsToTry(oldestYearCheckedForNtnuData?: number): Array<number | null> {
  const currentYear = getCurrentUTC().getUTCFullYear()
  const defaultOldestYear = currentYear - 4

  let oldestYearToTry = defaultOldestYear
  if (oldestYearCheckedForNtnuData !== undefined) {
    // Either try 4 years back, or stop at the oldest year we last checked for data to avoid unnecessary requests
    oldestYearToTry = Math.max(defaultOldestYear, oldestYearCheckedForNtnuData)
  }

  // Always try without year first, as it might redirect to the latest year with data
  const yearsToTry: Array<number | null> = [null]

  for (let year = currentYear; year >= oldestYearToTry; year--) {
    yearsToTry.push(year)
  }

  return yearsToTry
}
