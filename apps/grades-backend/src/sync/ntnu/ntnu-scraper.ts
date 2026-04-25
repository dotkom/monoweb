import { getCurrentUTC } from "@dotkomonline/utils"
import { secondsToMilliseconds } from "date-fns"
import pLimit from "p-limit"
import pRetry, { AbortError } from "p-retry"
import type { CourseCode } from "../../modules/course/course-types"
import { parseNtnuCoursePage, type Locale, type NtnuCourse, type NtnuCoursePageParseResult } from "./ntnu-course-parser"

const FETCH_TIMEOUT = secondsToMilliseconds(3)
const RETRYABLE_STATUS_CODES = new Set([429, 500, 502, 503, 504])

const NTNU_BASE_URL_NO = "https://www.ntnu.no/studier/emner"
const NTNU_BASE_URL_EN = "https://www.ntnu.edu/studies/courses"

const NTNU_FETCH_CONCURRENCY = 1
const limitNtnuFetch = pLimit(NTNU_FETCH_CONCURRENCY)

export type NtnuCourseScrapeResult = {
  no: NtnuCourse | null
  en: NtnuCourse | null
  latestYearCheckedForNtnuData: number
}

export async function scrapeNtnuCourse(
  courseCode: CourseCode,
  latestYearCheckedForNtnuData?: number,
  lastYearTaught?: number
): Promise<NtnuCourseScrapeResult> {
  const yearsToTry = getYearsToTry(latestYearCheckedForNtnuData, lastYearTaught)
  const currentYear = getCurrentUTC().getUTCFullYear()

  let fallbackResult: NtnuCourseScrapeResult | null = null

  for (let i = 0; i < yearsToTry.length; i++) {
    const year = yearsToTry[i]

    try {
      const ntnuCourseData = await scrapeCourseForYear(courseCode, year)
      if (!ntnuCourseData) {
        continue
      }

      const currentResult: NtnuCourseScrapeResult = {
        no: ntnuCourseData.no.course,
        en: ntnuCourseData.en?.course ?? null,
        latestYearCheckedForNtnuData: currentYear,
      }

      // On discontinued courses, some years could have a "no longer taught" notice, meaning the course page could have no or very little data.
      // So if we encounter that notice, we store the current result as a fallback,
      // and keep trying up to 2 additional years to see if we can find a course page without the notice.
      // If we never find a course page without the notice, we return the fallback result, as that is the most recent data we found.
      if (!ntnuCourseData.no.hasNoLongerTaughtNotice) {
        return currentResult
      }

      if (!fallbackResult) {
        fallbackResult = currentResult

        // Only add extra years to try if we are currently checking the last or second to last year in the list, to avoid attempting too many years in total
        const shouldTryTwoMoreYears = year !== null && i >= yearsToTry.length - 2

        if (shouldTryTwoMoreYears) {
          const extraYears = [year - 1, year - 2].filter(
            (extraYear) => extraYear > 0 && !yearsToTry.includes(extraYear)
          )
          yearsToTry.push(...extraYears)
        }
      }
    } catch (error) {
      console.error(`Failed scraping Norwegian course page for ${courseCode} (${year ?? "latest"}):`, error)
      break
    }
  }

  return (
    fallbackResult ?? {
      no: null,
      en: null,
      latestYearCheckedForNtnuData: currentYear,
    }
  )
}

async function scrapeCourseForYear(courseCode: CourseCode, year: number | null) {
  const noHtml = await fetchNtnuCoursePage(courseCode, year, "no")
  const parsedNo = noHtml ? parseNtnuCoursePage(noHtml, courseCode, "no") : null

  // Assuming that if there's no data in norwegian, there won't be any in english either.
  // So we only scrape the english page if we find data for the norwegian page.
  if (parsedNo === null) {
    return null
  }

  let parsedEn: NtnuCoursePageParseResult | null = null

  // Even if scraping the english page fails, we still want to return the norwegian page data
  try {
    const enHtml = await fetchNtnuCoursePage(courseCode, year, "en")
    parsedEn = enHtml ? parseNtnuCoursePage(enHtml, courseCode, "en") : null
  } catch (error) {
    console.warn(`Failed scraping English course page for ${courseCode} (${year ?? "latest"}):`, error)
  }

  return {
    no: parsedNo,
    en: parsedEn,
  }
}

async function fetchNtnuCoursePage(
  courseCode: CourseCode,
  year: number | null,
  locale: Locale
): Promise<string | null> {
  return limitNtnuFetch(async () => {
    const baseUrl = locale === "en" ? NTNU_BASE_URL_EN : NTNU_BASE_URL_NO
    let url = `${baseUrl}/${courseCode}`

    if (year !== null) {
      url += `/${year}`
    }

    return pRetry(
      async () => {
        const response = await fetch(url, {
          signal: AbortSignal.timeout(FETCH_TIMEOUT),
        })

        if (response.status === 404) {
          return null
        }

        if (RETRYABLE_STATUS_CODES.has(response.status)) {
          throw new Error()
        }

        if (!response.ok) {
          throw new AbortError(`Failed to fetch data for url ${url}: ${response.status}`)
        }

        return response.text()
      },
      {
        retries: 1,
        factor: 2,
        minTimeout: 500,
        maxTimeout: 2000,
        randomize: true,
      }
    )
  })
}

function getYearsToTry(latestYearCheckedForNtnuData?: number, lastYearTaught?: number): Array<number | null> {
  const currentYear = getCurrentUTC().getUTCFullYear()

  // 4 years is chosen as an arbitrary cutoff to avoid trying to scrape too many years back,
  // while still scraping enough years to find relevant data for most courses
  const defaultOldestYear = currentYear - 4

  let oldestYearToTry = defaultOldestYear

  if (latestYearCheckedForNtnuData !== undefined) {
    // Either try 4 years back, or stop at the oldest year we last checked
    oldestYearToTry = Math.max(defaultOldestYear, latestYearCheckedForNtnuData)
  }

  // Always try without year first, since the url without a year often returns the most recent course data
  const yearsToTry: Array<number | null> = [null]

  for (let year = currentYear; year >= oldestYearToTry; year--) {
    yearsToTry.push(year)
  }

  // If we have never scraped NTNU for this course before, also try the last year
  // the course was taught and the year before that, as those years are more likely to have data.
  if (latestYearCheckedForNtnuData === undefined && lastYearTaught && lastYearTaught > 0) {
    yearsToTry.push(lastYearTaught)

    if (lastYearTaught - 1 > 0) {
      yearsToTry.push(lastYearTaught - 1)
    }
  }

  return Array.from(new Set(yearsToTry))
}
