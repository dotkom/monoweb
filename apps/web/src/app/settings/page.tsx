import { ExistingProfile } from "@/components/views/SettingsView/components"
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

  return <ExistingProfile user={user} />
}

export default SettingsPage
