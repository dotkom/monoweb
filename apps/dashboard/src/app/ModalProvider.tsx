"use client"

import { ModalsProvider } from "@mantine/modals"
import { type FC, type PropsWithChildren } from "react"
import { CreateOfflineModal } from "../modules/offline/modals/create-offline-modal"
import { CreateAttendanceExtrasModal } from "../modules/event/modals/create-event-extras-modal"
import { UpdateAttendanceExtrasModal } from "../modules/event/modals/edit-event-extras-modal"
import { CreateEventModal } from "../modules/event/modals/create-event-modal"
import { CreateJobListingModal } from "../modules/job-listing/modals/create-job-listing-modal"
import { CreateCompanyModal } from "../modules/company/modals/create-company-modal"
import { CreateArticleModal } from "../modules/article/modals/create-article-modal"
import { CreatePoolModal } from "../modules/attendance/modals/create-pool-modal"
import { EditPoolModal } from "../modules/attendance/modals/edit-pool-modal"
import { CreateInterestGroupModal } from "src/modules/interest-group/modals/create-interest-group-modal"
import { MergePoolsModal } from "../modules/attendance/modals/merge-pools-modal"

const modals = {
  "event/create": CreateEventModal,
  "event/attendance/pool/create": CreatePoolModal,
  "event/attendance/pool/update": EditPoolModal,
  "event/attendance/pool/merge": MergePoolsModal,
  "jobListing/create": CreateJobListingModal,
  "company/create": CreateCompanyModal,
  "offline/create": CreateOfflineModal,
  "attendance/extras/create": CreateAttendanceExtrasModal,
  "attendance/extras/update": UpdateAttendanceExtrasModal,
  "article/create": CreateArticleModal,
  "interestGroup/create": CreateInterestGroupModal,
} as const

export const ModalProvider: FC<PropsWithChildren> = ({ children }) => (
  <ModalsProvider modals={modals}>{children}</ModalsProvider>
)
