import { RedirectType, permanentRedirect } from "next/navigation"

export default async function SettingsPage() {
  permanentRedirect("/innstillinger/profil", RedirectType.replace)
}
