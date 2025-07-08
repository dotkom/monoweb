"use client"

import { Landing } from "@/components/views/SettingsView/components/SettingsLanding"
import { useTRPC } from "@/utils/trpc/client"
import { redirect } from "next/navigation"

import { useQuery } from "@tanstack/react-query"

export default function SettingsPage() {
  const trpc = useTRPC()
  const { data: user, isLoading } = useQuery(trpc.user.getMe.queryOptions())

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!user) {
    redirect("/")
  }

  return <Landing user={user} />
}
