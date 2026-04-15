import { ProfilePage } from "@/app/profil/[username]/ProfilePage"
import { env } from "@/env"
import { server } from "@/utils/trpc/server"
import type { Metadata } from "next"

interface ProfilePageProps {
  params: Promise<{
    username: string
  }>
}

export default function Page() {
  return <ProfilePage />
}

// TODO: we really should have privacy settings
// Do not provide profile picture or any other user-generated content, like biography.
export async function generateMetadata({ params }: Pick<ProfilePageProps, "params">): Promise<Metadata> {
  const { username } = await params

  const user = await server.user.findByUsername.query(username)

  if (!user) {
    return {
      title: "Bruker ikke funnet | Linjeforeningen Online",
      description: "Profilen finnes ikke eller er ikke offentlig tilgjengelig.",
    }
  }

  const name = user.name || user.username
  const description = `Profilside for ${name} hos Linjeforeningen Online.`
  const groupPageUrl = `${env.NEXT_PUBLIC_ORIGIN}/profil/${username}`

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
    other: {
      robots: "noindex",
    },
  }
}
