import { useFormBuilder } from "@/components/forms/Form"
import { createSelectInput } from "@/components/forms/SelectInput"
import { createTextInput } from "@/components/forms/TextInput"
import { GroupRoleTypeSchema, GroupRoleWriteSchema, getGroupRoleTypeName } from "@dotkomonline/types"
import type z from "zod"

const FormSchema = GroupRoleWriteSchema.omit({
  groupId: true,
}).superRefine((data, ctx) => {
  if (data.name.trim().length < 2) {
    ctx.addIssue({
      code: "custom",
      message: "Navn må være minst 2 tegn lang",
      path: ["name"],
    })
  }
})

type FormResult = z.infer<typeof FormSchema>

interface UseGroupRoleForm {
  onSubmit(data: FormResult): void
  defaultValues?: Partial<FormResult>
  label?: string
}

export const useGroupRoleForm = ({ onSubmit, label = "Lagre", defaultValues }: UseGroupRoleForm) =>
  useFormBuilder({
    schema: FormSchema,
    defaultValues,
    onSubmit,
    label,
    fields: {
      name: createTextInput({
        label: "Navn",
        placeholder: "Vinstraffansvarlig",
        required: true,
      }),
      type: createSelectInput({
        label: "Type",
        placeholder: "Velg en",
        required: true,
        data: Object.values(GroupRoleTypeSchema.Values).map((groupRoleType) => ({
          value: groupRoleType,
          label: getGroupRoleTypeName(groupRoleType),
        })),
      }),
    },
  })
