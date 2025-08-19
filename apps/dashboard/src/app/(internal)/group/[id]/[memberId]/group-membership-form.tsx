import { createDateTimeInput } from "@/components/forms/DateTimeInput"
import { useFormBuilder } from "@/components/forms/Form"
import { createMultipleSelectInput } from "@/components/forms/MultiSelectInput"
import { type GroupId, GroupMembershipWriteSchema, GroupRoleSchema } from "@dotkomonline/types"
import { isBefore, isFuture } from "date-fns"
import type z from "zod"
import { useGroupGetQuery } from "../../queries"

const FormSchema = GroupMembershipWriteSchema.pick({
  start: true,
  end: true,
})
  .extend({
    roleIds: GroupRoleSchema.shape.id.array().min(1, "Velg minst én rolle"),
  })
  .superRefine((data, ctx) => {
    if (isFuture(data.start)) {
      ctx.addIssue({
        code: "custom",
        message: "Startdato må være tilbake i tid",
        path: ["start"],
      })
    }

    if (data.end && isFuture(data.end)) {
      ctx.addIssue({
        code: "custom",
        message: "Sluttdato må være tilbake i tid",
        path: ["end"],
      })
    }

    if (data.end && isBefore(data.end, data.start)) {
      ctx.addIssue({
        code: "custom",
        message: "Sluttdato må være etter startdato",
        path: ["end"],
      })
    }
  })

type FormResult = z.infer<typeof FormSchema>

interface Props {
  onSubmit(data: FormResult): void
  defaultValues?: Partial<FormResult>
  label?: string
  groupId: GroupId
}

export const useGroupMembershipForm = ({ onSubmit, label = "Lagre", defaultValues, groupId }: Props) => {
  const { data: group } = useGroupGetQuery(groupId)

  return useFormBuilder({
    schema: FormSchema,
    defaultValues,
    onSubmit,
    label,
    fields: {
      roleIds: createMultipleSelectInput({
        label: "Roller",
        required: true,
        placeholder: "Velg roller",
        data: group?.roles?.map((role) => ({ value: role.id, label: role.name })),
        searchable: true,
      }),
      start: createDateTimeInput({
        label: "Start",
        required: true,
      }),
      end: createDateTimeInput({
        label: "Slutt",
        clearable: true,
      }),
    },
  })
}
