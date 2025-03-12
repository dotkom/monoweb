"use client"
import { SettingsLanding } from "@/components/views/SettingsView/components"
import { useTRPC } from "@/utils/trpc/client"
import { redirect } from "next/navigation"

import { useQuery } from "@tanstack/react-query"

const SettingsPage = () => {
  const trpc = useTRPC()
  const { data: user } = useQuery(trpc.user.getMe.queryOptions())

  if (user === null) {
    redirect("/")
  }

  if (user === undefined) {
    return <div>Loading...</div>
  }

  return <SettingsLanding user={user} />
}

export default SettingsPage
