"use client"

import { CreateArticleModal } from "@/app/(internal)/artikler/modals/create-article"
import { AttendanceRegisteredModal } from "@/app/(internal)/arrangementer/components/attendance-registered-modal"
import { CreateAttendanceSelectionsModal } from "@/app/(internal)/arrangementer/components/create-event-selections-modal"
import { CreatePoolModal } from "@/app/(internal)/arrangementer/components/create-pool-modal"
import { UpdateAttendanceSelectionsModal } from "@/app/(internal)/arrangementer/components/edit-event-selections-modal"
import { EditPoolModal } from "@/app/(internal)/arrangementer/components/edit-pool-modal"
import { AlreadyAttendedModal } from "@/app/(internal)/arrangementer/components/error-attendance-registered-modal"
import { ManualCreateUserAttendModal } from "@/app/(internal)/arrangementer/components/manual-create-user-attend-modal"
import { ManualDeleteUserAttendModal } from "@/app/(internal)/arrangementer/components/manual-delete-user-attend-modal"
import { CreateGroupModal } from "@/app/(internal)/grupper/modals/create-group-modal"
import { CreateGroupRoleModal } from "@/app/(internal)/grupper/modals/create-group-role-modal"
import { EditGroupMembershipModal } from "@/app/(internal)/grupper/modals/edit-group-membership-modal"
import { EditGroupRoleModal } from "@/app/(internal)/grupper/modals/edit-group-role-modal"
import { CreateJobListingModal } from "@/app/(internal)/karriere//modals/create-job-listing-modal"
import { CreateOfflineModal } from "@/app/(internal)/offline/modals/create-offline-modal"
import { CreateMarkModal } from "@/app/(internal)/prikker/modals/create-mark-modal"
import { CreateSuspensionModal } from "@/app/(internal)/prikker/modals/create-suspension-modal"
import { CreateMembershipModal } from "@/app/(internal)/brukere/components/create-membership-modal"
import { EditMembershipModal } from "@/app/(internal)/brukere/components/edit-membership-modal"
import { UploadImageModal } from "@/components/ImageUploadModal"
import { ModalsProvider } from "@mantine/modals"
import type { FC, PropsWithChildren } from "react"
import { QRCodeScannedModal } from "@/app/(internal)/arrangementer/components/qr-code-scanned-modal"
import { CreateGroupMemberModal } from "@/app/(internal)/grupper/modals/create-group-member-modal"

const modals = {
  "event/attendance/attendee/create": ManualCreateUserAttendModal,
  "event/attendance/attendee/delete": ManualDeleteUserAttendModal,
  "event/attendance/attendee/qr-code-scanned": QRCodeScannedModal,
  "event/attendance/pool/create": CreatePoolModal,
  "event/attendance/pool/update": EditPoolModal,
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
  "punishment/mark/create": CreateMarkModal,
  "punishment/suspension/create": CreateSuspensionModal,
  "user/membership/create": CreateMembershipModal,
  "user/membership/update": EditMembershipModal,
  "image/upload": UploadImageModal,
} as const

export const ModalProvider: FC<PropsWithChildren> = ({ children }) => (
  <ModalsProvider modals={modals}>{children}</ModalsProvider>
)
