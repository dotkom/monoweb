/**
 * Formats the year criterias into a string representation to show to the user.
 *
 * @param yearCriterias - The year criterias to format.
 * @returns The formatted string representation of the year criterias.
 */
export const formatPoolYearCriterias = (yearCriterias: number[]): string => {
  return yearCriterias.toSorted((a, b) => a - b).join(", ")
}

const capitalize = (string: string) => string.charAt(0).toUpperCase() + string.slice(1)

const formatRangeStrict = (start: number, end: number): string[] => {
  if (start === end) {
    return [`${start}.`]
  }

  return [`${start}. - ${end}.`]
}

const formatRange = (start: number, end: number): string[] => {
  if (start === 1 && end === 5) {
    return ["alle"]
  }

  if (start === 1 && end === 3) {
    return ["bachelor"]
  }

  if (start === 4 && end === 5) {
    return ["master"]
  }

  if (start <= 3 && end === 5) {
    return [...formatRangeStrict(start, 3), "master"]
  }

  if (start === 1 && end >= 4) {
    return ["bachelor", ...formatRangeStrict(4, end)]
  }

  return formatRangeStrict(start, end)
}

export const createDefaultPoolName = (yearCriterias: number[]): string => {
  if (yearCriterias.length === 0) {
    return ""
  }

  const sortedYearCriterias = yearCriterias.toSorted((a, b) => a - b)
  const ranges: string[] = []

  let earliestCriteriaMatch = sortedYearCriterias[0]
  let lastCriteriaMatch = sortedYearCriterias[0]

  for (const yearCriteria of sortedYearCriterias.slice(1)) {
    if (yearCriteria === lastCriteriaMatch + 1) {
      lastCriteriaMatch = yearCriteria

      continue
    }

    ranges.push(...formatRange(earliestCriteriaMatch, lastCriteriaMatch))

    earliestCriteriaMatch = yearCriteria
    lastCriteriaMatch = yearCriteria
  }

  ranges.push(...formatRange(earliestCriteriaMatch, lastCriteriaMatch))

  const formatter = new Intl.ListFormat("no-NB", {
    style: "long",
    type: "conjunction",
  })

  const defaultPoolName = capitalize(formatter.format(ranges))

  // `2 - 3.` --> `2. - 3. klasse`
  if (defaultPoolName.endsWith(".")) {
    return `${defaultPoolName} klasse`
  }

  return defaultPoolName
}
