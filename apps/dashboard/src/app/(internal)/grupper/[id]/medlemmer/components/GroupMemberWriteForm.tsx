"use client"

import { MultiSelectField } from "@/components/forms/MultiSelectField"
import { Form } from "@/components/forms/new-form/Form"
import { type GroupId, GroupRoleSchema } from "@dotkomonline/rpc/group"
import { Button } from "@dotkomonline/ui"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import z from "zod"
import { useGroupGetQuery } from "@/app/(internal)/grupper/queries"

const FormSchema = z.object({
  roleIds: GroupRoleSchema.shape.id.array().min(1, "Minst én rolle må være valgt"),
})

type FormResult = z.infer<typeof FormSchema>

interface GroupMemberWriteFormProps {
  onSubmit(data: FormResult): void
  defaultValues?: Partial<FormResult>
  submitLabel?: string
  groupId: GroupId
  disabled?: boolean
}

export const GroupMemberWriteForm = ({
  onSubmit,
  submitLabel = "Lagre",
  defaultValues,
  groupId,
  disabled,
}: GroupMemberWriteFormProps) => {
  const { data: group } = useGroupGetQuery(groupId)

  const form = useForm<FormResult>({
    resolver: zodResolver(FormSchema),
    defaultValues,
    disabled,
  })

  return (
    <Form form={form} onSubmit={onSubmit}>
      <MultiSelectField
        control={form.control}
        name="roleIds"
        description='Du trenger ikke velge "Medlem" dersom du velger en annen rolle'
        label="Roller"
        required
        placeholder="Velg roller"
        options={(group?.roles ?? []).map((role) => ({ value: role.id, label: role.name }))}
      />

      <Button type="submit" variant="default" className="w-fit" disabled={form.formState.disabled}>
        {submitLabel}
      </Button>
    </Form>
  )
}
