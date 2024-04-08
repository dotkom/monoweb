import { authOptions } from "@dotkomonline/auth/src/web.app"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import type { PropsWithChildren } from "react"
import { ApplicationShell } from "../ApplicationShell"

export default async function DashboardLayout({ children }: PropsWithChildren) {
  const session = await getServerSession(authOptions)
  if (session === null) {
    redirect("/")
  }
  return <ApplicationShell>{children}</ApplicationShell>
}
