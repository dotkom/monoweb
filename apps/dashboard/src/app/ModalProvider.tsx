"use client"

import { ModalsProvider } from "@mantine/modals"
import { FC, PropsWithChildren } from "react"
import { CreateCompanyModal } from "src/modules/company/modals/create-company-modal"
import { CreateEventModal } from "src/modules/event/modals/create-event-modal"
import { CreateJobListingModal } from "src/modules/job-listing/modals/create-job-listing-modal"
import { CreateEventExtrasModal } from "../modules/event/modals/create-event-extras-modal"
import { UpdateEventExtrasModal } from "../modules/event/modals/edit-event-extras-modal"

const modals = {
  "event/create": CreateEventModal,
  "jobListing/create": CreateJobListingModal,
  "company/create": CreateCompanyModal,
  "extras/create": CreateEventExtrasModal,
  "extras/update": UpdateEventExtrasModal,
} as const

export const ModalProvider: FC<PropsWithChildren> = ({ children }) => {
  return <ModalsProvider modals={modals}>{children}</ModalsProvider>
}
