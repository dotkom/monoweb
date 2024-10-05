import SettingsProfile from "@/components/views/SettingsView/components/SettingsProfile";
import { getServerClient } from "@/utils/trpc/serverClient";
import { authOptions } from "@dotkomonline/auth/src/web.app";
import { Button } from "@dotkomonline/ui";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function OnboardingPage() {
  const session = await getServerSession(authOptions)
  const trpc = await getServerClient()

  if (session === null) {
    redirect("/")
  }

  const user = await trpc.user.getMe()

  return <div className="lg:px-64 py-16 px-4">
    <SettingsProfile user={user} />
  </div>
}
