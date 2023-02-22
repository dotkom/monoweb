"use client"

import { MantineProvider as NativeMantineProvider } from "@mantine/core"
import { FC, PropsWithChildren } from "react"

export const MantineProvider: FC<PropsWithChildren> = ({ children }) => (
  <NativeMantineProvider withGlobalStyles withCSSVariables withNormalizeCSS>
    {children}
  </NativeMantineProvider>
)
