import { useUserFileUploadMutation } from "@/app/(internal)/brukere/mutations"
import { useFormBuilder } from "@/components/forms/Form"
import { createImageInput } from "@/components/forms/ImageInput"
import { createSelectInput } from "@/components/forms/SelectInput"
import { createTextInput } from "@/components/forms/TextInput"
import {
  GenderSchema,
  getGenderName,
  USER_IMAGE_MAX_SIZE_KIB,
  type UserWrite,
  UserWriteSchema,
} from "@dotkomonline/types"
import { createTextareaInput } from "@/components/forms/TextareaInput"
import { useIsAdminQuery } from "../queries"

interface UseUserProfileWriteFormProps {
  onSubmit(data: UserWrite): void
  defaultValues?: Partial<UserWrite>
  label?: string
}

export const useUserProfileEditForm = ({ defaultValues, onSubmit, label = "Bruker" }: UseUserProfileWriteFormProps) => {
  const { isAdmin } = useIsAdminQuery()
  const fileUpload = useUserFileUploadMutation()

  return useFormBuilder({
    schema: UserWriteSchema,
    onSubmit,
    defaultValues,
    label,
    fields: {
      username: createTextInput({
        label: "Brukernavn",
        placeholder: "Ola",
      }),
      name: createTextInput({
        label: "Navn",
        placeholder: "Ola Nordmann",
        disabled: isAdmin !== true,
      }),
      email: createTextInput({
        label: "E-post",
        placeholder: "ola.nordmann@gmail.com",
        disabled: isAdmin !== true,
      }),
      phone: createTextInput({
        label: "Telefon",
        placeholder: "+47 123 45 678",
      }),
      gender: createSelectInput({
        label: "Kjønn",
        data: GenderSchema.options.map((option) => ({ label: getGenderName(option), value: option })),
      }),
      biography: createTextareaInput({
        label: "Biografi",
        placeholder: "Skriv noe om brukeren...",
        minRows: 2,
        maxRows: 6,
        autosize: true,
      }),
      dietaryRestrictions: createTextInput({
        label: "Allergier",
        placeholder: "Melk, nøtter, gluten",
      }),
      imageUrl: createImageInput({
        label: "Profilbilde",
        maxSizeKiB: USER_IMAGE_MAX_SIZE_KIB,
        onFileUpload: fileUpload,
        acceptGif: true,
      }),
    },
  })
}
