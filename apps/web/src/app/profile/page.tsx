import ProfilePoster from "@/components/views/ProfileView"
import { server } from "@/utils/trpc/server"

const ProfilePage = async () => {
  const user = await server.user.getMe.query()

  return <ProfilePoster user={user} />
}

export default ProfilePage
