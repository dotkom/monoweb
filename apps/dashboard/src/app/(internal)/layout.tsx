import { auth } from "@/lib/auth"
import { env } from "@/lib/env"
import { server } from "@/lib/trpc-server"
import { redirect } from "next/navigation"
import type { PropsWithChildren } from "react"

export default async function Layout({ children }: PropsWithChildren) {
  const session = await auth.getServerSession()
  if (session === null) {
    return redirect("/login")
  }

  const isStaff = await server.user.isStaff.query()
  if (!isStaff) {
    return redirect(env.NEXT_PUBLIC_WEB_URL)
  }

  return children
}
