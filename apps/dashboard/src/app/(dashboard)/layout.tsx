import { redirect } from "next/navigation"
import type { PropsWithChildren } from "react"
import { auth } from "../../auth"
import { ApplicationShell } from "./ApplicationShell"

export const dynamic = "force-dynamic"

export default async function DashboardLayout({ children }: PropsWithChildren) {
  const session = await auth.getServerSession()
  if (session === null) {
    redirect("/")
  }
  return <ApplicationShell>{children}</ApplicationShell>
}
