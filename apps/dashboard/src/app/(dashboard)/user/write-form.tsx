import { createTextInput, useFormBuilder } from "../../form"
import { UserWrite, UserWriteSchema } from "@dotkomonline/types"

const USER_FORM_DEFAULT_VALUES: Partial<UserWrite> = {
  cognitoSub: undefined,
}

type UseUserWriteFormProps = {
  onSubmit: (data: UserWrite) => void
  defaultValues?: Partial<UserWrite>
  label?: string
}

export const useUserWriteForm = ({
  onSubmit,
  label = "Edit User",
  defaultValues = USER_FORM_DEFAULT_VALUES,
}: UseUserWriteFormProps) => {
  return useFormBuilder({
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
}
