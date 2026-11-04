"use client"

import { useAuthorization } from "@admin/auth/authorization-context"
import { Form } from "@admin/components/forms/Form"
import { ImageUploadModalField } from "@admin/components/forms/ImageUploadModalField"
import { SelectField } from "@admin/components/forms/SelectField"
import { TextField } from "@admin/components/forms/TextField"
import { TextareaField } from "@admin/components/forms/TextareaField"
import { canEditUserNameAndEmail } from "@dotkomonline/rpc/user-permissions"
import {
  GenderSchema,
  USER_IMAGE_MAX_SIZE_KIB,
  UserWriteSchema,
  getGenderName,
  type UserWrite,
} from "@dotkomonline/rpc/user"
import { Button } from "@dotkomonline/ui"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, type UseFormReturn } from "react-hook-form"
import type { z } from "zod"
import { useUserFileUploadMutation } from "../../mutations"
import type { UserId } from "@dotkomonline/rpc/user"

type FormInput = z.input<typeof UserWriteSchema>
type FormResult = z.output<typeof UserWriteSchema>

const genderOptions = GenderSchema.options.map((option) => ({
  value: option,
  label: getGenderName(option),
}))

interface UserEditFormProps {
  onSubmit(data: UserWrite): void
  defaultValues: UserWrite
  submitLabel?: string
  disabled?: boolean
  userId: UserId
}

export function UserEditForm({
  onSubmit,
  submitLabel = "Oppdater profil",
  defaultValues,
  disabled,
  userId,
}: UserEditFormProps) {
  const authorization = useAuthorization()
  const canEditNameAndEmail = canEditUserNameAndEmail(authorization, userId)
  const fileUpload = useUserFileUploadMutation()

  const form = useForm<FormInput, unknown, FormResult>({
    resolver: zodResolver(UserWriteSchema),
    defaultValues,
    disabled,
  })

  const resolvedForm = form as UseFormReturn<FormResult>
  const { control } = resolvedForm

  return (
    <Form form={resolvedForm} onSubmit={onSubmit}>
      <TextField control={control} name="username" label="Brukernavn" placeholder="Ola" required />
      <TextField
        control={control}
        name="name"
        label="Navn"
        placeholder="Ola Nordmann"
        required
        disabled={disabled || !canEditNameAndEmail}
      />
      <TextField
        control={control}
        name="email"
        label="E-post"
        type="email"
        placeholder="ola.nordmann@gmail.com"
        required
        disabled={disabled || !canEditNameAndEmail}
      />
      <TextField control={control} name="phone" label="Telefon" placeholder="+47 123 45 678" />
      <SelectField control={control} name="gender" label="Kjønn" options={genderOptions} required />
      <TextareaField
        control={control}
        name="biography"
        label="Biografi"
        placeholder="Skriv noe om brukeren..."
        rows={3}
      />
      <TextField control={control} name="dietaryRestrictions" label="Allergier" placeholder="Melk, nøtter, gluten" />
      <ImageUploadModalField
        control={control}
        name="imageUrl"
        label="Profilbilde"
        maxSizeKiB={USER_IMAGE_MAX_SIZE_KIB}
        onFileUpload={fileUpload}
        acceptGif
        aspectRatio={{ width: 1, height: 1 }}
        shape="round"
        showGrid={false}
      />
      <Button type="submit" variant="default" className="w-fit" disabled={disabled}>
        {submitLabel}
      </Button>
    </Form>
  )
}
