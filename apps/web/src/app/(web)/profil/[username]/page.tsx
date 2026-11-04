import { ProfilePage } from "@/app/profil/[username]/ProfilePage"
import { getServerSession } from "@/auth"
import { createAuthorizeUrl, createUserProfileUrl } from "@dotkomonline/utils"
import { redirect } from "next/navigation"

interface ProfilePageProps {
  params: Promise<{
    username: string
  }>
}

export default async function Page({ params }: ProfilePageProps) {
  const { username } = await params
  const session = await getServerSession()

  if (session === null) {
    redirect(createAuthorizeUrl({ returnTo: createUserProfileUrl(username) }))
  }

  return <ProfilePage />
}
