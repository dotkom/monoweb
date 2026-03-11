import { useUserFileUploadMutation } from "@/app/(internal)/brukere/mutations"
import { useFormBuilder } from "@/components/forms/Form"
import { createImageInput } from "@/components/forms/ImageInput"
import { createSelectInput } from "@/components/forms/SelectInput"
import { createTextInput } from "@/components/forms/TextInput"
import { USER_IMAGE_MAX_SIZE_KIB, type UserWrite, UserWriteSchema } from "@dotkomonline/types"
import { createTextareaInput } from "@/components/forms/TextareaInput"

interface UseUserProfileWriteFormProps {
  onSubmit(data: UserWrite): void
  defaultValues?: Partial<UserWrite>
  label?: string
}

export const useUserProfileEditForm = ({ defaultValues, onSubmit, label = "Bruker" }: UseUserProfileWriteFormProps) => {
  const fileUpload = useUserFileUploadMutation()

  return useFormBuilder({
    schema: UserWriteSchema,
    onSubmit,
    defaultValues,
    label,
    fields: {
      profileSlug: createTextInput({
        label: "Brukernavn",
        placeholder: "Ola",
      }),
      name: createTextInput({
        label: "Navn",
        placeholder: "Ola Nordmann",
      }),
      email: createTextInput({
        label: "E-post",
        placeholder: "ola.nordmann@gmail.com",
      }),
      phone: createTextInput({
        label: "Telefon",
        placeholder: "+47 123 45 678",
      }),
      gender: createSelectInput({
        label: "Kjønn",
        data: [
          { label: "Mann", value: "Mann" },
          { label: "Kvinne", value: "Kvinne" },
          { label: "Annet", value: "Annet" },
          { label: "Ikke oppgitt", value: "Ikke oppgitt" },
        ],
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
