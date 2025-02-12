import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import type { PropsWithChildren } from "react"
import { authOptions } from "../../pages/api/auth/[...nextauth]"
import { ApplicationShell } from "../ApplicationShell"

export const dynamic = "force-dynamic"

export default async function DashboardLayout({ children }: PropsWithChildren) {
  const session = await getServerSession(authOptions)
  if (session === null) {
    redirect("/")
  }
  return <ApplicationShell>{children}</ApplicationShell>
}
