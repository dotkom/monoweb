/**
 * Formats the year criterias into a string representation to show to the user.
 *
 * @param yearCriterias - The year criterias to format.
 * @returns The formatted string representation of the year criterias.
 */
export const formatPoolYearCriterias = (yearCriterias: number[]): string => {
  return yearCriterias.toSorted((a, b) => a - b).join(", ")
}
