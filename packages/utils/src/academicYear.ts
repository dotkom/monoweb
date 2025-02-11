export const getAcademicYear = (date: Date): number => {
  const year = date.getFullYear()

  const passedAugust = date.getMonth() > 7
  if (!passedAugust) {
    return year - 1
  }

  return year
}
