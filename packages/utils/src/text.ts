// Bare for OGs
export const ogJoin = (names: string[]) => {
  if (names.length === 0) {
    return null
  }

  if (names.length === 1) {
    return names[0]
  }

  return `${names.slice(0, -1).join(", ")} og ${names.at(-1)}`
}

export const capitalizeFirstLetter = (string: string) => `${string.charAt(0).toUpperCase()}${string.slice(1)}`
