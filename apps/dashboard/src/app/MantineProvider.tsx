"use client"

import { type FC, type PropsWithChildren } from "react"
import { MantineProvider as MantineCoreProvider } from "@mantine/core"
import { Notifications } from "@mantine/notifications"
import { ModalProvider } from "./ModalProvider"

export const MantineProvider: FC<PropsWithChildren> = ({ children }) => (
    <MantineCoreProvider>
      <Notifications />
      <ModalProvider>{children}</ModalProvider>
    </MantineCoreProvider>
  )
