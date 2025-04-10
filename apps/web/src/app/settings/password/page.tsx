import { auth } from "@/auth"
import { SettingsPassword } from "@/components/views/SettingsView/components/SettingsPassword"
import { redirect } from "next/navigation"

export default async function PasswordPage() {
  const session = await auth.getServerSession()
  if (session === null) {
    redirect("/")
  }

  return <SettingsPassword />
}
