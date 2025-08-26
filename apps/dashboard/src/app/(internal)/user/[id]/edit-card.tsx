import { UserWriteSchema } from "@dotkomonline/types"
import { Title } from "@mantine/core"
import type { FC } from "react"
import { useUpdateUserMutation } from "../mutations"
import { useUserProfileEditForm } from "./edit-form"
import { useUserDetailsContext } from "./provider"

export const UserEditCard: FC = () => {
  const { user } = useUserDetailsContext()
  const update = useUpdateUserMutation()

  const EditUserProfileComponent = useUserProfileEditForm({
    label: "Oppdater profil",
    onSubmit: (data) => {
      const result = UserWriteSchema.parse(data)

      if (result.phone === "") {
        result.phone = null
      }

      update.mutate({
        input: result,
        id: user.id,
      })
    },
    defaultValues: { ...user },
  })

  return (
    <>
      <Title>Profil</Title>
      <EditUserProfileComponent />
    </>
  )
}
