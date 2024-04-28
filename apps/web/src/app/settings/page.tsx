import { SettingsLanding } from "@/components/views/SettingsView/components"
import { authOptions } from "@dotkomonline/auth/src/web.app"
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
