import { SettingsPassword } from "@/components/views/SettingsView/components"
import type { User } from "@dotkomonline/types"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"

const PasswordPage = async () => {
  const session = await getServerSession()

  if (session === null) {
    redirect("/")
  }

  return <SettingsPassword user={session.user as User} />
}

export default PasswordPage
