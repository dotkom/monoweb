import { useFormBuilder } from "@/components/forms/Form"
import { createMultipleSelectInput } from "@/components/forms/MultiSelectInput"
import { type GroupId, GroupRoleSchema } from "@dotkomonline/types"
import z from "zod"
import { useGroupGetQuery } from "./queries"

const FormSchema = z.object({
  roleIds: GroupRoleSchema.shape.id.array().min(1, "Minst én rolle må være valgt"),
})

type FormResult = z.infer<typeof FormSchema>

interface Props {
  onSubmit(data: FormResult): void
  defaultValues?: Partial<FormResult>
  label?: string
  description?: string
  groupId: GroupId
  disabled?: boolean
}

export const useGroupMemberForm = ({ onSubmit, label = "Lagre", defaultValues, groupId, disabled }: Props) => {
  const { data: group } = useGroupGetQuery(groupId)

  return useFormBuilder({
    schema: FormSchema,
    defaultValues,
    onSubmit,
    label,
    disabled,
    fields: {
      roleIds: createMultipleSelectInput({
        description: 'Ikke velg "Medlem" og en annen rolle samtidig',
        label: "Roller",
        required: true,
        placeholder: "Velg roller",
        data: group?.roles?.map((role) => ({ value: role.id, label: role.name })),
        searchable: true,
      }),
    },
  })
}
