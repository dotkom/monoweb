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
      name: createTextInput({
        label: "Navn",
        placeholder: "Ola Nordmann",
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
      dietaryRestrictions: createTextInput({
        label: "Allergier",
        placeholder: "Melk, nøtter, gluten",
      }),
    },
  })
