import { auth } from "@/auth"
import { server } from "@/utils/trpc/server"
import { redirect } from "next/navigation"
import type { NextRequest } from "next/server"

export async function GET(req: NextRequest) {
  const session = await auth.getServerSession()

  if (!session) {
    redirect("/")
  }
  const user = await server.user.getMe.query()

  if (!user.profileSlug) {
    redirect("/")
  }

  redirect(`/profil/${user.profileSlug}${req.nextUrl.search}`)
}
