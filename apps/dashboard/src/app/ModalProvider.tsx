"use client"

import { CreateEventModal } from "../modules/event/modals/create-event-modal"
import { FC, PropsWithChildren } from "react"
import { ModalsProvider } from "@mantine/modals"

const modals = {
  "event/create": CreateEventModal,
} as const

export const ModalProvider: FC<PropsWithChildren> = ({ children }) => {
  return <ModalsProvider modals={modals}>{children}</ModalsProvider>
}
