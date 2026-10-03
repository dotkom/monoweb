import { getServerSession } from "@/auth"
import { server } from "@/utils/trpc/server"
import { createAuthorizeUrl } from "@dotkomonline/utils"
import { redirect } from "next/navigation"
import type { NextRequest } from "next/server"

export async function GET(req: NextRequest) {
  const session = await getServerSession()

  if (!session) {
    const params = new URLSearchParams(req.nextUrl.search)
    if (!params.has("returnTo")) {
      params.set("returnTo", "/profil")
    }
    redirect(createAuthorizeUrl(params))
  }

  let user: Awaited<ReturnType<typeof server.user.findMe.query>> = null

  try {
    user = await server.user.findMe.query()
  } catch (error) {
    console.error("[web:profil] failed to load user", error)
    redirect(createAuthorizeUrl({ returnTo: "/profil" }))
  }

  if (user === null) {
    redirect(createAuthorizeUrl({ returnTo: "/profil" }))
  }

  if (!user.username) {
    redirect("/")
  }

  redirect(`/profil/${user.username}${req.nextUrl.search}`)
}
