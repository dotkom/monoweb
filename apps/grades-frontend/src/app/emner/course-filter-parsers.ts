import {
  CourseFilterSortSchema,
  MinLetterGradeFilterSchema,
  type CourseFilterQuery,
} from "@dotkomonline/grades-backend/course"
import { parseAsArrayOf, parseAsString, parseAsStringEnum } from "nuqs/server"

export const CourseFilterParsers = {
  bySearch: parseAsString.withDefault(""),
  sortBy: parseAsArrayOf(parseAsStringEnum(CourseFilterSortSchema.options)).withDefault(["CANDIDATE_COUNT"]),
  orderBy: parseAsStringEnum(["asc", "desc"] as const).withDefault("desc"),
  bySemester: parseAsArrayOf(parseAsString).withDefault([]),
  byTeachingLanguage: parseAsArrayOf(parseAsString).withDefault([]),
  byCampus: parseAsArrayOf(parseAsString).withDefault([]),
  byMinGrade: parseAsStringEnum(MinLetterGradeFilterSchema.options),
} satisfies Record<keyof CourseFilterQuery, unknown>
