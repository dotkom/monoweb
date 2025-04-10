"use client"

import { Landing } from "@/components/views/SettingsView/components/SettingsLanding"
import { useTRPC } from "@/utils/trpc/client"
import { redirect } from "next/navigation"

import { useQuery } from "@tanstack/react-query"

export default function SettingsPage() {
  const trpc = useTRPC()
  const { data: user } = useQuery(trpc.user.getMe.queryOptions())

  if (user === null) {
    redirect("/")
  }

  if (user === undefined) {
    return <div>Loading...</div>
  }

  return <Landing user={user} />
}
