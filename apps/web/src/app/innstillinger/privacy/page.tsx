import { auth } from "@/auth"
import { ProfilePrivacy } from "@/components/views/SettingsView/components/SettingsPrivacy"
import { redirect } from "next/navigation"

const PrivacyPage = async () => {
  const session = await auth.getServerSession()
  if (session === null) {
    redirect("/")
  }

  return <ProfilePrivacy />
}

export default PrivacyPage
