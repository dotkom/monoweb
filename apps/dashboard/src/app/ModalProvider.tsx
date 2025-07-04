"use client"

import { ManualCreateUserAttendModal } from "@/app/event/components/manual-create-user-attend-modal"
import { ManualDeleteUserAttendModal } from "@/app/event/components/manual-delete-user-attend-modal"
import { ModalsProvider } from "@mantine/modals"
import type { FC, PropsWithChildren } from "react"
import { CreateArticleModal } from "./article/modals/create-article"
import { AttendanceRegisteredModal } from "./event/components/attendance-registered-modal"
import { CreateAttendanceSelectionsModal } from "./event/components/create-event-selections-modal"
import { CreatePoolModal } from "./event/components/create-pool-modal"
import { UpdateAttendanceSelectionsModal } from "./event/components/edit-event-selections-modal"
import { EditPoolModal } from "./event/components/edit-pool-modal"
import { AlreadyAttendedModal } from "./event/components/error-attendance-registered-modal"
import { MergePoolsModal } from "./event/components/merge-pools-modal"
import { CreateGroupModal } from "./group/modals/create-group-modal"
import { CreateInterestGroupModal } from "./interest-group/modals/create-interest-group-modal"
import { CreateJobListingModal } from "./job-listing/modals/create-job-listing-modal"
import { CreateOfflineModal } from "./offline/modals/create-offline-modal"

const modals = {
  "event/attendance/attendee/create": ManualCreateUserAttendModal,
  "event/attendance/attendee/delete": ManualDeleteUserAttendModal,
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
} as const

export const ModalProvider: FC<PropsWithChildren> = ({ children }) => (
  <ModalsProvider modals={modals}>{children}</ModalsProvider>
)
