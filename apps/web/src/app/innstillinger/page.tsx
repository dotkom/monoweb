import { Landing } from "@/components/views/SettingsView/components/SettingsLanding"
import { server } from "@/utils/trpc/server"
import { redirect } from "next/navigation"

export default async function SettingsPage() {
  const user = await server.user.getMe.query()

  if (user === null) {
    redirect("/")
  }

  if (user === undefined) {
    return <div>Loading...</div>
  }

  return <Landing user={user} />
}
