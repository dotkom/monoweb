const ONE_DAY_MS = 86_400_000

export const daysBetween = (a: Date, b: Date): number => {
  return Math.floor((a.getTime() - b.getTime()) / ONE_DAY_MS)
}

export const daysBetweenNow = (date: Date): number => {
  return daysBetween(new Date(), date)
}
