"use client"

import { ModalsProvider } from "@mantine/modals"
import type { FC, PropsWithChildren } from "react"
import { AttendanceRegisteredModal } from "src/modules/attendance/modals/attendance-registered-modal"
import { AlreadyAttendedModal } from "src/modules/attendance/modals/error-attendance-registered-modal"
import { CreateGroupModal } from "src/modules/group/modals/create-group-modal"
import { CreateInterestGroupModal } from "src/modules/interest-group/modals/create-interest-group-modal"
import { CreateArticleModal } from "../modules/article/modals/create-article-modal"
import { CreatePoolModal } from "../modules/attendance/modals/create-pool-modal"
import { EditPoolModal } from "../modules/attendance/modals/edit-pool-modal"
import { CreateManualUserAttendModal } from "../modules/attendance/modals/manual-user-attend-modal"
import { MergePoolsModal } from "../modules/attendance/modals/merge-pools-modal"
import { CreateCompanyModal } from "../modules/company/modals/create-company-modal"
import { CreateJobListingModal } from "../modules/job-listing/modals/create-job-listing-modal"
import { CreateOfflineModal } from "../modules/offline/modals/create-offline-modal"
import { CreateAttendanceSelectionsModal } from "./(dashboard)/event/components/create-event-selections-modal"
import { UpdateAttendanceSelectionsModal } from "./(dashboard)/event/components/edit-event-selections-modal"

const modals = {
  "event/attendance/attendee/create": CreateManualUserAttendModal,
  "event/attendance/pool/create": CreatePoolModal,
  "event/attendance/pool/update": EditPoolModal,
  "event/attendance/pool/merge": MergePoolsModal,
  "jobListing/create": CreateJobListingModal,
  "company/create": CreateCompanyModal,
  "offline/create": CreateOfflineModal,
  "attendance/selections/create": CreateAttendanceSelectionsModal,
  "attendance/selections/update": UpdateAttendanceSelectionsModal,
  "article/create": CreateArticleModal,
  "interestGroup/create": CreateInterestGroupModal,
  "group/create": CreateGroupModal,
  "event/attendance/registered": AttendanceRegisteredModal,
  "event/attendance/registered-error": AlreadyAttendedModal,
} as const

export const ModalProvider: FC<PropsWithChildren> = ({ children }) => (
  <ModalsProvider modals={modals}>{children}</ModalsProvider>
)
