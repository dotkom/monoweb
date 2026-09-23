"use client"

import { MantineProvider, createTheme } from "@mantine/core"
import { useTheme } from "next-themes"
import type { PropsWithChildren } from "react"

const theme = createTheme({
  fontFamily: "Inter Variable",
  fontFamilyMonospace: "Google Sans Code Variable",
  headings: {
    fontFamily: "Inter Tight Variable",
  },
})

export function ThemedMantineProvider({ children }: PropsWithChildren) {
  const { resolvedTheme } = useTheme()

  let forceColorScheme: "light" | "dark" | undefined
  if (resolvedTheme === "dark") {
    forceColorScheme = "dark"
  } else if (resolvedTheme === "light") {
    forceColorScheme = "light"
  }

  return (
    <MantineProvider defaultColorScheme="auto" forceColorScheme={forceColorScheme} theme={theme}>
      {children}
    </MantineProvider>
  )
}
