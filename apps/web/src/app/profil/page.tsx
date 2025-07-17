import { auth } from "@/auth"
import { server } from "@/utils/trpc/server"
import { redirect } from "next/navigation"

export default async function ProfilePage() {
  const session = await auth.getServerSession()
  if (session) {
    const user = await server.user.getMe.query()
    redirect(`/profil/${user.profileSlug}`)
  } else {
    redirect("/")
  }
}
