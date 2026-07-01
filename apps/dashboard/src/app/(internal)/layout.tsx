import { getServerSession } from "@/lib/auth"
import { env } from "@/lib/env"
import { getServerAuthorization } from "@/lib/server-authorization"
import { redirect } from "next/navigation"
import type { PropsWithChildren } from "react"

export default async function Layout({ children }: PropsWithChildren) {
  const session = await getServerSession()

  if (session === null) {
    return redirect("/login")
  }

  const { isCommitteeMember } = await getServerAuthorization()

  if (!isCommitteeMember) {
    return redirect(env.NEXT_PUBLIC_WEB_URL)
  }

  return children
}
