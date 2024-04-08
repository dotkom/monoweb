import { SettingsPrivacy } from "@/components/views/SettingsView/components"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"

const PrivacyPage = async () => {
  const session = await getServerSession()

  if (session === null) {
    redirect("/")
  }

  return <SettingsPrivacy />
}

export default PrivacyPage
