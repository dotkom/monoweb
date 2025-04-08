import { auth } from "@/auth"
import ProfilePoster from "@/components/views/ProfileView"
import { redirect } from "next/navigation"

const ProfilePage = async () => {
  const session = await auth.getServerSession()
  if (session === null) {
    redirect("/")
  }

  return (
    <>
      <ProfilePoster user={session} />
    </>
  )
}

export default ProfilePage
