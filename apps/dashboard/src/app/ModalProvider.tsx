"use client"

import { ModalsProvider } from "@mantine/modals"
import { FC, PropsWithChildren } from "react"
import { CreateCompanyModal } from "src/modules/company/modals/create-company-modal"
import { CreateEventModal } from "src/modules/event/modals/create-event-modal"

const modals = {
  "event/create": CreateEventModal,
  "company/create": CreateCompanyModal,
} as const

export const ModalProvider: FC<PropsWithChildren> = ({ children }) => {
  return <ModalsProvider modals={modals}>{children}</ModalsProvider>
}
