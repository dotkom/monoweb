import { ProfileInfoBox } from "@/components/organisms/ProfileComponents/ProfileInfoBox"
import type { User } from "@dotkomonline/types"
import { Title } from "@dotkomonline/ui"
import type { NextPage } from "next"

export const ProfilePoster: NextPage<{ user: User }> = ({ user }) => {
  return (
    <div className="flex flex-col">
      <Title size="xl" className="text-3xl">
        Min profil
      </Title>

      <ProfileInfoBox user={user} />
    </div>
  )
}
