import { auth } from "@/auth"
import { server } from "@/utils/trpc/server"
import { redirect } from "next/navigation"

export default async function Page() {
  const session = await auth.getServerSession()

  if (!session) {
    redirect("/")
  }

  const user = await server.user.getMe.query()

  if (!user.profileSlug) {
    return redirect("/")
  }

  redirect(`/profil/${user.profileSlug}`)
}
