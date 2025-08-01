import type { Group } from "@dotkomonline/types"
import { type ContextModalProps, modals } from "@mantine/modals"
import type { FC } from "react"
import { useGroupRoleForm } from "../group-role-form"
import { useCreateGroupRoleMutation } from "../mutations"

export const CreateGroupRoleModal: FC<ContextModalProps<{ group: Group }>> = ({
  context,
  id,
  innerProps: { group },
}) => {
  const close = () => context.closeModal(id)
  const create = useCreateGroupRoleMutation()
  const FormComponent = useGroupRoleForm({
    onSubmit: (data) => {
      create.mutate({
        ...data,
        groupId: group.slug,
      })
      close()
    },
  })
  return <FormComponent />
}

export const useCreateGroupRoleModal =
  ({ group }: { group: Group }) =>
    () => {
      return modals.openContextModal({
        modal: "group/role/create",
        title: "Lag en ny rolle",
        innerProps: { group },
      })
    }
