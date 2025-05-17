"use client"

import { ModalsProvider } from "@mantine/modals"
import type { FC, PropsWithChildren } from "react"
import { AttendanceRegisteredModal } from "src/app/(dashboard)/event/components/attendance-registered-modal"
import { AlreadyAttendedModal } from "src/app/(dashboard)/event/components/error-attendance-registered-modal"
import { CreateGroupModal } from "src/modules/group/modals/create-group-modal"
import { CreateMarkModal } from "src/modules/mark/modals/create-mark-modal"
import { CreateInterestGroupModal } from "src/modules/interest-group/modals/create-interest-group-modal"
import { CreateArticleModal } from "../modules/article/modals/create-article-modal"
import { CreateJobListingModal } from "../modules/job-listing/modals/create-job-listing-modal"
import { CreateOfflineModal } from "../modules/offline/modals/create-offline-modal"
import { CreateAttendanceSelectionsModal } from "./(dashboard)/event/components/create-event-selections-modal"
import { CreatePoolModal } from "./(dashboard)/event/components/create-pool-modal"
import { UpdateAttendanceSelectionsModal } from "./(dashboard)/event/components/edit-event-selections-modal"
import { EditPoolModal } from "./(dashboard)/event/components/edit-pool-modal"
import { CreateManualUserAttendModal } from "./(dashboard)/event/components/manual-user-attend-modal"
import { MergePoolsModal } from "./(dashboard)/event/components/merge-pools-modal"

const modals = {
  "event/attendance/attendee/create": CreateManualUserAttendModal,
  "event/attendance/pool/create": CreatePoolModal,
  "event/attendance/pool/update": EditPoolModal,
  "event/attendance/pool/merge": MergePoolsModal,
  "jobListing/create": CreateJobListingModal,
  "offline/create": CreateOfflineModal,
  "attendance/selections/create": CreateAttendanceSelectionsModal,
  "attendance/selections/update": UpdateAttendanceSelectionsModal,
  "article/create": CreateArticleModal,
  "interestGroup/create": CreateInterestGroupModal,
  "group/create": CreateGroupModal,
  "event/attendance/registered": AttendanceRegisteredModal,
  "event/attendance/registered-error": AlreadyAttendedModal,
  "mark/create": CreateMarkModal,
} as const

export const ModalProvider: FC<PropsWithChildren> = ({ children }) => (
  <ModalsProvider modals={modals}>{children}</ModalsProvider>
)
