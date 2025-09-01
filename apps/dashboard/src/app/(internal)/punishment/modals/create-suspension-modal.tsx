"use client"

import { useMarkWriteForm } from "@/app/(internal)/punishment/write-form"
import { type ContextModalProps, modals } from "@mantine/modals"
import type { FC } from "react"
import { useCreateMarkMutation } from "../mutations/use-create-mark-mutations"

export const CreateSuspensionModal: FC<ContextModalProps> = ({ context, id }) => {
  const close = () => context.closeModal(id)
  const create = useCreateMarkMutation()

  const FormComponent = useMarkWriteForm({
    suspension: true,
    label: "Gi suspensjon",
    onSubmit: async (mark) => {
      create.mutate({
        data: {
          ...mark,
          weight: 6,
          type: "MANUAL",
        },
        groupIds: mark.groupIds,
      })
      close()
    },
  })
  return <FormComponent />
}

export const useCreateSuspensionModal = () => () =>
  modals.openContextModal({
    modal: "punishment/suspension/create",
    title: "Opprett ny suspensjon",
    innerProps: {},
  })
