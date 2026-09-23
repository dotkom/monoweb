"use client"

import { useAuthorization } from "@/auth/authorization-context"
import { Form } from "@/components/forms/Form"
import { ImageUploadModalField } from "@/components/forms/ImageUploadModalField"
import { SelectField } from "@/components/forms/SelectField"
import { TextField } from "@/components/forms/TextField"
import { TextareaField } from "@/components/forms/TextareaField"
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

type FormInput = z.input<typeof UserWriteSchema>
type FormResult = z.output<typeof UserWriteSchema>

const genderOptions = GenderSchema.options.map((option) => ({
  value: option,
  label: getGenderName(option),
}))

interface UserEditFormProps {
  onSubmit(data: UserWrite): void
  defaultValues?: Partial<UserWrite>
  submitLabel?: string
  disabled?: boolean
}

export function UserEditForm({
  onSubmit,
  submitLabel = "Oppdater profil",
  defaultValues,
  disabled,
}: UserEditFormProps) {
  const { isAdministrator } = useAuthorization()
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
        disabled={disabled || !isAdministrator}
      />
      <TextField
        control={control}
        name="email"
        label="E-post"
        type="email"
        placeholder="ola.nordmann@gmail.com"
        required
        disabled={disabled || !isAdministrator}
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
      />
      <Button type="submit" variant="default" className="w-fit" disabled={disabled}>
        {submitLabel}
      </Button>
    </Form>
  )
}
