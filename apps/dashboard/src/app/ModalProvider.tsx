"use client"

import { ModalsProvider } from "@mantine/modals"
import { type FC, type PropsWithChildren } from "react"
import { CreateOfflineModal } from "../modules/offline/modals/create-offline-modal"
import { CreateEventExtrasModal } from "../modules/event/modals/create-event-extras-modal"
import { UpdateEventExtrasModal } from "../modules/event/modals/edit-event-extras-modal"
import { CreateEventModal } from "../modules/event/modals/create-event-modal"
import { CreateJobListingModal } from "../modules/job-listing/modals/create-job-listing-modal"
import { CreateCompanyModal } from "../modules/company/modals/create-company-modal"
import { CreateArticleModal } from "../modules/article/modals/create-article-modal"
import { CreatePoolModal } from "../modules/attendance/modals/create-pool-modal"
import { EditPoolModal } from "../modules/attendance/modals/edit-pool-modal"
import { CreateInterestGroupModal } from "src/modules/interest-group/modals/create-interest-group-modal"

const modals = {
  "event/create": CreateEventModal,
  "event/attendance/pool/create": CreatePoolModal,
  "event/attendance/pool/update": EditPoolModal,
  "jobListing/create": CreateJobListingModal,
  "company/create": CreateCompanyModal,
  "offline/create": CreateOfflineModal,
  "extras/create": CreateEventExtrasModal,
  "extras/update": UpdateEventExtrasModal,
  "article/create": CreateArticleModal,
  "interestGroup/create": CreateInterestGroupModal,
} as const

export const ModalProvider: FC<PropsWithChildren> = ({ children }) => (
  <ModalsProvider modals={modals}>{children}</ModalsProvider>
)
