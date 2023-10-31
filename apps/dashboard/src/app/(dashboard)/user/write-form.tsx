import { type UserWrite, UserWriteSchema } from "@dotkomonline/types"
import { createTextInput, useFormBuilder } from "../../form"

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
        label: "Cognito Sub",
        placeholder: "Enter Cognito Sub ID",
        withAsterisk: true,
      }),
    },
  })
