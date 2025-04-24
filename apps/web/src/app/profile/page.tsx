import { auth } from "@/auth"
import { ProfilePoster } from "@/components/views/ProfileView"
import { server } from "@/utils/trpc/server"
import { redirect } from "next/navigation"

export default async function ProfilePage() {
  const session = await auth.getServerSession()

  if (session === null) {
    redirect("/")
  }

  const user = await server.user.getMe.query()

  return <ProfilePoster user={user} />
}
