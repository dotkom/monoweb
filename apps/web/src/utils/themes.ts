export const THEMES = ["light", "dark", "halloween"]

export type Theme = "light" | "dark" | "halloween" | "system"

export const isDarkTheme = (theme: string | undefined) => theme === "dark" || theme === "halloween"
