"use client"

import { FC, PropsWithChildren } from "react"
import { MantineProvider as MantineCoreProvider } from "@mantine/core"
import { Notifications } from "@mantine/notifications"
import { ModalProvider } from "./ModalProvider"

export const MantineProvider: FC<PropsWithChildren> = ({ children }) => {
  return (
    <MantineCoreProvider>
      <Notifications />
      <ModalProvider>{children}</ModalProvider>
    </MantineCoreProvider>
  )
}
