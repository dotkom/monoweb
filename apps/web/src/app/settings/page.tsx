import SettingsProfile from "@/components/views/SettingsView/components/SettingsProfile"
import { getServerClient } from "@/utils/trpc/serverClient"
import { authOptions } from "@dotkomonline/auth/src/web.app"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"

const SettingsPage = async () => {
  const trpc = await getServerClient()
  const session = await getServerSession(authOptions)

  if (session === null) {
    redirect("/")
  }

  const user = await trpc.user.getMe()

  if (user === null) {
    redirect("/onboarding")
  }

  return <div className="px-4">
    <SettingsProfile user={user} />
  </div>
}

export default SettingsPage
