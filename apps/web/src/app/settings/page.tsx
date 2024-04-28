import { SettingsLanding } from "@/components/views/SettingsView/components"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"

const SettingsPage = async () => {
  const session = await getServerSession()

  if (session === null) {
    redirect("/")
  }

  return <SettingsLanding user={session.user} />
}

export default SettingsPage
