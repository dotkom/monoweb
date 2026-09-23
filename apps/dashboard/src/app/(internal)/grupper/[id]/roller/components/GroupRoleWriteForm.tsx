"use client"

import { Form } from "@/components/forms/Form"
import { SelectField } from "@/components/forms/SelectField"
import { TextField } from "@/components/forms/TextField"
import { getGroupRoleTypeName, GroupRoleTypeEnum, GroupRoleWriteSchema } from "@dotkomonline/rpc/group"
import { Button } from "@dotkomonline/ui"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, type UseFormReturn } from "react-hook-form"
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

type FormInput = z.input<typeof FormSchema>
type FormResult = z.output<typeof FormSchema>

interface GroupRoleWriteFormProps {
  onSubmit(data: FormResult): void
  defaultValues?: Partial<FormResult>
  submitLabel?: string
  disabled?: boolean
}

export const GroupRoleWriteForm = ({
  onSubmit,
  submitLabel = "Lagre",
  defaultValues,
  disabled,
}: GroupRoleWriteFormProps) => {
  const form = useForm<FormInput, unknown, FormResult>({
    resolver: zodResolver(FormSchema),
    defaultValues,
    disabled,
  })

  return (
    <Form form={form as UseFormReturn<FormResult>} onSubmit={onSubmit}>
      <TextField control={form.control} name="name" label="Navn" placeholder="Vinstraffansvarlig" required />
      <SelectField
        control={form.control}
        name="type"
        label="Type"
        placeholder="Velg en"
        required
        options={Object.values(GroupRoleTypeEnum).map((groupRoleType) => ({
          value: groupRoleType,
          label: getGroupRoleTypeName(groupRoleType),
        }))}
      />
      <Button type="submit" variant="default" className="w-fit" disabled={form.formState.disabled}>
        {submitLabel}
      </Button>
    </Form>
  )
}
