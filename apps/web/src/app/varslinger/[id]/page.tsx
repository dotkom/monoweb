import { getServerSession } from "@/auth"
import { createAuthorizeUrl } from "@dotkomonline/utils"
import { redirect } from "next/navigation"

interface NotificationDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function Page({ params }: NotificationDetailPageProps) {
  const { id } = await params
  const session = await getServerSession()

  if (session === null) {
    redirect(createAuthorizeUrl({ returnTo: `/varslinger/${encodeURIComponent(id)}` }))
  }

  return null
}
