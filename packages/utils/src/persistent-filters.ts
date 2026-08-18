export const persistFilters = <T>(storageKey: string, filters: T, isDefault: (filters: T) => boolean) => {
  try {
    if (isDefault(filters)) {
      localStorage.removeItem(storageKey)

      return
    }

    localStorage.setItem(storageKey, JSON.stringify(filters))
  } catch {
    // Storage is unavailable or full
  }
}

export const readPersistedFilters = <T>(storageKey: string, parse: (value: unknown) => T | null): T | null => {
  try {
    const storedFilters = localStorage.getItem(storageKey)

    if (!storedFilters) {
      return null
    }

    const filters = parse(JSON.parse(storedFilters))

    if (filters) {
      return filters
    }

    localStorage.removeItem(storageKey)
  } catch {
    // Malformed values or unavailable storage
  }

  return null
}
