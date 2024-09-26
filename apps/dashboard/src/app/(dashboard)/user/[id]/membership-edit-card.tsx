import { UserMembershipSchema } from "@dotkomonline/types"
import type { FC } from "react"
import { useUpdateUserMutation } from "../../../../modules/user/mutations"
import { useUserMembershipEditForm } from "./membership-edit-form"
import { useUserDetailsContext } from "./provider"

export const MembershipEditCard: FC = () => {
  const { user } = useUserDetailsContext()
  const update = useUpdateUserMutation()

  const EditUserMembershipComponent = useUserMembershipEditForm({
    label: user.membership === undefined ? "Opprett medlemskap" : "Oppdater medlemskap",
    onSubmit: (data) => {
      const result = UserMembershipSchema.parse(data)

      update.mutate({
        input: { membership: result },
        id: user.id,
      })
    },
    defaultValues: { ...user.membership },
  })

  return (
    <>
      <EditUserMembershipComponent />
    </>
  )
}
