export const rangeToString = (ranges: number[][]): string => {
  // example: [1,2] [2,3]  => 1,2,3
  const flat = ranges.flat()
  return flat.sort().join(", ")
}
