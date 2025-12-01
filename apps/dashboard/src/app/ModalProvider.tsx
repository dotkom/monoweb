"use client"

import { CreateArticleModal } from "@/app/(internal)/article/modals/create-article"
import { AttendanceRegisteredModal } from "@/app/(internal)/event/components/attendance-registered-modal"
import { CreateAttendanceSelectionsModal } from "@/app/(internal)/event/components/create-event-selections-modal"
import { CreatePoolModal } from "@/app/(internal)/event/components/create-pool-modal"
import { UpdateAttendanceSelectionsModal } from "@/app/(internal)/event/components/edit-event-selections-modal"
import { EditPoolModal } from "@/app/(internal)/event/components/edit-pool-modal"
import { AlreadyAttendedModal } from "@/app/(internal)/event/components/error-attendance-registered-modal"
import { ManualCreateUserAttendModal } from "@/app/(internal)/event/components/manual-create-user-attend-modal"
import { ManualDeleteUserAttendModal } from "@/app/(internal)/event/components/manual-delete-user-attend-modal"
import { CreateGroupModal } from "@/app/(internal)/group/modals/create-group-modal"
import { CreateGroupRoleModal } from "@/app/(internal)/group/modals/create-group-role-modal"
import { EditGroupMembershipModal } from "@/app/(internal)/group/modals/edit-group-membership-modal"
import { EditGroupRoleModal } from "@/app/(internal)/group/modals/edit-group-role-modal"
import { CreateJobListingModal } from "@/app/(internal)/job-listing/modals/create-job-listing-modal"
import { CreateOfflineModal } from "@/app/(internal)/offline/modals/create-offline-modal"
import { CreateMarkModal } from "@/app/(internal)/punishment/modals/create-mark-modal"
import { CreateSuspensionModal } from "@/app/(internal)/punishment/modals/create-suspension-modal"
import { CreateMembershipModal } from "@/app/(internal)/user/components/create-membership-modal"
import { EditMembershipModal } from "@/app/(internal)/user/components/edit-membership-modal"
import { UploadImageModal } from "@/components/ImageUploadModal"
import { ModalsProvider } from "@mantine/modals"
import type { FC, PropsWithChildren } from "react"
import { QRCodeScannedModal } from "./(internal)/event/components/qr-code-scanned-modal"
import { CreateGroupMemberModal } from "./(internal)/group/modals/create-group-member-modal"

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
