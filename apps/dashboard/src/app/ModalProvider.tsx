"use client"

import { AddRecipientsModal } from "@/app/(internal)/varslinger/components/add-recipients-modal"
import { EditNotificationModal } from "@/app/(internal)/varslinger/components/edit-notification-modal"
import { SendNotificationModal } from "@/app/(internal)/varslinger/components/send-notification-modal"
import { UploadImageModal } from "@/components/ImageUploadModal"
import { ModalsProvider } from "@mantine/modals"
import type { FC, PropsWithChildren } from "react"

const modals = {
  "notification/send": SendNotificationModal,
  "notification/edit": EditNotificationModal,
  "notification/add-recipients": AddRecipientsModal,
  "image/upload": UploadImageModal,
} as const

export const ModalProvider: FC<PropsWithChildren> = ({ children }) => (
  <ModalsProvider modals={modals}>{children}</ModalsProvider>
)
