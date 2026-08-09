export function roundAverageGrade(n: number): number {
  return Math.round(n * 100) / 100
}

export function roundPassRate(n: number): number {
  return Math.round(n)
}

export function averageGradeDelta(selected: number, comparison: number): number {
  return roundAverageGrade(selected) - roundAverageGrade(comparison)
}

export function passRateDeltaPoints(selected: number, comparison: number): number {
  return roundPassRate(selected) - roundPassRate(comparison)
}
