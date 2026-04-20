import type { StudyLevel, TeachingLanguage } from "@dotkomonline/grades-db"
import * as cheerio from "cheerio"
import type { Element } from "domhandler"
import sanitizeHtml from "sanitize-html"
import type { CourseCampus, CourseCode, GradeType, Semester } from "../../modules/course/course-types"

export type Locale = "no" | "en"

export type NtnuCourse = {
  code: CourseCode
  name: string
  credits: number | null
  studyLevel: StudyLevel
  gradeType: GradeType
  content: string
  teachingMethods: string
  learningOutcomes: string
  examType: string | null
  taughtSemesters: Semester[]
  teachingLanguages: TeachingLanguage[]
  campuses: CourseCampus[]
  creditReductions: CreditsReduction[]
  yearFetchedFor: number | null
}

const COURSE_PAGE_TRANSLATIONS = {
  credits: {
    no: "Studiepoeng",
    en: "Credits",
  },
  studyLevel: {
    no: "Nivå",
    en: "Level",
  },
  courseStart: {
    no: "Undervisningsstart",
    en: "Course start",
  },
  teachingLanguage: {
    no: "Undervisningsspråk",
    en: "Language of instruction",
  },
  location: {
    no: "Sted",
    en: "Location",
  },
  examType: {
    no: "Vurderingsordning",
    en: "Examination arrangement",
  },
  autumnSemester: {
    no: "Høst",
    en: "Autumn",
  },
  springSemester: {
    no: "Vår",
    en: "Spring",
  },
  norwegian: {
    no: "Norsk",
    en: "Norwegian",
  },
  english: {
    no: "Engelsk",
    en: "English",
  },
  letterGrade: {
    no: "Bokstavkarakterer",
    en: "Letter",
  },
  passed: {
    no: "Bestått",
    en: "Passed",
  },
  noDataForYear: {
    no: "Det finnes ingen informasjon for dette studieåret",
    en: "There is no information available for the given academic year",
  },
}

const STUDY_LEVEL_MAPPINGS: Record<Locale, Record<string, StudyLevel>> = {
  no: {
    "doktorgrads nivå": "PHD",
    "videreutdanning høyere grad": "CONTINUING_EDUCATION",
    "videreutdanning lavere grad": "CONTINUING_EDUCATION",
    "høyere grads nivå": "MASTER",
    "fjerdeårsemner, nivå iv": "MASTER",
    "tredjeårsemner, nivå iii": "BACHELOR_ADVANCED",
    "videregående emner, nivå ii": "INTERMEDIATE",
    "grunnleggende emner, nivå i": "FOUNDATION",
    "lavere grad, redskapskurs": "FOUNDATION",
    "norsk for internasjonale studenter": "FOUNDATION",
    "examen philosophicum": "FOUNDATION",
    "examen facultatum": "FOUNDATION",
    "forprøve/forkurs": "FOUNDATION",
  },
  en: {
    "doctoral degree level": "PHD",
    "further education, higher degree level": "CONTINUING_EDUCATION",
    "further education, lower degree level": "CONTINUING_EDUCATION",
    "second degree level": "MASTER",
    "fourth-year courses, level IV": "MASTER",
    "fourth-year courses, level iv": "MASTER",
    "third-year courses, level III": "BACHELOR_ADVANCED",
    "third-year courses, level iii": "BACHELOR_ADVANCED",
    "intermediate course, level II": "INTERMEDIATE",
    "intermediate course, level ii": "INTERMEDIATE",
    "foundation courses, level I": "FOUNDATION",
    "foundation courses, level i": "FOUNDATION",
    "first degree": "FOUNDATION",
    "norwegian for international students": "FOUNDATION",
    "examen philosophicum": "FOUNDATION",
    "examen facultatum": "FOUNDATION",
    "preparatory test/preparatory course": "FOUNDATION",
  },
}

type CreditsReduction = {
  overlapCourseCode: string
  reductionCredits: number
}

export function parseNtnuCoursePage(
  html: string,
  courseCode: CourseCode,
  locale: Locale,
  yearFetchedFor?: number
): NtnuCourse | null {
  const $ = cheerio.load(html)

  if (hasNoDataForYear($, locale)) {
    return null
  }

  const name = $(".course-name").text().trim()
  const content = parseAboutCourseSection($(".content-course-content").parent())
  const learningOutcomes = parseAboutCourseSection($(".content-learning-goal").parent())
  const teachingMethods = parseAboutCourseSection($(".content-learning-method").parent())

  const courseFacts = $(".course-facts").children()

  const rawCredits = parseCourseFact($, courseFacts, COURSE_PAGE_TRANSLATIONS.credits[locale])
  const credits = parseCredits(rawCredits ?? "")

  const examType = parseCourseFact($, courseFacts, COURSE_PAGE_TRANSLATIONS.examType[locale])

  const rawStudyLevel = parseCourseFact($, courseFacts, COURSE_PAGE_TRANSLATIONS.studyLevel[locale])
  const studyLevel = mapStudyLevel(rawStudyLevel, locale)

  const courseStart = parseCourseFact($, courseFacts, COURSE_PAGE_TRANSLATIONS.courseStart[locale])?.toLowerCase()
  const taughtSemesters = parseSemesters(courseStart ?? "", locale)

  const rawLanguages = parseCourseFact($, courseFacts, COURSE_PAGE_TRANSLATIONS.teachingLanguage[locale])?.toLowerCase()
  const teachingLanguages = parseLanguages(rawLanguages ?? "", locale)

  const rawLocation = parseCourseFact($, courseFacts, COURSE_PAGE_TRANSLATIONS.location[locale])?.toLowerCase()
  const campuses = parseCampuses(rawLocation ?? "")

  const rawGradeType = $(".grade-rule-heading").text().trim()
  const gradeType = mapGradeType(rawGradeType, locale)

  const creditReductionsTable = $(".content-credit-reductions")
  const creditReductions = parseCreditReductions(creditReductionsTable, $)

  const resolvedYearFetchedFor = resolveFetchedYear($, yearFetchedFor)

  return {
    code: courseCode,
    name,
    credits,
    studyLevel,
    gradeType,
    content,
    teachingMethods,
    learningOutcomes,
    examType,
    taughtSemesters,
    teachingLanguages,
    campuses,
    creditReductions,
    yearFetchedFor: resolvedYearFetchedFor,
  }
}

function parseCredits(rawCredits: string): number | null {
  const normalized = rawCredits.trim().replace(",", ".")
  const parsed = parseFloat(normalized)

  return Number.isNaN(parsed) ? null : parsed
}

function parseSemesters(courseStart: string, locale: Locale): Semester[] {
  const semesters: Semester[] = []

  const lowerCourseStart = courseStart.toLowerCase()
  if (lowerCourseStart.includes(COURSE_PAGE_TRANSLATIONS.autumnSemester[locale].toLowerCase())) {
    semesters.push("AUTUMN")
  }
  if (lowerCourseStart.includes(COURSE_PAGE_TRANSLATIONS.springSemester[locale].toLowerCase())) {
    semesters.push("SPRING")
  }

  return semesters
}

function parseLanguages(languagesString: string, locale: Locale): TeachingLanguage[] {
  const teachingLanguages: TeachingLanguage[] = []

  const lowerLanguagesString = languagesString.toLowerCase()
  if (lowerLanguagesString.includes(COURSE_PAGE_TRANSLATIONS.norwegian[locale].toLowerCase())) {
    teachingLanguages.push("NORWEGIAN")
  }
  if (lowerLanguagesString.includes(COURSE_PAGE_TRANSLATIONS.english[locale].toLowerCase())) {
    teachingLanguages.push("ENGLISH")
  }

  return teachingLanguages
}

function parseCampuses(locationString: string): CourseCampus[] {
  const campuses: CourseCampus[] = []

  const lowerLocationString = locationString.toLowerCase()
  if (lowerLocationString.includes("trondheim")) {
    campuses.push("TRONDHEIM")
  }
  if (lowerLocationString.includes("ålesund")) {
    campuses.push("ALESUND")
  }
  if (lowerLocationString.includes("gjøvik")) {
    campuses.push("GJOVIK")
  }

  return campuses
}

function parseCourseFact($: cheerio.CheerioAPI, courseFacts: cheerio.Cheerio<Element>, label: string) {
  const fact = courseFacts.filter((_, el) => {
    const labelElement = $(el).find(".course-fact-label")
    return labelElement.text().trim() === label
  })

  if (fact.length === 0) {
    return null
  }

  const clonedFact = fact.clone()
  clonedFact.find(".course-fact-label").remove()
  const value = clonedFact.text().trim()

  return value
}

function parseCreditReductions(table: cheerio.Cheerio<Element>, $: cheerio.CheerioAPI): CreditsReduction[] {
  const reductions: CreditsReduction[] = []
  const rows = table.find("tbody tr")

  rows.each((_, row) => {
    const cells = $(row).children("td")

    if (cells.length < 2) {
      return
    }

    const overlapCourseCode = cells.eq(0).text().trim()

    // "7,5 sp"
    const rawReductionCredits = cells.eq(1).text().trim().split(" ")[0] ?? ""
    const reductionCredits = parseCredits(rawReductionCredits)

    if (!overlapCourseCode || reductionCredits === null || reductionCredits <= 0) {
      return
    }

    reductions.push({
      overlapCourseCode,
      reductionCredits,
    })
  })

  return reductions
}

function mapStudyLevel(description: string | null, locale: Locale): StudyLevel {
  if (!description) {
    return "UNKNOWN"
  }

  const normalized = description.trim().toLowerCase()
  return STUDY_LEVEL_MAPPINGS[locale][normalized] ?? "UNKNOWN"
}

function mapGradeType(description: string | null, locale: Locale): GradeType {
  const lowerDesc = description?.trim().toLowerCase() ?? ""
  if (lowerDesc.includes(COURSE_PAGE_TRANSLATIONS.letterGrade[locale].toLowerCase())) {
    return "LETTER"
  }

  if (lowerDesc.includes(COURSE_PAGE_TRANSLATIONS.passed[locale].toLowerCase())) {
    return "PASS_FAIL"
  }

  return "UNKNOWN"
}

const ALLOWED_CONTENT_TAGS = ["p", "ul", "ol", "li", "strong", "b", "em", "i", "br"]

function parseAboutCourseSection(section: cheerio.Cheerio<Element>) {
  const clonedSection = section.clone()
  if (!clonedSection.length) {
    return ""
  }

  // Remove section heading
  clonedSection.children("h1, h2, h3, h4, h5, h6").first().remove()

  const sanitizedHtml = sanitizeHtml(clonedSection.html() ?? "", {
    allowedTags: ALLOWED_CONTENT_TAGS,
    exclusiveFilter(frame) {
      // Remove empty block elements
      return ["p", "ul", "ol", "li"].includes(frame.tag) && !frame.text.trim()
    },
  })

  return sanitizedHtml.trim()
}

function hasNoDataForYear($: cheerio.CheerioAPI, locale: Locale): boolean {
  const heading = $("#course-details").find("h1, h2, h3, h4, h5, h6").first().text().trim()

  return heading === COURSE_PAGE_TRANSLATIONS.noDataForYear[locale]
}

function resolveFetchedYear($: cheerio.CheerioAPI, requestedYear?: number): number | null {
  if (requestedYear !== undefined) {
    return requestedYear
  }

  const yearSelect = $("#selectedYear")
  const selectedOption = yearSelect.find("option[selected]").first()
  const rawValue = selectedOption.val()

  if (!rawValue) {
    return null
  }

  const year = Number(rawValue)

  if (!Number.isInteger(year)) {
    return null
  }

  return year
}
