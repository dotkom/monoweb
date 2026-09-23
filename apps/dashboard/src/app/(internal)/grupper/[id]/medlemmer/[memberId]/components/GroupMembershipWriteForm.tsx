"use client"

import { DateTimePickerField } from "@/components/forms/DateTimePickerField"
import { MultiSelectField } from "@/components/forms/MultiSelectField"
import { Form } from "@/components/forms/new-form/Form"
import { type GroupId, GroupMembershipWriteSchema, GroupRoleSchema } from "@dotkomonline/rpc/group"
import { Button, Text } from "@dotkomonline/ui"
import { zodResolver } from "@hookform/resolvers/zod"
import { isBefore, isFuture } from "date-fns"
import { useForm } from "react-hook-form"
import type z from "zod"
import { useGroupGetQuery } from "@/app/(internal)/grupper/queries"

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

interface GroupMembershipWriteFormProps {
  onSubmit(data: FormResult): void
  defaultValues?: Partial<FormResult>
  submitLabel?: string
  groupId: GroupId
  allowEditEndDate?: boolean
}

export const GroupMembershipWriteForm = ({
  onSubmit,
  submitLabel = "Lagre",
  defaultValues,
  groupId,
  allowEditEndDate,
}: GroupMembershipWriteFormProps) => {
  const { data: group } = useGroupGetQuery(groupId)

  const form = useForm<FormResult>({
    resolver: zodResolver(FormSchema),
    defaultValues,
  })

  return (
    <Form form={form} onSubmit={onSubmit}>
      <MultiSelectField
        control={form.control}
        name="roleIds"
        label="Roller"
        required
        placeholder="Velg roller"
        options={(group?.roles ?? []).map((role) => ({ value: role.id, label: role.name }))}
      />
      <DateTimePickerField control={form.control} name="start" label="Start" required />
      {allowEditEndDate ? (
        <DateTimePickerField control={form.control} name="end" label="Slutt" />
      ) : (
        <Text className="text-sm text-muted-foreground">Sluttdato kan ikke endres for et aktivt medlemskap</Text>
      )}
      <Button type="submit" variant="default" className="w-fit">
        {submitLabel}
      </Button>
    </Form>
  )
}
