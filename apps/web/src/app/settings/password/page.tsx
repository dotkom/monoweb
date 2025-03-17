import { auth } from "@/auth"
import { SettingsPassword } from "@/components/views/SettingsView/components"
import { redirect } from "next/navigation"

const PasswordPage = async () => {
  const session = await auth()
  if (session === null) {
    redirect("/")
  }

  return <SettingsPassword />
}

export default PasswordPage
