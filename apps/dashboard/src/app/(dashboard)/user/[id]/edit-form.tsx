import { type UserWrite, UserWriteSchema } from "@dotkomonline/types"
import { createCheckboxInput, createSelectInput, createTextInput, useFormBuilder } from "../../../form"

interface UseUserProfileWriteFormProps {
  onSubmit(data: UserWrite): void
  defaultValues?: Partial<UserWrite>
  label?: string
}

export const useUserProfileEditForm = ({ defaultValues, onSubmit, label = "Bruker" }: UseUserProfileWriteFormProps) =>
  useFormBuilder({
    schema: UserWriteSchema,
    onSubmit,
    defaultValues,
    label,
    fields: {
      firstName: createTextInput({
        label: "Fornavn",
        placeholder: "Ola",
      }),
      lastName: createTextInput({
        label: "Etternavn",
        placeholder: "Ola",
      }),
      phone: createTextInput({
        label: "Telefon",
        placeholder: "12345678",
      }),
      gender: createSelectInput({
        label: "Kjønn",
        data: [
          { label: "Mann", value: "male" },
          { label: "Kvinne", value: "female" },
          { label: "Annet", value: "other" },
        ],
      }),
      allergies: createTextInput({
        label: "Allergier",
        placeholder: "Melk, nøtter, gluten",
      }),
      rfid: createTextInput({
        label: "RFID",
        placeholder: "123456",
      }),
      compiled: createCheckboxInput({
        label: "Kompilert",
      }),
      address: createTextInput({
        label: "Adresse",
        placeholder: "Osloveien 1, 0001 Oslo",
      }),
    },
  })
