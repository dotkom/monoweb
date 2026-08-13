import { createParser } from "nuqs/server"

export function parseAsStringEnumLowercase<T extends string>(validValues: readonly T[]) {
  const byLower = new Map(validValues.map((v) => [v.toLowerCase(), v]))

  return createParser({
    parse(query) {
      return byLower.get(query.toLowerCase()) ?? null
    },
    serialize(value) {
      return value.toLowerCase()
    },
  })
}
