/**
 * Formats the year criterias into a string representation to show to the user.
 *
 * @param yearCriterias - The year criterias to format.
 * @returns The formatted string representation of the year criterias.
 */
export const formatPoolYearCriterias = (yearCriterias: number[][]): string => {
  const flat = yearCriterias.flat()
  flat.sort((a, b) => a - b)
  return flat.join(", ")
}
