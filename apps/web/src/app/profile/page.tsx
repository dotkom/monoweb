import ProfilePoster from "@/components/views/ProfileView"
import { authOptions } from "@dotkomonline/auth/src/web.app"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"

const ProfilePage = async () => {
  const session = await getServerSession(authOptions)

  if (session === null) {
    redirect("/")
  }

  return <ProfilePoster user={session.user} />
}

export default ProfilePage
