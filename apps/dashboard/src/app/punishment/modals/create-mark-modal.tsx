"use client"

import { useMarkWriteForm } from "@/app/punishment/write-form"
import { type ContextModalProps, modals } from "@mantine/modals"
import type { FC } from "react"
import { useCreateMarkMutation } from "../mutations/use-create-mark-mutations"

export const CreateMarkModal: FC<ContextModalProps> = ({ context, id }) => {
  const close = () => context.closeModal(id)
  const create = useCreateMarkMutation()

  const FormComponent = useMarkWriteForm({
    label: "Gi prikk",
    onSubmit: async ({ title, details, duration, weight, groupSlug }) => {
      create.mutate({
        title,
        details,
        weight,
        type: "MANUAL",
        groupSlug,
        duration,
      })
      close()
    },
  })
  return <FormComponent />
}

export const useCreateMarkModal = () => () =>
  modals.openContextModal({
    modal: "punishment/mark/create",
    title: "Opprett ny prikk",
    innerProps: {},
  })
