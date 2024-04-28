import { SettingsPassword } from "@/components/views/SettingsView/components"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"

const PasswordPage = async () => {
  const session = await getServerSession()

  if (session === null) {
    redirect("/")
  }

  return <SettingsPassword />
}

export default PasswordPage
