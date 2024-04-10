import { SettingsLanding } from "@/components/views/SettingsView/components"
import { web as authOptions } from "@dotkomonline/auth"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"

const SettingsPage = async () => {
  const session = await getServerSession(authOptions)

  if (session === null) {
    redirect("/")
  }

  return <SettingsLanding user={session.user} />
}

export default SettingsPage
