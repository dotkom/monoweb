import { getServerSession } from "next-auth"
import { ProfileLanding } from "@/components/views/ProfileView/components"
import { redirect } from "next/navigation"

const ProfilePage = async () => {
  const session = await getServerSession()

  if (session === null) {
    redirect("/")
  }

  return <ProfileLanding user={session.user} />
}

export default ProfilePage
