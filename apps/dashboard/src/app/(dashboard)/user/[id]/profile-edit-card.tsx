import { UserProfileSchema } from "@dotkomonline/types"
import type { FC } from "react"
import { useUpdateUserMutation } from "../../../../modules/user/mutations"
import { useUserProfileEditForm } from "./profile-edit-form"
import { useUserDetailsContext } from "./provider"

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
        input: { profile: result },
        id: user.id,
      })
    },
    defaultValues: { ...user.profile },
  })

  return <EditUserProfileComponent />
}
