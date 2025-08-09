export const ogJoin = (names: string[]) => {
  if (names.length < 2) {
    return names ? names[0] : null
  }
  console.log(names)

  return `${names.splice(0, -1).join(", ")} og ${names.splice(-1)[0]}`
}
