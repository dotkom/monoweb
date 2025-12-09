import { permanentRedirect, RedirectType } from "next/navigation"

export default async function SettingsPage() {
  permanentRedirect("/innstillinger/profil", RedirectType.replace)
}
