import { createIntegerSelectInput, createSelectInput, createTextInput, useFormBuilder } from "../../form"
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
      studyYear: createIntegerSelectInput({
        label: "Study Year",
        placeholder: "Select Study Year",
        withAsterisk: true,
        data: [
          { value: -1, label: "Ingen medlemskap" },
          { value: 0, label: "Sosialt medlem" },
          { value: 1, label: "1.Klasse" },
          { value: 2, label: "2.Klasse" },
          { value: 3, label: "3.Klasse" },
          { value: 4, label: "4.Klasse" },
          { value: 5, label: "5.Klasse" },
          { value: 6, label: "PhD" },
        ],
      }),
    },
  })
}
