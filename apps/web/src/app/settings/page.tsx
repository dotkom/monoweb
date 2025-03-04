"use client"

import { SettingsLanding } from "@/components/views/SettingsView/components"
import { trpc } from "@/utils/trpc/client"
import { redirect } from "next/navigation"

const SettingsPage = () => {
  const { data: user } = trpc.user.getMe.useQuery()

  if (user === null) {
    redirect("/")
  }

  if (user === undefined) {
    return <div>Loading...</div>
  }

  return <SettingsLanding user={user} />
}

export default SettingsPage
