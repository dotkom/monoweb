import { auth } from "@/auth"
import { SettingsPrivacy } from "@/components/views/SettingsView/components"
import { redirect } from "next/navigation"

const PrivacyPage = async () => {
  const session = await auth()
  if (session === null) {
    redirect("/")
  }

  return <SettingsPrivacy />
}

export default PrivacyPage
