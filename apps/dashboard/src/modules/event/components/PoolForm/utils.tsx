// validates and returns {max, min } if valid
export function validateAndReturn(values: number[]): number[] {
  // check if there are gaps in toAddNum, i.e. [1, 3] is not allowed. but [1, 2, 3] is allowed. [3, 5] is not allowed, but [3, 4, 5] is allowed.

  const min = values.length ? Math.min(...values) : -1
  const max = values.length ? Math.max(...values) + 1 : -1

  checkNumber(min, max)
  checkConsecutive(values)

  // array from min to exclusive max
  return Array.from({ length: max - min }, (_, i) => i + min)
}

const checkConsecutive = (chosenNumbers: number[]) => {
  // Can only choose consecutive numbers
  const sorted = chosenNumbers.sort((a, b) => a - b)
  if (!isConsecutive(sorted)) {
    throw new Error("Du kan ikke hoppe over klassetrinn")
  }
}

const checkNumber = (min: number, max: number) => {
  if (min === max) {
    // works because min is inclusive and max is exclusive, and both are -1 if no numbers are values
    throw new Error("Du må velge minst ett klassetrinn")
  }
}

const isConsecutive = (arr: number[]): boolean => arr.every((num, idx) => idx === 0 || num === arr[idx - 1] + 1)
