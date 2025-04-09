export const getAcademicYear = (date: Date): number => {
  const year = date.getFullYear()

  const pastAugust = date.getMonth() > 7
  if (!pastAugust) {
    return year - 1
  }

  return year
}
