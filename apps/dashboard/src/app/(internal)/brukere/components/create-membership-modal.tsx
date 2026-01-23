import type { User } from "@dotkomonline/types"
import { type ContextModalProps, modals } from "@mantine/modals"
import type { FC } from "react"
import { useCreateMembershipMutation } from "../mutations"
import { useMembershipWriteForm } from "./membership-form"
import { Stack, Text } from "@mantine/core"

export const CreateMembershipModal: FC<ContextModalProps<{ user: User }>> = ({ context, id, innerProps: { user } }) => {
  const close = () => context.closeModal(id)
  const createMembership = useCreateMembershipMutation()
  const FormComponent = useMembershipWriteForm({
    onSubmit: (data) => {
      createMembership.mutate({
        userId: user.id,
        data,
      })
      close()
    },
  })
  return (
    <Stack gap="sm">
      <Text size="sm" c="dimmed">
        Rediger semesterverdien for å endre årstrinn.
      </Text>
      <FormComponent />
    </Stack>
  )
}

export const useCreateMembershipModal =
  ({ user }: { user: User }) =>
  () => {
    return modals.openContextModal({
      modal: "user/membership/create",
      title: "Opprett medlemskap",
      innerProps: { user },
    })
  }
