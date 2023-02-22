"use client"

import {
  MantineProvider as NativeMantineProvider,
  ColorSchemeProvider,
  ColorScheme,
  useMantineColorScheme,
} from "@mantine/core"
import { FC, PropsWithChildren, useState } from "react"
import { useColorScheme } from "@mantine/hooks"

export const MantineProvider: FC<PropsWithChildren> = ({ children }) => {
  const { colorScheme } = useMantineColorScheme()
  return (
    <NativeMantineProvider theme={{ colorScheme }} withGlobalStyles withCSSVariables withNormalizeCSS>
      {children}
    </NativeMantineProvider>
  )
}

export const MantineColorSchemeProvider: FC<PropsWithChildren> = ({ children }) => {
  const preferredColorScheme = useColorScheme()
  const [colorScheme, setColorScheme] = useState<ColorScheme>(preferredColorScheme)
  const toggleColorScheme = (value?: ColorScheme) =>
    setColorScheme(value || (colorScheme === "dark" ? "light" : "dark"))
  return (
    <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
      {children}
    </ColorSchemeProvider>
  )
}
