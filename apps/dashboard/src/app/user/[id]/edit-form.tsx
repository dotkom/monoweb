import { createCheckboxInput } from "@/components/forms/CheckboxInput"
import { useFormBuilder } from "@/components/forms/Form"
import { createSelectInput } from "@/components/forms/SelectInput"
import { createTextInput } from "@/components/forms/TextInput"
import { type UserWrite, UserWriteSchema } from "@dotkomonline/types"

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
        placeholder: "Nordmann",
      }),
      phone: createTextInput({
        label: "Telefon",
        placeholder: "+4712345678",
      }),
      gender: createSelectInput({
        label: "Kjønn",
        data: [
          { label: "Mann", value: "male" },
          { label: "Kvinne", value: "female" },
          { label: "Annet", value: "other" },
          { label: "Ikke oppgitt", value: "unknown" },
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
    },
  })
