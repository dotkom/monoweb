import { ProfilePoster } from "@/components/views/ProfileView"
import { server } from "@/utils/trpc/server"

export default async function ProfilePage() {
  const user = await server.user.getMe.query()

  return <ProfilePoster user={user} />
}
