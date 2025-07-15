import { ProfileInfoBox } from "@/components/organisms/ProfileComponents/ProfileInfoBox"
import type { User } from "@dotkomonline/types"
import type { NextPage } from "next"

export const ProfilePoster: NextPage<{ user: User }> = ({ user }) => {
  return (
    <div className="min-h-screen">
      <div className="border-gray-600 left-0 z-0 w-full border-b">
        <div className="flex flex-row gap-96">
          <div className="flex flex-col">
            <p className="text-3xl font-bold border-b-0">Min profil</p>
            <p className="text-gray-800 pt-2">Oversikt over din profil</p>
          </div>
        </div>
      </div>

      <ProfileInfoBox user={user} />
    </div>
  )
}
