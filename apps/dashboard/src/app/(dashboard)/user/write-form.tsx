import { type UserWrite, UserWriteSchema, studyYearOptions } from "@dotkomonline/types"
import { createIntegerSelectInput, createTextInput, useFormBuilder } from "../../form"

const USER_FORM_DEFAULT_VALUES: Partial<UserWrite> = {
  auth0Sub: undefined,
}

interface UseUserWriteFormProps {
  onSubmit(data: UserWrite): void
  defaultValues?: Partial<UserWrite>
  label?: string
}

export const useUserWriteForm = ({
  onSubmit,
  label = "Edit User",
  defaultValues = USER_FORM_DEFAULT_VALUES,
}: UseUserWriteFormProps) =>
  useFormBuilder({
    schema: UserWriteSchema,
    defaultValues,
    onSubmit,
    label,
    fields: {
      auth0Sub: createTextInput({
        label: "Auth0 Bruker-ID",
        placeholder: "00000000-0000-0000-0000-000000000000",
        withAsterisk: true,
      }),
      studyYear: createIntegerSelectInput({
        label: "Studieår",
        placeholder: "Velg studieår",
        withAsterisk: true,
        data: studyYearOptions,
      }),
    },
  })
