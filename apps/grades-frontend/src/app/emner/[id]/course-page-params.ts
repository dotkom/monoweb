import { parseSemesterKey, serializeSemesterKey, type SemesterKey } from "@dotkomonline/grades-backend/course"
import { createParser, parseAsBoolean, type inferParserType } from "nuqs/server"

export type PeriodPreset = "ALL_YEARS" | "LAST_THREE_YEARS"

export type PeriodSelection =
  | { kind: "preset"; preset: PeriodPreset }
  | { kind: "semester"; semester: SemesterKey | null }

export const parseAsSemesterKey = createParser({
  parse(value) {
    return parseSemesterKey(value)
  },
  serialize(semester) {
    return serializeSemesterKey(semester)
  },
})

function serializePeriodSelection(selection: PeriodSelection) {
  if (selection.kind === "preset") {
    return selection.preset
  }

  return selection.semester ? parseAsSemesterKey.serialize(selection.semester) : ""
}

export const parseAsPeriodSelection = createParser<PeriodSelection>({
  parse(value) {
    if (value === "ALL_YEARS" || value === "LAST_THREE_YEARS") {
      return { kind: "preset", preset: value }
    }

    const semester = parseSemesterKey(value)
    return semester ? { kind: "semester", semester } : null
  },
  serialize: serializePeriodSelection,
})

export const CoursePageParsers = {
  period: parseAsPeriodSelection,
  vs: parseAsPeriodSelection.withDefault({
    kind: "preset",
    preset: "LAST_THREE_YEARS",
  }),
  isSameSeason: parseAsBoolean,
  isGhost: parseAsBoolean,
}

export type CoursePageParams = inferParserType<typeof CoursePageParsers>
