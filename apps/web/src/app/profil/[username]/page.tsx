import { ProfilePage } from "@/app/profil/[username]/ProfilePage"
import { getServerSession } from "@/auth"
import { createAuthorizeUrl } from "@dotkomonline/utils"
import { redirect } from "next/navigation"

interface ProfilePageProps {
  params: Promise<{
    username: string
  }>
  searchParams: Promise<{
    studentnummer?: string
  }>
}

export default async function Page({ params, searchParams }: ProfilePageProps) {
  const { username } = await params
  const { studentnummer } = await searchParams
  const session = await getServerSession()

  if (session === null) {
    redirect(createAuthorizeUrl({ returnTo: `/profil/${encodeURIComponent(username)}` }))
  }

  return <ProfilePage studentNumberLinked={studentnummer === "koblet"} />
}
