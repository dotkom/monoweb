"use client"

import { ModalsProvider } from "@mantine/modals"
import { type FC, type PropsWithChildren } from "react"
import { CreateCompanyModal } from "src/modules/company/modals/create-company-modal"
import { CreateEventModal } from "src/modules/event/modals/create-event-modal"
import { CreateJobListingModal } from "src/modules/job-listing/modals/create-job-listing-modal"

const modals = {
  "event/create": CreateEventModal,
  "jobListing/create": CreateJobListingModal,
  "company/create": CreateCompanyModal,
} as const

export const ModalProvider: FC<PropsWithChildren> = ({ children }) => (
  <ModalsProvider modals={modals}>{children}</ModalsProvider>
)
