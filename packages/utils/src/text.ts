// Bare for OGs
export const ogJoin = (names: string[]) => {
  if (names.length < 2) {
    return names ? names[0] : null
  }

  return `${names.splice(0, -1).join(", ")} og ${names.splice(-1)[0]}`
}

export const capitalizeFirstLetter = (string: string) => `${string.charAt(0).toUpperCase()}${string.slice(1)}`
