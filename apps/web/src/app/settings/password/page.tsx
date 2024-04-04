import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { SettingsPassword } from "@/components/views/SettingsView/components"
import { User } from "@dotkomonline/types"

const PasswordPage = async () => {
  const session = await getServerSession()

  if (session === null) {
    redirect("/")
  }

  return <SettingsPassword user={session.user as User} />
}

export default PasswordPage
