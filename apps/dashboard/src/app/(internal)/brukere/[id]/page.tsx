"use client"

import { useUserEditPermission } from "@/hooks/use-user-edit-permission"
import { UserWriteSchema } from "@dotkomonline/rpc/user"
import { Title } from "@dotkomonline/ui"
import { useUpdateUserMutation } from "../mutations"
import { UserEditForm } from "./components/UserEditForm"
import { WorkspaceLinkCard } from "./components/WorkspaceLinkCard"
import { useUserDetailsContext } from "./provider"

export default function UserInfoPage() {
  const { user } = useUserDetailsContext()
  const { canEdit } = useUserEditPermission()
  const update = useUpdateUserMutation()

  return (
    <div className="flex flex-col gap-4">
      <Title element="h2" className="text-2xl font-semibold">
        Profil
      </Title>

      <WorkspaceLinkCard />

      <UserEditForm
        disabled={!canEdit}
        defaultValues={{ ...user }}
        onSubmit={(data) => {
          const result = UserWriteSchema.parse(data)

          if (result.phone === "") {
            result.phone = null
          }

          update.mutate({
            input: result,
            id: user.id,
          })
        }}
      />
    </div>
  )
}
