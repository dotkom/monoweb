import type { GroupRole } from "@dotkomonline/types"
import { type ContextModalProps, modals } from "@mantine/modals"
import type { FC } from "react"
import { useGroupRoleForm } from "../group-role-form"
import { useUpdateGroupRoleMutation } from "../mutations"

export const EditGroupRoleModal: FC<ContextModalProps<{ role: GroupRole }>> = ({
  context,
  id,
  innerProps: { role },
}) => {
  const close = () => context.closeModal(id)
  const update = useUpdateGroupRoleMutation()
  const FormComponent = useGroupRoleForm({
    defaultValues: role,
    onSubmit: (data) => {
      update.mutate({
        id: role.id,
        role: {
          ...data,
          groupId: role.groupId,
        },
      })
      close()
    },
  })
  return <FormComponent />
}

export const useEditGroupRoleModal =
  () =>
    ({ role }: { role: GroupRole }) => {
      return modals.openContextModal({
        modal: "group/role/update",
        title: "Endre rolle",
        innerProps: { role },
      })
    }
