"use client"

import type { ContextModalProps } from "@mantine/modals"
import type { FC } from "react"
import {
  CreateNotificationModal as CreateNotificationModalContent,
  openCreateNotificationModal,
} from "../create-modal/CreateNotificationModal"
import { createGlobalLaunchContext, type CreateNotificationLaunchContext } from "../create-modal/types"

export const CreateNotificationModal: FC<ContextModalProps<CreateNotificationLaunchContext>> = (props) => {
  return <CreateNotificationModalContent {...props} />
}

export const useCreateNotificationModal = () => () => openCreateNotificationModal(createGlobalLaunchContext())
