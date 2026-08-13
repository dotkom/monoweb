import { parseSemesterKey, serializeSemesterKey, type SemesterKey } from "@dotkomonline/grades-backend/course"
import { createParser, parseAsBoolean, type inferParserType } from "nuqs/server"

export type PeriodPreset = "ALL_YEARS" | "LAST_THREE_YEARS"

export type PeriodSelection =
  | { kind: "preset"; preset: PeriodPreset }
  | { kind: "semester"; semester: SemesterKey | null }

export const parseAsSemesterKey = createParser({
  parse(value) {
    return parseSemesterKey(value.toUpperCase())
  },
  serialize(semester) {
    return serializeSemesterKey(semester).toLowerCase()
  },
})

function serializePeriodSelection(selection: PeriodSelection) {
  if (selection.kind === "preset") {
    return selection.preset.toLowerCase()
  }

  return selection.semester ? parseAsSemesterKey.serialize(selection.semester) : ""
}

export const parseAsPeriodSelection = createParser<PeriodSelection>({
  parse(value) {
    const upper = value.toUpperCase()

    if (upper === "ALL_YEARS" || upper === "LAST_THREE_YEARS") {
      return { kind: "preset", preset: upper }
    }

    const semester = parseSemesterKey(upper)
    return semester ? { kind: "semester", semester } : null
  },
  serialize: serializePeriodSelection,
})

export const CoursePageParsers = {
  period: parseAsPeriodSelection,
  compare: parseAsPeriodSelection.withDefault({
    kind: "preset",
    preset: "LAST_THREE_YEARS",
  }),
  overlay: parseAsBoolean.withDefault(false),
}

export type CoursePageParams = inferParserType<typeof CoursePageParsers>
