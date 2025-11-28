import { ProfilePage } from "@/app/profil/[profileSlug]/ProfilePage"
import { env } from "@/env"
import { server } from "@/utils/trpc/server"
import type { Metadata } from "next"

interface ProfilePageProps {
  params: Promise<{
    profileSlug: string
  }>
}

export default function Page({ params }: ProfilePageProps) {
  return <ProfilePage />
}

// TODO: we really should have privacy settings
// Do not provide profile picture or any other user-generated content, like biography.
export async function generateMetadata({ params }: Pick<ProfilePageProps, "params">): Promise<Metadata> {
  const { profileSlug } = await params

  const user = await server.user.findByProfileSlug.query(profileSlug)

  if (!user) {
    return {
      title: "Bruker ikke funnet | Linjeforeningen Online",
      description: "Profilen finnes ikke eller er ikke offentlig tilgjengelig.",
    }
  }

  const name = user.name || user.profileSlug
  const description = `Profilside for ${name} hos Linjeforeningen Online.`
  const groupPageUrl = `${env.NEXT_PUBLIC_ORIGIN}/profil/${profileSlug}`

  return {
    title: name,
    description,
    openGraph: {
      title: name,
      description,
      url: groupPageUrl,
      siteName: "Linjeforeningen Online",
    },
    twitter: {
      card: "summary",
      title: name,
      description,
    },
  }
}
