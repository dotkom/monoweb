const capitalize = (string: string) => string.charAt(0).toUpperCase() + string.slice(1)

const formatRangeStrict = (start: number, end: number): string[] => {
  if (start === end) {
    return [`${start}.`]
  }

  return [`${start}. - ${end}.`]
}

const createPoolNameFromRange = (start: number, end: number): string[] => {
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

export const createPoolName = (yearCriterias: number[]): string => {
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

    ranges.push(...createPoolNameFromRange(earliestCriteriaMatch, lastCriteriaMatch))

    earliestCriteriaMatch = yearCriteria
    lastCriteriaMatch = yearCriteria
  }

  ranges.push(...createPoolNameFromRange(earliestCriteriaMatch, lastCriteriaMatch))

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
