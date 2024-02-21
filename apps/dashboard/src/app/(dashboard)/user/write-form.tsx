import { type UserWrite, UserWriteSchema, studyYearOptions } from "@dotkomonline/types"
import { createIntegerSelectInput, createTextInput, useFormBuilder } from "../../form"

const USER_FORM_DEFAULT_VALUES: Partial<UserWrite> = {
  cognitoSub: undefined,
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
      cognitoSub: createTextInput({
        label: "Cognito Bruker-ID",
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
