import ProfilePoster from "@/components/views/ProfileView"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"

const ProfilePage = async () => {
  const session = await getServerSession()

  if (session === null) {
    redirect("/")
  }

  return <ProfilePoster user={session.user} />
}

export default ProfilePage
