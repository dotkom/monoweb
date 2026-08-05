import {
  CourseCampusSchema,
  CourseFilterSortSchema,
  MinLetterGradeFilterSchema,
  SemesterSchema,
  TeachingLanguageSchema,
  type CourseFilterQuery,
  type CourseFilterSort,
} from "@dotkomonline/grades-backend/course"
import { parseAsArrayOf, parseAsString, parseAsStringEnum } from "nuqs/server"

export type CourseFilterSortValue = `${CourseFilterSort}:${"asc" | "desc"}`

export const EMPTY_COURSE_FILTER_QUERY = {
  bySearch: "",
  sortBy: ["CANDIDATE_COUNT"],
  orderBy: "desc",
  bySemester: [],
  byTeachingLanguage: [],
  byCampus: [],
  byMinGrade: null,
} as const satisfies CourseFilterQuery

export const COURSE_FILTER_SORT_OPTIONS = [
  { value: "CANDIDATE_COUNT:desc", labelKey: "mostCandidates" },
  { value: "AVERAGE_GRADE:desc", labelKey: "highestGrade" },
  { value: "PASS_RATE:desc", labelKey: "highestPassRate" },
  { value: "CANDIDATE_COUNT:asc", labelKey: "leastCandidates" },
  { value: "AVERAGE_GRADE:asc", labelKey: "lowestGrade" },
  { value: "PASS_RATE:asc", labelKey: "lowestPassRate" },
] as const satisfies ReadonlyArray<{ value: CourseFilterSortValue; labelKey: string }>

export const DEFAULT_COURSE_FILTER_SORT = COURSE_FILTER_SORT_OPTIONS[0].value

export function toCourseFilterSortValue(
  sortBy: CourseFilterQuery["sortBy"] = ["CANDIDATE_COUNT"],
  orderBy: CourseFilterQuery["orderBy"] = "desc"
): CourseFilterSortValue {
  return `${sortBy[0] ?? "CANDIDATE_COUNT"}:${orderBy ?? "desc"}`
}

export function parseCourseFilterSortValue(value: string): {
  sortBy: CourseFilterSort[]
  orderBy: "asc" | "desc"
} | null {
  const [sortBy, orderBy] = value.split(":")
  if (!sortBy || (orderBy !== "asc" && orderBy !== "desc")) {
    return null
  }

  return {
    sortBy: [sortBy as CourseFilterSort],
    orderBy,
  }
}

export function findCourseFilterSortOption(value: CourseFilterSortValue) {
  return COURSE_FILTER_SORT_OPTIONS.find((option) => option.value === value) ?? COURSE_FILTER_SORT_OPTIONS[0]
}

export const CourseFilterParsers = {
  bySearch: parseAsString.withDefault(""),
  sortBy: parseAsArrayOf(parseAsStringEnum(CourseFilterSortSchema.options)).withDefault(["CANDIDATE_COUNT"]),
  orderBy: parseAsStringEnum(["asc", "desc"] as const).withDefault("desc"),
  bySemester: parseAsArrayOf(parseAsStringEnum(SemesterSchema.options)).withDefault([]),
  byTeachingLanguage: parseAsArrayOf(parseAsStringEnum(TeachingLanguageSchema.options)).withDefault([]),
  byCampus: parseAsArrayOf(parseAsStringEnum(CourseCampusSchema.options)).withDefault([]),
  byMinGrade: parseAsStringEnum(MinLetterGradeFilterSchema.options),
} satisfies Record<keyof CourseFilterQuery, unknown>
