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
import { CreateGroupMemberModal } from "./group/modals/create-group-member-modal"
import { CreateGroupModal } from "./group/modals/create-group-modal"
import { CreateGroupRoleModal } from "./group/modals/create-group-role-modal"
import { EditGroupMembershipModal } from "./group/modals/edit-group-membership-modal"
import { EditGroupRoleModal } from "./group/modals/edit-group-role-modal"
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
  "group/create": CreateGroupModal,
  "group/role/create": CreateGroupRoleModal,
  "group/role/update": EditGroupRoleModal,
  "group/member/create": CreateGroupMemberModal,
  "group/membership/update": EditGroupMembershipModal,
  "event/attendance/registered": AttendanceRegisteredModal,
  "event/attendance/registered-error": AlreadyAttendedModal,
} as const

export const ModalProvider: FC<PropsWithChildren> = ({ children }) => (
  <ModalsProvider modals={modals}>{children}</ModalsProvider>
)
