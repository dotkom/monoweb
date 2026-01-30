import { ProfilePage } from "@/app/profil/[profileSlug]/ProfilePage"
import type { Metadata } from "next"
import { forbidden } from "next/navigation"

export default function Page() {
  return <ProfilePage />
}

export async function generateMetadata(): Promise<Metadata> {
  throw forbidden()
}
