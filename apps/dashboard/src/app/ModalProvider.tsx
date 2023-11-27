"use client"

import { ModalsProvider } from "@mantine/modals"
import { type FC, type PropsWithChildren } from "react"
import { CreateWebshopProductModal } from "./(dashboard)/webshop-product/helpers/modals"
import { CreateOfflineModal } from "../modules/offline/modals/create-offline-modal"
import { CreateEventExtrasModal } from "../modules/event/modals/create-event-extras-modal"
import { UpdateEventExtrasModal } from "../modules/event/modals/edit-event-extras-modal"
import { CreateEventModal } from "../modules/event/modals/create-event-modal"
import { CreateJobListingModal } from "../modules/job-listing/modals/create-job-listing-modal"
import { CreateCompanyModal } from "../modules/company/modals/create-company-modal"

const modals = {
  "event/create": CreateEventModal,
  "jobListing/create": CreateJobListingModal,
  "company/create": CreateCompanyModal,
  "offline/create": CreateOfflineModal,
  "extras/create": CreateEventExtrasModal,
  "extras/update": UpdateEventExtrasModal,
  "webshopProduct/create": CreateWebshopProductModal,
} as const

export const ModalProvider: FC<PropsWithChildren> = ({ children }) => (
  <ModalsProvider modals={modals}>{children}</ModalsProvider>
)
