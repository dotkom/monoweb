import { UserUpdateSchema } from "@dotkomonline/types"
import type { FC } from "react"
import { useUpdateUserMutation } from "../../../../modules/user/mutations"
import { useUserWriteForm } from "../write-form"
import { useUserDetailsContext } from "./provider"

export const UserEditCard: FC = () => {
  const { user } = useUserDetailsContext()
  const update = useUpdateUserMutation()

  const { email, emailVerified, createdAt, updatedAt, auth0Id, ...rest } = user

  const FormComponent = useUserWriteForm({
    label: "Oppdater bruker",
    onSubmit: (data) => {
      const result = UserUpdateSchema.parse(data)
      update.mutate({ auth0Id: user.auth0Id, data: result })
    },
    defaultValues: { ...rest },
  })
  return <FormComponent />
}
