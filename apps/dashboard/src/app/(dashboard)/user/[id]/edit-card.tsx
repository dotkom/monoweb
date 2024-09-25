import { UserProfileSchema, UserWriteSchema } from "@dotkomonline/types"
import { useState, type FC } from "react"
import { useUpdateUserMutation } from "../../../../modules/user/mutations"
import { useUserProfileEditForm } from "./profile-edit-form"
import { useUserEditForm } from "./user-edit-form"
import { useUserDetailsContext } from "./provider"
import { Button, Group, Stack, Title } from "@mantine/core"

export const UserEditCard: FC = () => {
  const { user } = useUserDetailsContext()
  const update = useUpdateUserMutation()

  const EditUserProfileComponent = useUserProfileEditForm({
    label: user.profile === undefined ? "Opprett profil" : "Oppdater profil",
    onSubmit: (data) => {
      const result = UserProfileSchema.parse(data)

      if (result.address === "") {
        result.address = null
      }
      if (result.phone === "") {
        result.phone = null
      }
      if (result.rfid === "") {
        result.rfid = null
      }

      update.mutate({
        input: {profile: result},
        id: user.id,
      })
    },
    defaultValues: { ...user.profile },
  })

  return <>
    <Title>Profil</Title>
    <EditUserProfileComponent/>
  </>
}
