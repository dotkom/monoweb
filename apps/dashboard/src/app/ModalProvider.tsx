"use client"

import { CreateEventModal } from "../modules/event/modals/create-event-modal"
import { FC, PropsWithChildren } from "react"
import { ModalsProvider } from "@mantine/modals"
import { CreateCompanyModal } from "../modules/company/modals/create-company-modal"

const modals = {
  "event/create": CreateEventModal,
  "company/create": CreateCompanyModal,
} as const

export const ModalProvider: FC<PropsWithChildren> = ({ children }) => {
  return <ModalsProvider modals={modals}>{children}</ModalsProvider>
}
