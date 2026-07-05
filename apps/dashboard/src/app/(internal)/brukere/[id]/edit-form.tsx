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
} from "@dotkomonline/rpc/user"
import { createTextareaInput } from "@/components/forms/TextareaInput"
import { useAuthorization } from "@/auth/authorization-context"

interface UseUserProfileWriteFormProps {
  onSubmit(data: UserWrite): void
  defaultValues?: Partial<UserWrite>
  label?: string
  disabled?: boolean
}

export const useUserProfileEditForm = ({
  defaultValues,
  onSubmit,
  label = "Bruker",
  disabled,
}: UseUserProfileWriteFormProps) => {
  const { isAdministrator } = useAuthorization()
  const fileUpload = useUserFileUploadMutation()

  return useFormBuilder({
    schema: UserWriteSchema,
    onSubmit,
    defaultValues,
    label,
    disabled,
    fields: {
      username: createTextInput({
        label: "Brukernavn",
        placeholder: "Ola",
      }),
      name: createTextInput({
        label: "Navn",
        placeholder: "Ola Nordmann",
        disabled: disabled || !isAdministrator,
      }),
      email: createTextInput({
        label: "E-post",
        placeholder: "ola.nordmann@gmail.com",
        disabled: disabled || !isAdministrator,
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
