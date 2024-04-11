import { type UserCreate as UserUpdate, UserUpdateSchema } from "@dotkomonline/types"
import { createTagInput, createTextInput, useFormBuilder } from "../../form"

interface UseUserWriteFormProps {
  onSubmit(data: UserUpdate): void
  defaultValues?: Partial<UserUpdate>
  label?: string
}

export const useUserWriteForm = ({ defaultValues, onSubmit, label = "Bruker" }: UseUserWriteFormProps) =>
  useFormBuilder({
    schema: UserUpdateSchema,
    onSubmit,
    defaultValues,
    label,
    fields: {
      name: createTextInput({
        label: "Navn",
        placeholder: "Kari mellomnavn Dahl",
        withAsterisk: true,
      }),
      givenName: createTextInput({
        label: "Fornavn",
        placeholder: "Kari",
        withAsterisk: true,
      }),
      familyName: createTextInput({
        label: "Etternavn",
        placeholder: "Dahl",
        withAsterisk: true,
      }),
      phoneNumber: createTextInput({
        label: "Kontakttelefon",
        placeholder: "+47 123 45 678",
        type: "tel",
      }),
      profilePicture: createTextInput({
        label: "Bildelenke til logo",
      }),
      allergies: createTagInput({
        label: "Allergier",
        placeholder: "Gluten",
      }),
      studyYear: createTextInput({
        label: "Studieår",
        placeholder: "2",
        type: "number",
      }),
      gender: createTextInput({
        label: "Kjønn",
        placeholder: "Kvinne",
      }),
    },
  })
