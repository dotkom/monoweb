import { UserWriteSchema } from "@dotkomonline/types"
import type { FC } from "react"
import { useUpdateUserMutation } from "../../../../modules/user/mutations"
import { useUserWriteForm } from "../write-form"
import { useUserDetailsContext } from "./provider"

export const UserEditCard: FC = () => {
  const { user } = useUserDetailsContext()
  const update = useUpdateUserMutation()

  const FormComponent = useUserWriteForm({
    label: "Oppdater bruker",
    onSubmit: (data) => {
      const result = UserWriteSchema.parse(data)
      update.mutate({
        data: result,
      })
    },
    defaultValues: { ...user },
  })
  return <FormComponent />
}
